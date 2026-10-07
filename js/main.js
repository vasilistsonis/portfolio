import { createWorld } from './world.js';
import { profile, skills, sections, credentials } from './data.js';

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = matchMedia('(pointer: coarse)').matches;
const $ = (s, r = document) => r.querySelector(s);

// ---------- Preloader: one orchestrated moment, then never again ----------
const pre = document.createElement('div');
pre.className = 'pre';
pre.innerHTML = `<div class="pre-inner"><div class="pre-name">Vasilis Tsonis</div><div class="pre-line"><span></span></div><div class="pre-status">Building the world</div></div>`;
document.body.appendChild(pre);
injectPreloaderStyles();

// ---------- Scroll track ----------
const track = $('#track');
const unit = isTouch ? 110 : 140; // vh per scroll unit
const totalUnits = sections.reduce((a, s) => a + s.scroll, 0);
track.style.height = `${totalUnits * unit + 100}vh`;

// ---------- Copy blocks ----------
const copyRoot = $('#copy');
const blocks = new Map();
sections.forEach((s, i) => {
  const el = document.createElement('section');
  el.className = 'copy'; el.id = `copy-${s.id}`;
  const H = i === 0 ? 'h1' : 'h2';
  let extra = '';
  if (s.id === 'hero') {
    extra = `<div class="actions"><a class="btn primary" href="#copy-work" data-go="work">See the work</a><a class="btn" href="${profile.cv}" download>Download CV</a></div>`;
  }
  if (s.id === 'platform') {
    extra = `<div class="chips">${skills.map((k) => `<button class="chip ${k.group}" data-skill="${k.id}" type="button">${k.label}</button>`).join('')}</div>`;
  }
  if (s.id === 'credentials') {
    extra = `<ul class="creds">${credentials.certifications.map((c) => `<li><b>${c.code}</b><small>${c.title}</small></li>`).join('')}${credentials.education.map((e) => `<li><b>${e.title}</b><small>${e.org}</small></li>`).join('')}</ul>`;
  }
  if (s.id === 'contact') {
    extra = `<div class="actions"><a class="btn primary" href="mailto:${profile.email}">Email me</a><a class="btn" href="${profile.linkedin}" target="_blank" rel="noopener">LinkedIn</a><a class="btn" href="${profile.github}" target="_blank" rel="noopener">GitHub</a><a class="btn" href="${profile.cv}" download>CV</a></div>`;
  }
  el.innerHTML = `${s.id === 'hero' ? `<div class="role">${profile.role}</div>` : ''}<${H}>${split(s.title)}</${H}><p>${s.id === 'hero' ? profile.intro : s.body}</p>${extra}`;
  copyRoot.appendChild(el);
  blocks.set(s.id, el);
});

function split(text) {
  return text.split(' ').map((w, i) => `<span class="w" style="--i:${i}"><span>${w}</span></span>`).join(' ');
}

// ---------- Route rail ----------
const rail = $('.rail');
const railBtns = new Map();
sections.forEach((s) => {
  const b = document.createElement('button');
  b.type = 'button'; b.dataset.go = s.id; b.setAttribute('aria-label', s.label);
  b.innerHTML = `<span class="tick"></span><span class="lab">${s.label}</span>`;
  rail.appendChild(b); railBtns.set(s.id, b);
});

// ---------- World ----------
const drawer = $('#drawer'), scrim = $('#scrim');
const world = createWorld({
  canvas: $('#gl'),
  labelRoot: $('#labels'),
  onSelect: openDrawer,
  onHover: (entry, on) => { document.body.classList.toggle('is-hot', on && entry.kind !== 'skill' && entry.kind !== 'private'); if (entry.kind === 'skill') world.highlightSkill(entry.data.id, on); },
});

window.__world = world;
// scroll → progress
function maxScroll() { return document.documentElement.scrollHeight - innerHeight; }
function readScroll() { world.setProgress(scrollY / Math.max(1, maxScroll())); }
addEventListener('scroll', readScroll, { passive: true });
readScroll();

// Click a node in 3D (canvas) — labels have their own click handlers.
$('#gl').addEventListener('click', () => { const h = world.getHovered(); if (h && (h.kind === 'engagement' || h.kind === 'venture' || h.kind === 'repo')) openDrawer(h); });
addEventListener('pointermove', (e) => { world.setPointer(e.clientX, e.clientY); cursor.move(e.clientX, e.clientY); }, { passive: true });

// section change → copy + rail
world.onSection((sec) => {
  blocks.forEach((el, id) => el.classList.toggle('is-on', id === sec.id));
  railBtns.forEach((b, id) => b.classList.toggle('is-active', id === sec.id));
  if (sec.i > 0) $('#hint').classList.add('is-gone');
  history.replaceState(null, '', `#${sec.id === 'hero' ? 'start' : sec.id}`);
});

// go-to buttons
function goTo(id) {
  const band = world.bands.find((b) => b.id === id); if (!band) return;
  const target = (band.start + (band.end - band.start) * 0.5) * maxScroll();
  scrollTo({ top: target, behavior: reduceMotion ? 'auto' : 'smooth' });
}
document.addEventListener('click', (e) => {
  const go = e.target.closest('[data-go]'); if (!go) return;
  e.preventDefault(); goTo(go.dataset.go);
});
// deep link
{
  const h = location.hash.replace('#', '');
  const id = h === 'start' ? 'hero' : h;
  if (sections.some((s) => s.id === id) && id !== 'hero') requestAnimationFrame(() => { const band = world.bands.find((b) => b.id === id); scrollTo(0, (band.start + (band.end - band.start) * 0.5) * maxScroll()); });
}

// skill chips ↔ world
copyRoot.addEventListener('pointerover', (e) => { const c = e.target.closest('[data-skill]'); if (c) { c.classList.add('is-hot'); world.highlightSkill(c.dataset.skill, true); } });
copyRoot.addEventListener('pointerout', (e) => { const c = e.target.closest('[data-skill]'); if (c) { c.classList.remove('is-hot'); world.highlightSkill(c.dataset.skill, false); } });
copyRoot.addEventListener('click', (e) => { const c = e.target.closest('[data-skill]'); if (!c) return; const on = !c.classList.contains('is-locked'); copyRoot.querySelectorAll('.chip.is-locked').forEach((x) => x.classList.remove('is-locked', 'is-hot')); c.classList.toggle('is-locked', on); c.classList.toggle('is-hot', on); world.highlightSkill(c.dataset.skill, on); });

// ---------- Drawer ----------
let lastFocus = null;
function openDrawer(entry) {
  const d = entry.data;
  lastFocus = document.activeElement;
  $('#drawer-kicker').textContent = entry.kind === 'engagement' ? d.sector : entry.kind === 'venture' ? d.tagline : 'Public repository';
  $('#drawer-title').textContent = d.title;
  $('#drawer-short').textContent = d.short;
  $('#drawer-detail').innerHTML = (d.detail || []).map((x) => `<li>${x}</li>`).join('');
  $('#drawer-stack').innerHTML = (d.stack || []).map((x) => `<li>${x}</li>`).join('');
  const links = [...(d.links || [])]; if (entry.kind === 'repo') links.unshift({ label: 'Open on GitHub', url: d.url });
  $('#drawer-links').innerHTML = links.map((l) => `<a href="${l.url}" target="_blank" rel="noopener">${l.label}</a>`).join('');
  drawer.hidden = false; requestAnimationFrame(() => { drawer.classList.add('is-open'); scrim.classList.add('is-on'); $('#drawer-close').focus(); });
}
function closeDrawer() {
  drawer.classList.remove('is-open'); scrim.classList.remove('is-on');
  setTimeout(() => { drawer.hidden = true; }, 380);
  lastFocus?.focus?.();
}
$('#drawer-close').addEventListener('click', closeDrawer);
scrim.addEventListener('click', closeDrawer);
addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeDrawer(); });

// ---------- Cursor (desktop only) ----------
const cursor = (() => {
  if (isTouch || reduceMotion) return { move() {} };
  const dot = document.createElement('div'); dot.className = 'cur';
  document.body.appendChild(dot);
  document.documentElement.classList.add('has-cur');
  let x = 0, y = 0, tx = 0, ty = 0, raf = 0;
  function tick() { x += (tx - x) * 0.22; y += (ty - y) * 0.22; dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`; raf = requestAnimationFrame(tick); }
  tick();
  document.addEventListener('pointerover', (e) => { dot.classList.toggle('is-link', !!e.target.closest('a, button, .node-label, .chip')); });
  return { move(px, py) { tx = px; ty = py; } };
})();

// ---------- Preloader finish ----------
function finishPreloader() {
  pre.classList.add('is-done');
  document.body.classList.add('is-ready');
  setTimeout(() => pre.remove(), 900);
}
if (document.fonts?.ready) document.fonts.ready.then(() => setTimeout(finishPreloader, reduceMotion ? 0 : 900));
else setTimeout(finishPreloader, 900);

function injectPreloaderStyles() {
  const st = document.createElement('style');
  st.textContent = `
  .pre{position:fixed;inset:0;z-index:100;background:#070a12;display:grid;place-items:center;transition:opacity 500ms cubic-bezier(.23,1,.32,1),visibility 0s linear 500ms}
  .pre.is-done{opacity:0;visibility:hidden}
  .pre-inner{text-align:center}
  .pre-name{font-family:'Syne',system-ui,sans-serif;font-weight:800;font-size:clamp(28px,5vw,48px);letter-spacing:-.03em;color:#e8ecf5}
  .pre-line{width:min(260px,60vw);height:2px;background:rgba(232,236,245,.12);margin:16px auto 10px;border-radius:2px;overflow:hidden}
  .pre-line span{display:block;height:100%;background:#6fb7ff;transform:scaleX(0);transform-origin:left;animation:preload 900ms cubic-bezier(.23,1,.32,1) forwards}
  .pre-status{font-size:13px;color:#8b94a8}
  @keyframes preload{to{transform:scaleX(1)}}
  @media (prefers-reduced-motion:reduce){.pre-line span{animation:none;transform:scaleX(1)}}
  .cur{position:fixed;left:0;top:0;width:10px;height:10px;border-radius:50%;background:#e8ecf5;pointer-events:none;z-index:90;mix-blend-mode:difference;transition:width 160ms cubic-bezier(.23,1,.32,1),height 160ms cubic-bezier(.23,1,.32,1),background-color 160ms ease}
  .cur.is-link{width:34px;height:34px;background:#6fb7ff}
  html.has-cur, html.has-cur *{cursor:none}
  .copy .w{display:inline-block;overflow:hidden;vertical-align:bottom}
  .copy .w>span{display:inline-block;transform:translateY(110%);transition:transform 520ms cubic-bezier(.23,1,.32,1);transition-delay:calc(var(--i) * 45ms)}
  .copy.is-on .w>span{transform:translateY(0)}
  @media (prefers-reduced-motion:reduce){.copy .w>span{transform:none;transition:none}}
  @media (hover:none){.cur{display:none}}
  `;
  document.head.appendChild(st);
}
