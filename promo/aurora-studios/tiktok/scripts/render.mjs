// Renderiza el anuncio estilo TikTok: gancho 3D (hook.html) + cierre con escenas del video principal (../index.html).
//
//   node scripts/render.mjs sheet 1 5 9.5 ...   -> out/preview/sheet.png (hoja de cuadros)
//   node scripts/render.mjs video [--workers 4]  -> out/video-sin-audio.mp4
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { chromium } = createRequire(import.meta.url)("playwright");
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "out");
const W = 1080, H = 1920, FPS = 30;
const TIEMPOS = JSON.parse(fs.readFileSync(path.join(OUT, "tiempos.json"), "utf8"));
const L = Object.fromEntries(TIEMPOS.lineas.map((l) => [l.id, l]));
const HOOK_END = L.p1.ini - 0.2;
const DURATION = TIEMPOS.duracion;

const [mode = "video", ...rest] = process.argv.slice(2);
const opt = (n, d) => { const k = rest.indexOf("--" + n); return k >= 0 ? Number(rest[k + 1]) : d; };

// Tramos del video principal que se muestran durante el cierre: [inicio, fin) del anuncio -> [inicio, fin] del principal.
function split(a, b, list) { const d = (b - a) / list.length; return list.map(([s, e], i) => [a + i * d, a + (i + 1) * d, s, e]); }
const PIVOT = [
  [HOOK_END, L.p2.ini, 1.45, 2.95],                                           // logo
  [L.p2.ini, L.p4.ini, 4.7, 7.3],                                             // "Tecnología que impulsa tus ideas"
  ...split(L.p4.ini, L.p5.ini, [[12.9, 13.7], [9.7, 10.5], [16.9, 17.7]]),    // web, bots, reels
  ...split(L.p5.ini, L.p6.ini, [[24.4, 25.15], [27.2, 27.9], [36.0, 36.8]]),  // apps y juegos
  [L.p6.ini, DURATION + 0.01, 50.3, 56.6],                                    // llamado a la acción
];
const promoTime = (t) => { const s = PIVOT.find(([a, b]) => t >= a && t < b) || PIVOT[PIVOT.length - 1]; return s[2] + (s[3] - s[2]) * Math.min(1, (t - s[0]) / (s[1] - s[0])); };
function captionAt(t) {
  const ls = TIEMPOS.lineas; let txt = "";
  for (let i = 0; i < ls.length; i++) { const nx = ls[i + 1] ? ls[i + 1].ini : DURATION + 1; if (t >= ls[i].ini && t < nx) txt = ls[i].texto; }
  return txt;
}

const ARGS = ["--allow-file-access-from-files", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"];
async function openHook(browser) {
  const p = await browser.newPage({ viewport: { width: W, height: H } });
  p.on("pageerror", (e) => console.log("[hook]", e.message));
  p.on("console", (m) => { if (m.type() === "error") console.log("[hook]", m.text()); });
  await p.addInitScript(`window.TIEMPOS = ${JSON.stringify(TIEMPOS)};`);
  await p.goto("file://" + path.join(ROOT, "hook.html"));
  await p.waitForFunction(() => window.READY === true, null, { timeout: 120000 });
  return p;
}
async function openPromo(browser) {
  const p = await browser.newPage({ viewport: { width: W, height: H } });
  p.on("pageerror", (e) => console.log("[promo]", e.message));
  await p.goto("file://" + path.join(ROOT, "..", "index.html"));
  await p.waitForFunction(() => window.READY === true);
  await p.evaluate(() => {
    const st = document.createElement("style");
    st.textContent = `@font-face{font-family:"InterCap";src:url(tiktok/assets/fonts/Inter-SemiBold.otf);font-weight:600}
      #tcap{position:absolute;left:30px;right:30px;top:1470px;text-align:center;z-index:50}
      #tcap span{display:inline-block;background:#fff;color:#121212;font:600 52px/1.17 InterCap,sans-serif;padding:14px 28px 17px;border-radius:16px;max-width:1010px;letter-spacing:-.005em}
      #tcap span:empty{display:none}
      .prices,.hud-wa{visibility:hidden!important}`;
    document.head.appendChild(st);
    const d = document.createElement("div"); d.id = "tcap"; d.innerHTML = "<span></span>";
    document.getElementById("stage").appendChild(d);
  });
  await p.evaluate(() => document.fonts.load("600 40px InterCap"));
  return p;
}
async function frame(pages, browser, t) {
  if (t < HOOK_END) {
    pages.hook ||= await openHook(browser);
    await pages.hook.evaluate((t) => window.seek(t), t);
    return pages.hook.screenshot({ type: "png" });
  }
  pages.promo ||= await openPromo(browser);
  await pages.promo.evaluate(([pt, c]) => { window.seek(pt); document.querySelector("#tcap span").textContent = c; }, [promoTime(t), captionAt(t)]);
  return pages.promo.screenshot({ type: "png" });
}
function run(cmd, args) { return new Promise((res, rej) => { const p = spawn(cmd, args, { stdio: "inherit" }); p.on("exit", (c) => (c === 0 ? res() : rej(new Error(cmd + " " + c)))); }); }

if (mode === "sheet") {
  const times = rest.filter((a) => !a.startsWith("--")).map(Number);
  const dir = path.join(OUT, "preview"); fs.mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch({ args: ARGS });
  const pages = {}, files = [];
  for (const t of times) { const f = path.join(dir, `s${t}.png`); fs.writeFileSync(f, await frame(pages, browser, t)); files.push(f); }
  await browser.close();
  const cols = Math.min(4, files.length), sw = 300, sh = Math.round(300 * H / W);
  const inputs = files.flatMap((f) => ["-i", f]);
  const filt = files.map((_, k) => `[${k}:v]scale=${sw}:-1[v${k}]`).join(";");
  const lay = files.map((_, k) => `${(k % cols) * sw}_${Math.floor(k / cols) * sh}`).join("|");
  await run("ffmpeg", ["-y", "-loglevel", "error", ...inputs, "-filter_complex", `${filt};${files.map((_, k) => `[v${k}]`).join("")}xstack=inputs=${files.length}:layout=${lay}:fill=gray`, path.join(dir, "sheet.png")]);
  console.log("hoja:", path.join(dir, "sheet.png"));
} else {
  const WORKERS = opt("workers", 4);
  const total = Math.ceil(DURATION * FPS);
  // Reparte los cuadros intercalando bloques, para que todos los procesos tengan parte del gancho 3D (más lento).
  const BLOCK = 30, blocks = [];
  for (let a = 0; a < total; a += BLOCK) blocks.push([a, Math.min(total, a + BLOCK)]);
  const segDir = path.join(OUT, "segments"); fs.rmSync(segDir, { recursive: true, force: true }); fs.mkdirSync(segDir, { recursive: true });
  const t0 = Date.now(); let done = 0;
  const queue = blocks.map((b, i) => ({ i, b }));
  const browser = await chromium.launch({ args: ARGS });
  await Promise.all(Array.from({ length: WORKERS }, async () => {
    const pages = {};
    while (queue.length) {
      const { i, b: [a, z] } = queue.shift();
      const f = path.join(segDir, `b${String(i).padStart(4, "0")}.mp4`);
      const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "png", "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p", "-r", String(FPS), f], { stdio: ["pipe", "inherit", "inherit"] });
      const fin = new Promise((res, rej) => ff.on("exit", (c) => (c === 0 ? res() : rej(new Error("ffmpeg " + c)))));
      for (let k = a; k < z; k++) {
        const buf = await frame(pages, browser, k / FPS);
        if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
        if (++done % 60 === 0) console.log(`cuadros ${done}/${total} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
      }
      ff.stdin.end(); await fin;
    }
  }));
  await browser.close();
  const list = path.join(segDir, "list.txt");
  fs.writeFileSync(list, fs.readdirSync(segDir).filter((f) => f.endsWith(".mp4")).sort().map((f) => `file '${path.join(segDir, f)}'`).join("\n"));
  await run("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", path.join(OUT, "video-sin-audio.mp4")]);
  console.log("listo en", ((Date.now() - t0) / 1000).toFixed(0), "s");
}
