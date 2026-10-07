// Selective bloom. Only objects with the bloom layer enabled glow. A half-res pass draws everything else
// black (opaque meshes, so they still occlude) or hides it (lines, points, translucent meshes), blurs that,
// and the blur alone is added over the normal canvas render, so the base image is unchanged.
// CSS labels are DOM and never bloom.
import * as THREE from '../vendor/three.module.js';
import { EffectComposer } from '../vendor/EffectComposer.js';
import { RenderPass } from '../vendor/RenderPass.js';
import { UnrealBloomPass } from '../vendor/UnrealBloomPass.js';
import { FullScreenQuad } from '../vendor/Pass.js';

export function createBloom(renderer, scene, camera, { layer = 1, probe = true, strength = 0.75, radius = 0.3 } = {}) {
  const size = renderer.getSize(new THREE.Vector2());

  const composer = new EffectComposer(renderer);
  composer.renderToScreen = false;
  composer.setPixelRatio(renderer.getPixelRatio() * 0.5);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(size, strength, radius, 0);
  composer.addPass(bloomPass);

  // The pass's own composite target holds the glow without the source image under it.
  const overlay = new FullScreenQuad(new THREE.ShaderMaterial({
    uniforms: { glow: { value: bloomPass.renderTargetsHorizontal[0].texture } },
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: 'uniform sampler2D glow; varying vec2 vUv; void main() { gl_FragColor = vec4(texture2D(glow, vUv).rgb, 1.0);\n#include <colorspace_fragment>\n}',
    blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false, transparent: true,
  }));

  const bloomLayer = new THREE.Layers(); bloomLayer.set(layer);
  const black = new THREE.MeshBasicMaterial({ color: 0x000000, fog: false });
  const swapped = new Map(), hidden = [], clear = new THREE.Color();
  function darken(o) {
    if (o.layers.test(bloomLayer) || !o.visible) return;
    if (o.isMesh && !o.material.transparent) { swapped.set(o, o.material); o.material = black; }
    else if (o.isMesh || o.isLine || o.isPoints) { o.visible = false; hidden.push(o); }
  }

  // Weak-GPU guard: time the first second of frames (behind the preloader); a slow median turns bloom off for good.
  const frames = []; let frameNo = 0, last = 0, t0 = 0;
  const bloom = {
    active: true,
    render() {
      if (probe) {
        const now = performance.now();
        if (++frameNo > 3) { if (!t0) t0 = now; else frames.push(now - last); } // skip shader-compile frames
        last = now;
        if (t0 && now - t0 > 1000 && frames.length) {
          probe = false;
          frames.sort((a, b) => a - b);
          bloom.medianMs = frames[frames.length >> 1];
          if (bloom.medianMs > 22) { bloom.dispose(); renderer.render(scene, camera); return; }
        }
      }
      scene.traverse(darken);
      renderer.getClearColor(clear); const alpha = renderer.getClearAlpha();
      renderer.setClearColor(0x000000, 1);
      composer.render();
      renderer.setClearColor(clear, alpha);
      swapped.forEach((m, o) => { o.material = m; }); swapped.clear();
      for (const o of hidden) o.visible = true; hidden.length = 0;

      renderer.render(scene, camera);
      const autoClear = renderer.autoClear; renderer.autoClear = false;
      overlay.render(renderer);
      renderer.autoClear = autoClear;
    },
    setSize(w, h) { composer.setSize(w, h); },
    dispose() {
      bloom.active = false;
      composer.passes.forEach((p) => p.dispose()); composer.dispose();
      overlay.material.dispose(); overlay.dispose(); black.dispose();
    },
  };
  bloom.setSize(size.x, size.y);
  return bloom;
}
