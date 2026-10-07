// The 3D world: a continuous camera flight through connected scenes, driven by scroll.
// Built procedurally with Three.js — no asset files.
import * as THREE from '../vendor/three.module.js';
import { CSS2DRenderer, CSS2DObject } from '../vendor/CSS2DRenderer.js';
import { skills, engagements, ventures, repos, privateRepos, credentials, sections } from './data.js';

const BLUE = 0x6fb7ff, BLUE_DEEP = 0x2b6fd6, MAGENTA = 0xe34fa6, AMBER = 0xffb454, INK = 0xe8ecf5, BG = 0x070a12;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = matchMedia('(pointer: coarse)').matches;
const bloomFlag = new URLSearchParams(location.search).get('bloom'); // '0' forces off, '1' forces on (skips the GPU check)
const BLOOM = 1; // layer for objects that glow: scene cores, beacons, pulses
const glow = (o) => { o.layers.enable(BLOOM); return o; };

export function createWorld({ canvas, labelRoot, onSelect, onHover }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, isTouch ? 1.5 : 2));
  renderer.setClearColor(BG, 1);
  const labels = new CSS2DRenderer({ element: labelRoot });

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(BG, 0.016);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 400);

  scene.add(new THREE.AmbientLight(0x6c7a99, 0.5));
  const key = new THREE.PointLight(BLUE, 60, 0, 1.6); key.position.set(0, 6, 4); scene.add(key);
  const fill = new THREE.PointLight(MAGENTA, 30, 0, 1.6); fill.position.set(-8, -4, -10); scene.add(fill);

  // Materials
  const matSlab = new THREE.MeshStandardMaterial({ color: 0x141c30, metalness: 0.3, roughness: 0.55, emissive: 0x0b1020, emissiveIntensity: 0.6 });
  const matLineBlue = new THREE.LineBasicMaterial({ color: BLUE, transparent: true, opacity: 0.55 });
  const matLineDim = new THREE.LineBasicMaterial({ color: 0x3a4a6e, transparent: true, opacity: 0.5 });
  const matGlowBlue = new THREE.MeshBasicMaterial({ color: BLUE });
  const matGlowMag = new THREE.MeshBasicMaterial({ color: MAGENTA });
  const matGlowAmb = new THREE.MeshBasicMaterial({ color: AMBER });

  const pickables = []; // { object, data, label, kind }
  const pulses = [];    // { curve, mesh, t, speed }
  const spinners = [];  // objects that slowly rotate
  const nodeById = new Map();
  const quietLabels = []; // labels not attached to a pickable

  // ---------- helpers ----------
  function label(text, cls = '') {
    const el = document.createElement('div');
    el.className = 'node-label ' + cls;
    el.textContent = text;
    const o = new CSS2DObject(el);
    el.style.opacity = 0; el.style.visibility = 'hidden';
    if (cls.includes('quiet')) quietLabels.push({ o, el });
    return { o, el };
  }
  function edge(a, b, mat = matLineDim) {
    const g = new THREE.BufferGeometry().setFromPoints([a, b]);
    return new THREE.Line(g, mat);
  }
  function hex(r = 1, h = 0.22, mat = matSlab) {
    const g = new THREE.CylinderGeometry(r, r, h, 6, 1);
    const m = new THREE.Mesh(g, mat);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(g), matLineBlue);
    m.add(edges);
    return m;
  }
  function register(object, data, kind, lbl) {
    const entry = { object, data, kind, label: lbl, base: object.position.clone() };
    pickables.push(entry);
    if (data?.id) nodeById.set(data.id, entry);
    object.userData.entry = entry;
    return entry;
  }
  function pulse(from, to, mat = matGlowBlue, speed = 0.35) {
    const curve = new THREE.LineCurve3(from.clone(), to.clone());
    const mesh = glow(new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), mat));
    scene.add(mesh);
    pulses.push({ curve, mesh, t: Math.random(), speed });
  }

  // ---------- star field ----------
  {
    const n = isTouch ? 900 : 2200;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 220;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 140;
      pos[i * 3 + 2] = -Math.random() * 260 + 30;
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const m = new THREE.PointsMaterial({ color: 0x9fb3d9, size: 0.09, sizeAttenuation: true, transparent: true, opacity: 0.8 });
    scene.add(new THREE.Points(g, m));
  }

  // ---------- Scene 0: hero core ----------
  const S = {}; // scene anchors
  S.hero = new THREE.Vector3(0, 0, 0);
  {
    const g = new THREE.IcosahedronGeometry(3.2, 1);
    const wire = new THREE.LineSegments(new THREE.EdgesGeometry(g), new THREE.LineBasicMaterial({ color: BLUE, transparent: true, opacity: 0.75 }));
    const inner = glow(new THREE.Mesh(new THREE.IcosahedronGeometry(1.6, 2), new THREE.MeshStandardMaterial({ color: 0x0f1524, emissive: BLUE_DEEP, emissiveIntensity: 0.8, roughness: 0.2, metalness: 0.6 })));
    const group = new THREE.Group(); group.add(wire, inner); group.position.copy(S.hero);
    scene.add(group); spinners.push({ o: wire, rx: 0.08, ry: 0.12 }, { o: inner, rx: -0.05, ry: 0.2 });
    // orbit rings
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(4.2 + i * 0.6, 0.012, 6, 120), new THREE.MeshBasicMaterial({ color: i === 1 ? MAGENTA : BLUE, transparent: true, opacity: 0.35 }));
      ring.rotation.set(Math.PI / 2 + i * 0.5, i * 0.7, 0);
      group.add(ring); spinners.push({ o: ring, rx: 0, ry: 0, rz: 0.1 + i * 0.05 });
    }
  }

  // ---------- Scene 1: platform — Dataverse core with orbiting skill nodes ----------
  S.platform = new THREE.Vector3(26, 2, -34);
  {
    const g = new THREE.Group(); g.position.copy(S.platform); scene.add(g);
    const core = glow(new THREE.Mesh(new THREE.SphereGeometry(1.5, 32, 32), new THREE.MeshStandardMaterial({ color: 0x0f1524, emissive: BLUE, emissiveIntensity: 0.9, roughness: 0.25, metalness: 0.4 })));
    g.add(core);
    const halo = new THREE.Mesh(new THREE.SphereGeometry(1.9, 32, 32), new THREE.MeshBasicMaterial({ color: BLUE, transparent: true, opacity: 0.08, side: THREE.BackSide }));
    g.add(halo);
    const { o: cl } = label('Dataverse', 'quiet'); cl.position.set(0, -2.3, 0); g.add(cl);

    const n = skills.length;
    skills.forEach((s, i) => {
      const a = (i / n) * Math.PI * 2;
      const ring = s.group === 'platform' ? 6 : s.group === 'web' ? 9 : 7.5;
      const y = Math.sin(i * 1.7) * 1.6;
      const p = new THREE.Vector3(Math.cos(a) * ring, y, Math.sin(a) * ring);
      const node = hex(0.55, 0.2);
      node.position.copy(p); g.add(node);
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), s.group === 'platform' ? matGlowBlue : s.group === 'web' ? matGlowMag : matGlowAmb);
      dot.position.y = 0.2; node.add(dot);
      g.add(edge(new THREE.Vector3(0, 0, 0), p, s.group === 'platform' ? matLineBlue : matLineDim));
      const { o: l, el } = label(s.label, 'small');
      l.position.set(0, 0.7, 0); node.add(l);
      const entry = register(node, s, 'skill', el);
      el.addEventListener('pointerenter', () => onHover?.(entry, true));
      el.addEventListener('pointerleave', () => onHover?.(entry, false));
      if (s.group === 'platform' && !reduceMotion) pulse(S.platform, p.clone().add(S.platform), matGlowBlue, 0.25 + Math.random() * 0.2);
    });
    spinners.push({ o: core, rx: 0, ry: 0.15 });
  }

  // ---------- Scene 2: client work — stations in an arc ----------
  S.work = new THREE.Vector3(-4, -3, -78);
  {
    const g = new THREE.Group(); g.position.copy(S.work); scene.add(g);
    const n = engagements.length;
    const prev = [];
    engagements.forEach((e, i) => {
      const t = (i / (n - 1)) - 0.5;
      const x = t * 30;
      const z = -Math.abs(t) * 14 + Math.sin(i * 2.1) * 2;
      const y = Math.cos(i * 1.3) * 1.2;
      const p = new THREE.Vector3(x, y, z);
      const tower = new THREE.Group(); tower.position.copy(p);
      const h = 1.6 + (e.detail.length * 0.5);
      for (let k = 0; k < 3; k++) {
        const slab = hex(1.1 - k * 0.22, 0.26);
        slab.position.y = k * 0.45; tower.add(slab);
      }
      const beacon = glow(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, h, 6), matGlowBlue));
      beacon.position.y = 0.9 + h / 2; tower.add(beacon);
      const cap = glow(new THREE.Mesh(new THREE.OctahedronGeometry(0.32), matGlowBlue));
      cap.position.y = 1.1 + h; tower.add(cap); spinners.push({ o: cap, rx: 0, ry: 0.6 });
      const { o: l, el } = label(e.label ?? e.sector, e.accent ? `${e.accent} tint` : '');
      l.position.set(0, 1.6 + h, 0); tower.add(l);
      g.add(tower);
      const entry = register(tower, e, 'engagement', el);
      el.addEventListener('click', () => onSelect?.(entry));
      el.addEventListener('pointerenter', () => onHover?.(entry, true));
      el.addEventListener('pointerleave', () => onHover?.(entry, false));
      if (prev.length) g.add(edge(prev[prev.length - 1], p, matLineDim));
      prev.push(p);
      // ground grid tile
      const grid = new THREE.GridHelper(4, 4, 0x1f2a45, 0x1a2338);
      grid.position.set(p.x, p.y - 0.2, p.z); g.add(grid);
    });
  }

  // ---------- Scene 3: ventures — floating islands with distinct shapes ----------
  S.ventures = new THREE.Vector3(30, 4, -122);
  {
    const g = new THREE.Group(); g.position.copy(S.ventures); scene.add(g);
    const n = ventures.length;
    ventures.forEach((v, i) => {
      const a = (i / n) * Math.PI * 2;
      const r = 9 + (i % 2) * 3;
      const p = new THREE.Vector3(Math.cos(a) * r, Math.sin(a * 2) * 2.2, Math.sin(a) * r * 0.6);
      const isl = new THREE.Group(); isl.position.copy(p);
      const base = hex(1.3, 0.3); isl.add(base);
      let obj;
      switch (v.shape) {
        case 'ball': {
          obj = new THREE.Mesh(new THREE.SphereGeometry(0.8, 24, 24), new THREE.MeshStandardMaterial({ color: 0xd9742a, roughness: 0.6, emissive: 0x5a2a08, emissiveIntensity: 0.5 }));
          const seams = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.SphereGeometry(0.81, 8, 4)), new THREE.LineBasicMaterial({ color: 0x1a0d05 }));
          obj.add(seams); break;
        }
        case 'bars': {
          obj = new THREE.Group();
          [0.6, 1.1, 0.9, 1.6, 2.0].forEach((hh, k) => {
            const bar = new THREE.Mesh(new THREE.BoxGeometry(0.28, hh, 0.28), new THREE.MeshStandardMaterial({ color: 0x141c30, emissive: k === 4 ? MAGENTA : BLUE_DEEP, emissiveIntensity: 0.9 }));
            bar.position.set((k - 2) * 0.4, hh / 2, 0); obj.add(bar);
          }); break;
        }
        case 'dumbbell': {
          obj = new THREE.Group();
          const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.8, 10), matGlowAmb); bar.rotation.z = Math.PI / 2; obj.add(bar);
          [-0.75, 0.75].forEach((x) => { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.28, 16), new THREE.MeshStandardMaterial({ color: 0x1c2438, emissive: AMBER, emissiveIntensity: 0.5 })); w.rotation.z = Math.PI / 2; w.position.x = x; obj.add(w); });
          obj.position.y = 0.6; break;
        }
        case 'wave': {
          obj = new THREE.Group();
          for (let k = 0; k < 9; k++) {
            const hh = 0.3 + Math.abs(Math.sin(k * 0.9)) * 1.3;
            const b = new THREE.Mesh(new THREE.BoxGeometry(0.14, hh, 0.14), new THREE.MeshStandardMaterial({ color: 0x141c30, emissive: MAGENTA, emissiveIntensity: 0.9 }));
            b.position.set((k - 4) * 0.25, hh / 2, 0); obj.add(b);
          } break;
        }
        default: {
          obj = new THREE.Mesh(new THREE.TorusKnotGeometry(0.5, 0.16, 80, 10), new THREE.MeshStandardMaterial({ color: 0x141c30, emissive: MAGENTA, emissiveIntensity: 0.7, roughness: 0.3, metalness: 0.5 }));
          obj.position.y = 0.9;
        }
      }
      if (v.shape === 'ball') obj.position.y = 1.1;
      if (v.shape === 'bars' || v.shape === 'wave') obj.position.y = 0.15;
      isl.add(obj); spinners.push({ o: obj, rx: 0, ry: 0.4 });
      const { o: l, el } = label(v.title, 'magenta');
      l.position.set(0, 2.6, 0); isl.add(l);
      g.add(isl);
      const entry = register(isl, v, 'venture', el);
      el.addEventListener('click', () => onSelect?.(entry));
      el.addEventListener('pointerenter', () => onHover?.(entry, true));
      el.addEventListener('pointerleave', () => onHover?.(entry, false));
      if (!reduceMotion) pulse(S.ventures, p.clone().add(S.ventures), matGlowMag, 0.18 + Math.random() * 0.15);
      g.add(edge(new THREE.Vector3(0, -1.5, 0), p, matLineDim));
    });
    const hub = glow(new THREE.Mesh(new THREE.OctahedronGeometry(0.9, 0), new THREE.MeshStandardMaterial({ color: 0x0f1524, emissive: MAGENTA, emissiveIntensity: 0.9 })));
    hub.position.y = -1.5; g.add(hub); spinners.push({ o: hub, rx: 0.2, ry: 0.3 });
  }

  // ---------- Scene 4: code — repo panels in a wall ----------
  S.code = new THREE.Vector3(-26, 0, -160);
  {
    const g = new THREE.Group(); g.position.copy(S.code); scene.add(g);
    const all = [...repos.map((r) => ({ ...r, pub: true })), ...privateRepos.map((r) => ({ ...r, pub: false }))];
    const cols = 4;
    all.forEach((r, i) => {
      const cx = (i % cols) - (cols - 1) / 2, cy = Math.floor(i / cols);
      const p = new THREE.Vector3(cx * 5.4, 2.6 - cy * 3.4, Math.sin(i) * 0.4);
      const panel = new THREE.Group(); panel.position.copy(p);
      const card = new THREE.Mesh(new THREE.BoxGeometry(4.6, 2.6, 0.12), new THREE.MeshStandardMaterial({ color: 0x0f1524, emissive: r.pub ? 0x14305e : 0x2b1a2e, emissiveIntensity: 0.9, roughness: 0.5 }));
      panel.add(card);
      panel.add(new THREE.LineSegments(new THREE.EdgesGeometry(card.geometry), r.pub ? matLineBlue : new THREE.LineBasicMaterial({ color: MAGENTA, transparent: true, opacity: 0.5 })));
      // fake code lines
      for (let k = 0; k < 5; k++) {
        const w = 1.2 + Math.random() * 2.4;
        const ln = new THREE.Mesh(new THREE.BoxGeometry(w, 0.12, 0.02), new THREE.MeshBasicMaterial({ color: k === 0 ? BLUE : 0x2d3a5c }));
        ln.position.set(-2.1 + w / 2 + (k % 2) * 0.3, 0.8 - k * 0.38, 0.08); panel.add(ln);
      }
      const { o: l, el } = label(r.pub ? r.title : r.title + ' (private)', r.pub ? 'repo' : 'quiet small');
      l.position.set(0, -1.6, 0); panel.add(l);
      g.add(panel);
      const entry = register(panel, r, r.pub ? 'repo' : 'private', el);
      if (r.pub) {
        el.addEventListener('click', () => onSelect?.(entry));
        el.addEventListener('pointerenter', () => onHover?.(entry, true));
        el.addEventListener('pointerleave', () => onHover?.(entry, false));
      }
    });
  }

  // ---------- Scene 5: credentials — a ring of medals ----------
  S.creds = new THREE.Vector3(8, 6, -196);
  {
    const g = new THREE.Group(); g.position.copy(S.creds); scene.add(g);
    const items = [...credentials.certifications.map((c) => ({ ...c, kind: 'cert' })), ...credentials.education.map((e) => ({ ...e, kind: 'edu' }))];
    const n = items.length;
    items.forEach((c, i) => {
      const a = (i / n) * Math.PI * 2 + Math.PI / 2;
      const p = new THREE.Vector3(Math.cos(a) * 5.5, Math.sin(a) * 2.2, 0);
      const medal = new THREE.Group(); medal.position.copy(p);
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.16, 6), new THREE.MeshStandardMaterial({ color: 0x141c30, emissive: c.kind === 'edu' ? AMBER : BLUE_DEEP, emissiveIntensity: 0.8, metalness: 0.7, roughness: 0.3 }));
      disc.rotation.x = Math.PI / 2; medal.add(disc);
      medal.add(new THREE.LineSegments(new THREE.EdgesGeometry(disc.geometry), c.kind === 'edu' ? new THREE.LineBasicMaterial({ color: AMBER }) : matLineBlue)).rotation.x = Math.PI / 2;
      const { o: l } = label(c.kind === 'edu' ? c.title : c.code, 'quiet small');
      l.position.set(0, -1.5, 0); medal.add(l);
      g.add(medal); spinners.push({ o: medal, rx: 0, ry: 0.35 });
      g.add(edge(new THREE.Vector3(0, 0, 0), p, matLineDim));
    });
    const centre = glow(new THREE.Mesh(new THREE.IcosahedronGeometry(0.9, 0), new THREE.MeshStandardMaterial({ color: 0x0f1524, emissive: BLUE, emissiveIntensity: 1 })));
    g.add(centre); spinners.push({ o: centre, rx: 0.3, ry: 0.2 });
  }

  // ---------- Scene 6: contact — a gate of light ----------
  S.contact = new THREE.Vector3(0, 0, -236);
  {
    const g = new THREE.Group(); g.position.copy(S.contact); scene.add(g);
    for (let i = 0; i < 6; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(3 + i * 1.4, 0.03, 8, 100), new THREE.MeshBasicMaterial({ color: i % 2 ? MAGENTA : BLUE, transparent: true, opacity: 0.5 - i * 0.06 }));
      ring.position.z = -i * 2.2; g.add(ring); spinners.push({ o: ring, rx: 0, ry: 0, rz: (i % 2 ? -1 : 1) * 0.08 });
    }
    const core = glow(new THREE.Mesh(new THREE.SphereGeometry(0.7, 24, 24), new THREE.MeshBasicMaterial({ color: INK })));
    core.position.z = -14; g.add(core);
  }

  // ---------- camera path ----------
  // One continuous flight: approach each scene from outside, settle, then flow on.
  const waypoints = [
    { pos: new THREE.Vector3(0, 1.5, 14), look: S.hero },
    { pos: new THREE.Vector3(10, 3, -8), look: S.platform },
    { pos: new THREE.Vector3(26, 9, -15), look: S.platform },
    { pos: new THREE.Vector3(8, 3, -52), look: S.work },
    { pos: new THREE.Vector3(-4, 4, -62), look: S.work },
    { pos: new THREE.Vector3(14, 6, -100), look: S.ventures },
    { pos: new THREE.Vector3(30, 7, -106), look: S.ventures },
    { pos: new THREE.Vector3(-8, 2, -140), look: S.code },
    { pos: new THREE.Vector3(-26, 1, -148), look: S.code },
    { pos: new THREE.Vector3(-4, 6, -180), look: S.creds },
    { pos: new THREE.Vector3(8, 6, -179), look: S.creds },
    { pos: new THREE.Vector3(0, 1, -222), look: S.contact },
    { pos: new THREE.Vector3(0, 0, -227), look: new THREE.Vector3(0, 0, -250) },
  ];
  const path = new THREE.CatmullRomCurve3(waypoints.map((w) => w.pos), false, 'centripetal', 0.4);
  const lookPath = new THREE.CatmullRomCurve3(waypoints.map((w) => w.look), false, 'centripetal', 0.4);

  // Scroll → path parameter. Each section owns a scroll band; `linger` holds the camera mid-band.
  const totalScroll = sections.reduce((a, s) => a + s.scroll, 0);
  const bands = []; let acc = 0;
  sections.forEach((s, i) => { bands.push({ id: s.id, start: acc / totalScroll, end: (acc + s.scroll) / totalScroll, linger: s.linger ?? 0.4, i }); acc += s.scroll; });
  // Map section i to path parameter: section i's "settled" point is waypoint (2i) for inner scenes.
  // Arc-length position (u) of each waypoint, so getPointAt lands exactly on it.
  const wpU = (() => {
    const N = waypoints.length, steps = 2400, lens = [0];
    const a = new THREE.Vector3(), b = new THREE.Vector3();
    path.getPoint(0, a);
    for (let s = 1; s <= steps; s++) { path.getPoint(s / steps, b); lens.push(lens[s - 1] + a.distanceTo(b)); a.copy(b); }
    const total = lens[steps];
    return waypoints.map((_, k) => lens[Math.round((k / (N - 1)) * steps)] / total);
  })();
  const settleU = sections.map((_, i) => wpU[Math.min(2 * i, waypoints.length - 1)]);
  // Each band holds the camera at its scene around the band centre (hold width = linger),
  // then travels to the next scene's hold. Seams are continuous in both directions.
  const holds = bands.map((b, i) => {
    const c = (b.start + b.end) / 2, w = (b.end - b.start) * b.linger * 0.5;
    return { a: c - w, b: c + w, u: settleU[i] };
  });
  const smooth01 = (x) => x * x * (3 - 2 * x);
  function progressToU(p) {
    p = Math.min(1, Math.max(0, p));
    if (p <= holds[0].b) return holds[0].u;
    for (let i = 0; i < holds.length - 1; i++) {
      const h0 = holds[i], h1 = holds[i + 1];
      if (p <= h1.a) { const x = (p - h0.b) / (h1.a - h0.b); return h0.u + (h1.u - h0.u) * smooth01(x); }
      if (p <= h1.b) return h1.u;
    }
    return holds[holds.length - 1].u;
  }
  function sectionAt(p) {
    p = Math.min(1, Math.max(0, p));
    for (const b of bands) if (p <= b.end) return { ...b, local: (p - b.start) / (b.end - b.start) };
    return { ...bands[bands.length - 1], local: 1 };
  }

  // ---------- picking ----------
  const ray = new THREE.Raycaster();
  const pointer = new THREE.Vector2(-10, -10);
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  let hovered = null;
  function setPointer(x, y) {
    pointer.set((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1);
    mouse.tx = pointer.x; mouse.ty = pointer.y;
  }
  function pick() {
    ray.setFromCamera(pointer, camera);
    const hits = ray.intersectObjects(pickables.filter((e) => e.kind !== 'private').map((e) => e.object), true);
    let found = null;
    for (const h of hits) { let o = h.object; while (o && !o.userData.entry) o = o.parent; if (o?.userData.entry) { found = o.userData.entry; break; } }
    if (found !== hovered) {
      if (hovered) onHover?.(hovered, false);
      hovered = found;
      if (hovered) onHover?.(hovered, true);
    }
    return hovered;
  }

  // ---------- state & loop ----------
  const state = { progress: 0, smooth: 0, u: 0, w: 0, h: 0, time: 0 };
  const camPos = new THREE.Vector3(), camLook = new THREE.Vector3(), tmp = new THREE.Vector3(), dir = new THREE.Vector3();
  const clock = new THREE.Clock();

  function resize() {
    state.w = innerWidth; state.h = innerHeight;
    renderer.setSize(state.w, state.h, false);
    bloom?.setSize(state.w, state.h);
    labels.setSize(state.w, state.h);
    camera.aspect = state.w / state.h; camera.updateProjectionMatrix();
    camera.fov = state.w < 640 ? 62 : 50; camera.updateProjectionMatrix();
  }

  // Bloom loads lazily and is skipped entirely for reduced motion (or ?bloom=0).
  let bloom = null;
  if (bloomFlag === '1' || (!reduceMotion && bloomFlag !== '0')) {
    import('./bloom.js').then(({ createBloom }) => { bloom = createBloom(renderer, scene, camera, { layer: BLOOM, probe: bloomFlag !== '1' }); })
      .catch(() => {});
  }

  let current = -1;
  const listeners = { section: [] };
  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05); state.time += dt;
    // scroll smoothing (position continuity in both directions)
    state.smooth += (state.progress - state.smooth) * (reduceMotion ? 1 : 0.085);
    state.u = progressToU(state.smooth);
    path.getPointAt(state.u, camPos);
    lookPath.getPointAt(state.u, camLook);
    // mouse parallax, spring-smoothed
    if (!reduceMotion && !isTouch) {
      mouse.x += (mouse.tx - mouse.x) * 0.06; mouse.y += (mouse.ty - mouse.y) * 0.06;
      camPos.x += mouse.x * 0.9; camPos.y += mouse.y * 0.5;
    }
    // Narrow screens: push the camera back and aim lower so the scene sits above the copy.
    if (state.w < 700) {
      dir.subVectors(camPos, camLook).normalize();
      camPos.addScaledVector(dir, 9);
      camLook.y -= 3.2;
    }
    camera.position.copy(camPos);
    camera.lookAt(camLook);

    if (!reduceMotion) {
      for (const s of spinners) { s.o.rotation.x += (s.rx || 0) * dt; s.o.rotation.y += (s.ry || 0) * dt; s.o.rotation.z += (s.rz || 0) * dt; }
      for (const p of pulses) { p.t = (p.t + dt * p.speed) % 1; p.curve.getPointAt(p.t, p.mesh.position); }
      // hovered node lifts slightly
      for (const e of pickables) {
        const lift = e === hovered ? 0.35 : 0;
        e.object.position.y += ((e.base.y + lift) - e.object.position.y) * 0.12;
      }
    }
    if (!isTouch) pick();

    // Labels only for what's near the camera; CSS labels have no depth of their own.
    for (const e of pickables) {
      if (!e.label) continue;
      e.object.getWorldPosition(tmp);
      const d = tmp.distanceTo(camera.position);
      const near = d < 34 ? 1 : d > 46 ? 0 : 1 - (d - 34) / 12;
      const inFront = tmp.sub(camera.position).dot(camera.getWorldDirection(dir)) > 0;
      const v = inFront ? near : 0;
      if (e.vis !== v) { e.vis = v; e.label.style.opacity = v; e.label.style.visibility = v ? 'visible' : 'hidden'; }
    }
    for (const q of quietLabels) {
      q.o.getWorldPosition(tmp);
      const d = tmp.distanceTo(camera.position);
      const v = d < 34 ? 1 : d > 46 ? 0 : 1 - (d - 34) / 12;
      if (q.vis !== v) { q.vis = v; q.el.style.opacity = v; q.el.style.visibility = v ? 'visible' : 'hidden'; }
    }

    // section change
    const sec = sectionAt(state.smooth);
    if (sec.i !== current) { current = sec.i; listeners.section.forEach((f) => f(sec)); }

    if (bloom?.active) bloom.render(); else renderer.render(scene, camera);
    labels.render(scene, camera);
    requestAnimationFrame(frame);
  }

  resize();
  addEventListener('resize', () => { if (!isTouch || Math.abs(innerWidth - state.w) > 40) resize(); });
  addEventListener('orientationchange', () => setTimeout(resize, 120));
  requestAnimationFrame(frame);

  return {
    setProgress(p) { state.progress = p; },
    setPointer,
    onSection(fn) { listeners.section.push(fn); },
    getHovered: () => hovered,
    highlightSkill(id, on) {
      const s = skills.find((k) => k.id === id);
      if (!s) return;
      for (const e of pickables) {
        if (e.kind === 'skill') { e.label.classList.toggle('is-hot', on && e.data.id === id); continue; }
        if (!e.label) continue;
        const match = s.projects.includes(e.data.id);
        e.label.classList.toggle('is-dim', on && !match);
        e.label.classList.toggle('is-hot', on && match);
      }
    },
    sectionProgress: () => sectionAt(state.smooth),
    settled: () => Math.abs(state.progress - state.smooth) < 0.0015,
    debug: () => ({ progress: state.progress, smooth: state.smooth, u: state.u, bloom: !!bloom?.active, bloomMedianMs: bloom?.medianMs }),
    bands,
  };
}
