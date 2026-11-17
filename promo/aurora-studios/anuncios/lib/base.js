// Motor común de los anuncios estilo TikTok: renderizador three.js con posproceso, subtítulos,
// utilidades de animación y control de tiempo (window.seek) para el renderizador cuadro a cuadro.
import * as THREE from "three";
import { RoundedBoxGeometry } from "../../tiktok/assets/addons/RoundedBoxGeometry.js";
export { THREE, RoundedBoxGeometry };

export const W = 1080, H = 1920;
export const $ = (s) => document.querySelector(s);
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, k) => a + (b - a) * k;
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const eio = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
export const eo = (k) => 1 - Math.pow(1 - k, 3);
export const ei = (k) => k * k * k;
export const back = (k) => { const c = 1.9; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
export const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
export function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ---------- tiempos y cortes (inyectados por el renderizador) ----------
export const TIEMPOS = window.TIEMPOS || (await (await fetch("out/tiempos.json")).json());
export const EP = window.EPISODIO || (await (await fetch("episodio.json")).json());
export const L = Object.fromEntries(TIEMPOS.lineas.map((l) => [l.id, l]));
// "h3.ini-0.1" -> segundos
export function tx(expr) {
  if (typeof expr === "number") return expr;
  const m = String(expr).trim().match(/^([a-z]\d+)\.(ini|fin)\s*([+-]\s*[\d.]+)?$|^([\d.]+)$/);
  if (!m) throw new Error("expresión de tiempo inválida: " + expr);
  if (m[4]) return parseFloat(m[4]);
  return L[m[1]][m[2]] + (m[3] ? parseFloat(m[3].replace(/\s/g, "")) : 0);
}
export const CUT = Object.fromEntries(Object.entries(EP.escenas).map(([k, v]) => [k, tx(v)]));
export const END = tx(EP.fin_gancho);
window.HOOK_END = END;

// ---------- renderizador + posproceso ----------
export const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setSize(W, H); renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.NeutralToneMapping;
const rt = new THREE.WebGLRenderTarget(W, H, { samples: 4, type: THREE.HalfFloatType });
export const post = new THREE.ShaderMaterial({
  uniforms: { tDiffuse: { value: rt.texture }, uGlitch: { value: 0 }, uTime: { value: 0 }, uShift: { value: 0 }, uGrain: { value: 0.035 }, uSat: { value: 1 }, uBright: { value: 1 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uGlitch,uTime,uShift,uGrain,uSat,uBright; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
    void main(){
      vec2 uv=vUv;
      float band=floor(uv.y*38.+floor(uTime*24.)*7.);
      float r=h(vec2(band,floor(uTime*24.)));
      if(r<uGlitch*.55) uv.x+=(h(vec2(band,3.))-.5)*.18*uGlitch;
      float s=(.003+uShift)*(1.+uGlitch*6.);
      vec3 c=vec3(texture2D(tDiffuse,uv+vec2(s,0.)).r,texture2D(tDiffuse,uv).g,texture2D(tDiffuse,uv-vec2(s,0.)).b);
      float l=dot(c,vec3(.299,.587,.114)); c=mix(vec3(l),c,uSat)*uBright;
      c*=1.-uGlitch*.25*step(.5,fract(uv.y*320.));
      c+=(h(uv*vec2(1080.,1920.)+uTime)-.5)*uGrain;
      gl_FragColor=vec4(c,1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
  depthTest: false, depthWrite: false,
});
const postScene = new THREE.Scene(), postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post));
const pmrem = new THREE.PMREMGenerator(renderer);

// ---------- piezas reutilizables ----------
export function skyDome(top, mid, bot, r = 900) {
  return new THREE.Mesh(new THREE.SphereGeometry(r, 48, 24), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(top) }, mid: { value: new THREE.Color(mid) }, bot: { value: new THREE.Color(bot) } },
    vertexShader: `varying vec3 vP; void main(){ vP=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform vec3 top,mid,bot; varying vec3 vP; void main(){ float y=vP.y; vec3 c = y>0. ? mix(mid,top,pow(smoothstep(0.,.75,y),.8)) : mix(mid,bot,smoothstep(0.,-.25,y)); gl_FragColor=vec4(c,1.); }`,
  }));
}
export function envFrom(top, mid, bot) { const s = new THREE.Scene(); s.add(skyDome(top, mid, bot, 50)); return pmrem.fromScene(s, 0.02).texture; }
export function glowTex(inner = "rgba(255,255,255,1)", mid = "rgba(255,220,120,.45)") {
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const x = c.getContext("2d"); const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, inner); g.addColorStop(0.18, inner); g.addColorStop(0.4, mid); g.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
export const GLOW = glowTex();
export function glowSprite(tex = GLOW, scale = 1, color = 0xffffff, opacity = 1) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity }));
  s.scale.setScalar(scale); return s;
}
export function canvasTex(w, h) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return { c, x: c.getContext("2d"), tex };
}
// Celular: cuerpo redondeado + pantalla con textura de lienzo (600×1280)
export function makePhone(color = "#16161c") {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new RoundedBoxGeometry(1.0, 2.08, 0.1, 6, 0.13), new THREE.MeshStandardMaterial({ color, metalness: 0.7, roughness: 0.28 })));
  const scr = canvasTex(600, 1280);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.93, 1.99), new THREE.MeshBasicMaterial({ map: scr.tex }));
  screen.position.z = 0.0515; g.add(screen);
  g.userData.scr = scr;
  return g;
}
// Persona estilizada (cápsula + cabeza)
export function makePerson(color = "#4f9dde", skin = "#f1c27d") {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.75, 6, 16), new THREE.MeshStandardMaterial({ color, roughness: 0.6 }));
  body.position.y = 0.7; g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 24, 16), new THREE.MeshStandardMaterial({ color: skin, roughness: 0.55 }));
  head.position.y = 1.55; g.add(head);
  const eyeM = new THREE.MeshStandardMaterial({ color: "#15141b", roughness: 0.3 });
  [-0.09, 0.09].forEach((x) => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), eyeM); e.position.set(x, 0.03, 0.235); head.add(e); });
  g.userData = { body, head };
  return g;
}
export function textPlane(w, h, draw, pxPerUnit = 200) {
  const ct = canvasTex(Math.round(w * pxPerUnit), Math.round(h * pxPerUnit));
  draw(ct.x, ct.c.width, ct.c.height);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: ct.tex, transparent: true }));
  m.userData.ct = ct; return m;
}
export const project = (v, cam) => { cam.updateMatrixWorld(); const p = v.clone().project(cam); return { x: (p.x + 1) / 2 * W, y: (1 - p.y) / 2 * H, z: p.z }; };
export const placeOv = (el, p, show = 1) => { el.style.left = p.x + "px"; el.style.top = p.y + "px"; el.style.opacity = show; };
export const show = (sel, k, extra = "") => { const e = $(sel); e.style.opacity = k; if (extra !== null) e.style.transform = extra; };

// ---------- subtítulos y control de tiempo ----------
export function caption(t) {
  const ls = TIEMPOS.lineas; let txt = "";
  for (let i = 0; i < ls.length; i++) { const nx = ls[i + 1] ? ls[i + 1].ini : ls[i].fin + 0.8; if (t >= ls[i].ini && t < nx) txt = ls[i].texto; }
  return txt;
}
// escenas: { A: {update(localT, dur, absT) -> {s, cam}}, ... } con claves iguales a EP.escenas
export async function start(escenas, overlays = []) {
  $("#stage").prepend(renderer.domElement);
  const keys = Object.keys(CUT).sort((a, b) => CUT[a] - CUT[b]);
  const spans = keys.map((k, i) => ({ k, a: CUT[k], b: i + 1 < keys.length ? CUT[keys[i + 1]] : END }));
  window.seek = (t) => {
    overlays.forEach((s) => ($(s).style.opacity = 0));
    $("#flash").style.opacity = 0;
    Object.assign(post.uniforms, {});
    post.uniforms.uGlitch.value = 0; post.uniforms.uShift.value = 0; post.uniforms.uTime.value = t;
    post.uniforms.uSat.value = 1; post.uniforms.uBright.value = 1;
    const sp = spans.find((x) => t >= x.a && t < x.b) || spans[spans.length - 1];
    const r = escenas[sp.k].update(t - sp.a, sp.b - sp.a, t);
    if (spans.some((x) => x.a > 0 && Math.abs(t - x.a) < 0.05)) post.uniforms.uShift.value += 0.004;
    renderer.setRenderTarget(rt); renderer.render(r.s, r.cam);
    renderer.setRenderTarget(null); renderer.render(postScene, postCam);
    const c = t < END ? caption(t) : "";
    const el = $("#capT"); if (el.textContent !== c) el.textContent = c;
  };
  await document.fonts.load("600 30px Inter"); await document.fonts.load("800 40px Archivo");
  await new Promise((r) => setTimeout(r, 300));
  const q = new URLSearchParams(location.search);
  window.seek(q.has("t") ? parseFloat(q.get("t")) : 0);
  window.READY = true;
}
