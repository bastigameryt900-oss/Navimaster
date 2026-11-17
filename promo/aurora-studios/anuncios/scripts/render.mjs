// Renderiza un episodio: gancho 3D (<ep>/hook.html) + cierre con escenas del video principal (../index.html).
//
//   node scripts/render.mjs <ep> sheet 1 5 9.5 ...   -> <ep>/out/preview/sheet.png
//   node scripts/render.mjs <ep> video [--workers 4]  -> <ep>/out/video-sin-audio.mp4
//   node scripts/render.mjs <ep> final                -> <ep>/out/<nombre>.mp4 (video + audio, listo para subir)
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { chromium } = createRequire(import.meta.url)("playwright");
const HERE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [epArg, mode = "video", ...rest] = process.argv.slice(2);
const EPD = path.resolve(epArg);
const OUT = path.join(EPD, "out");
const PROMO = path.resolve(HERE, "..", "index.html");
const W = 1080, H = 1920, FPS = 30;
const TIEMPOS = JSON.parse(fs.readFileSync(path.join(OUT, "tiempos.json"), "utf8"));
const EP = JSON.parse(fs.readFileSync(path.join(EPD, "episodio.json"), "utf8"));
const L = Object.fromEntries(TIEMPOS.lineas.map((l) => [l.id, l]));
const DURATION = TIEMPOS.duracion;
const opt = (n, d) => { const k = rest.indexOf("--" + n); return k >= 0 ? Number(rest[k + 1]) : d; };
function tx(e) {
  if (typeof e === "number") return e;
  if (e === "fin") return DURATION + 0.01;
  const m = String(e).trim().match(/^([a-z]\d+)\.(ini|fin)\s*([+-]\s*[\d.]+)?$/);
  if (!m) return parseFloat(e);
  return L[m[1]][m[2]] + (m[3] ? parseFloat(m[3].replace(/\s/g, "")) : 0);
}
const HOOK_END = tx(EP.fin_gancho);
// Cierre: cada tramo [de, a) del anuncio muestra uno o varios clips [inicio, fin] del video principal.
const PIVOT = [];
for (const c of EP.cierre) {
  const a = c.de === "fin_gancho" ? HOOK_END : tx(c.de), b = tx(c.a), d = (b - a) / c.clips.length;
  c.clips.forEach(([s, e], i) => PIVOT.push([a + i * d, a + (i + 1) * d, s, e]));
}
const promoTime = (t) => { const s = PIVOT.find(([a, b]) => t >= a && t < b) || PIVOT[PIVOT.length - 1]; return s[2] + (s[3] - s[2]) * Math.min(1, (t - s[0]) / (s[1] - s[0])); };
function captionAt(t) {
  const ls = TIEMPOS.lineas; let txt = "";
  for (let i = 0; i < ls.length; i++) { const nx = ls[i + 1] ? ls[i + 1].ini : DURATION + 1; if (t >= ls[i].ini && t < nx) txt = ls[i].texto; }
  return txt;
}

const ARGS = ["--allow-file-access-from-files", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"];
async function openHook(browser) {
  const p = await browser.newPage({ viewport: { width: W, height: H } });
  p.on("pageerror", (e) => console.log("[gancho]", e.message));
  p.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") console.log("[gancho]", m.text()); });
  await p.addInitScript(`window.TIEMPOS = ${JSON.stringify(TIEMPOS)}; window.EPISODIO = ${JSON.stringify(EP)};`);
  await p.goto("file://" + path.join(EPD, "hook.html"));
  await p.waitForFunction(() => window.READY === true, null, { timeout: 180000 });
  return p;
}
async function openPromo(browser) {
  const p = await browser.newPage({ viewport: { width: W, height: H } });
  p.on("pageerror", (e) => console.log("[principal]", e.message));
  await p.goto("file://" + PROMO);
  await p.waitForFunction(() => window.READY === true);
  await p.evaluate(([top, hide]) => {
    const st = document.createElement("style");
    st.textContent = `@font-face{font-family:"InterCap";src:url(tiktok/assets/fonts/Inter-SemiBold.otf);font-weight:600}
      #tcap{position:absolute;left:30px;right:30px;top:${top}px;text-align:center;z-index:50}
      #tcap span{display:inline-block;background:#fff;color:#121212;font:600 52px/1.17 InterCap,sans-serif;padding:14px 28px 17px;border-radius:16px;max-width:1010px;letter-spacing:-.005em}
      #tcap span:empty{display:none}
      ${hide}{visibility:hidden!important}`;
    document.head.appendChild(st);
    const d = document.createElement("div"); d.id = "tcap"; d.innerHTML = "<span></span>";
    document.getElementById("stage").appendChild(d);
  }, [EP.cierre_subtitulo_top || 1470, EP.cierre_ocultar || ".prices,.hud-wa"]);
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
  if (files.length === 1) { fs.copyFileSync(files[0], path.join(dir, "sheet.png")); console.log("hoja:", path.join(dir, "sheet.png")); process.exit(0); }
  const cols = Math.min(4, files.length), sw = 300, sh = Math.round(300 * H / W);
  const inputs = files.flatMap((f) => ["-i", f]);
  const filt = files.map((_, k) => `[${k}:v]scale=${sw}:-1[v${k}]`).join(";");
  const lay = files.map((_, k) => `${(k % cols) * sw}_${Math.floor(k / cols) * sh}`).join("|");
  await run("ffmpeg", ["-y", "-loglevel", "error", ...inputs, "-filter_complex", `${filt};${files.map((_, k) => `[v${k}]`).join("")}xstack=inputs=${files.length}:layout=${lay}:fill=gray`, path.join(dir, "sheet.png")]);
  console.log("hoja:", path.join(dir, "sheet.png"));
} else if (mode === "video") {
  const WORKERS = opt("workers", 4);
  const total = Math.ceil(DURATION * FPS);
  const BLOCK = 30, queue = [];
  for (let a = 0, i = 0; a < total; a += BLOCK, i++) queue.push({ i, a, z: Math.min(total, a + BLOCK) });
  const segDir = path.join(OUT, "segments");
  const RESUME = rest.includes("--resume");
  if (!RESUME) fs.rmSync(segDir, { recursive: true, force: true });
  fs.mkdirSync(segDir, { recursive: true });
  // Con --resume se saltan los bloques ya completos (mismo número de cuadros que el bloque).
  const { spawnSync } = await import("node:child_process");
  const complete = (f, n) => fs.existsSync(f) && parseInt(spawnSync("ffprobe", ["-v", "error", "-count_frames", "-select_streams", "v:0", "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", f], { encoding: "utf8" }).stdout) === n;
  const t0 = Date.now(); let done = 0;
  const browser = await chromium.launch({ args: ARGS });
  await Promise.all(Array.from({ length: WORKERS }, async () => {
    const pages = {};
    while (queue.length) {
      const { i, a, z } = queue.shift();
      const f = path.join(segDir, `b${String(i).padStart(4, "0")}.mp4`);
      if (RESUME && complete(f, z - a)) { done += z - a; continue; }
      const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "png", "-i", "-", "-c:v", "libx264", "-preset", "veryfast", "-crf", "14", "-pix_fmt", "yuv420p", "-r", String(FPS), f], { stdio: ["pipe", "inherit", "inherit"] });
      const fin = new Promise((res, rej) => ff.on("exit", (c) => (c === 0 ? res() : rej(new Error("ffmpeg " + c)))));
      for (let k = a; k < z; k++) {
        const buf = await frame(pages, browser, k / FPS);
        if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
        if (++done % 90 === 0) console.log(`cuadros ${done}/${total} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
      }
      ff.stdin.end(); await fin;
    }
  }));
  await browser.close();
  const list = path.join(segDir, "list.txt");
  fs.writeFileSync(list, fs.readdirSync(segDir).filter((f) => f.endsWith(".mp4")).sort().map((f) => `file '${path.join(segDir, f)}'`).join("\n"));
  await run("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", path.join(OUT, "video-sin-audio.mp4")]);
  fs.rmSync(segDir, { recursive: true, force: true });
  console.log("video listo en", ((Date.now() - t0) / 1000).toFixed(0), "s");
} else if (mode === "final") {
  const name = path.join(OUT, `aurora-studios-${EP.nombre}.mp4`);
  // Ajusta la ganancia para quedar en -14 LUFS (nivel de TikTok, Instagram y YouTube).
  const { spawnSync } = await import("node:child_process");
  const meas = spawnSync("ffmpeg", ["-hide_banner", "-i", path.join(OUT, "audio.wav"), "-af", "ebur128", "-f", "null", "-"], { encoding: "utf8" }).stderr;
  const lufs = parseFloat([...meas.matchAll(/I:\s+(-?[\d.]+) LUFS/g)].pop()?.[1] ?? "-14");
  EP.ganancia_db = EP.ganancia_db ?? Math.min(0, -14 - lufs);
  console.log("loudness", lufs, "LUFS -> ganancia", EP.ganancia_db.toFixed(1), "dB");
  await run("ffmpeg", ["-y", "-loglevel", "error", "-i", path.join(OUT, "video-sin-audio.mp4"), "-i", path.join(OUT, "audio.wav"), "-map", "0:v", "-map", "1:a",
    "-vf", "hqdn3d=1.5:1.5:4:4", "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-maxrate", "10M", "-bufsize", "20M", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "192k", "-af", `volume=${EP.ganancia_db ?? -1.3}dB`, "-shortest", "-movflags", "+faststart", name]);
  console.log("final:", name);
}
