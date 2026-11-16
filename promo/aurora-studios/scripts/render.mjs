// Renderiza index.html cuadro por cuadro con Playwright y lo codifica con ffmpeg.
//
//   node scripts/render.mjs preview 1 4.5 9.8      -> PNG de esos segundos en out/preview/
//   node scripts/render.mjs sheet 1 4.5 9.8 ...    -> una hoja de contacto en out/preview/sheet.png
//   node scripts/render.mjs video [--fps 30] [--workers 4]  -> out/video-sin-audio.mp4
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Playwright viene instalado globalmente; createRequire respeta NODE_PATH.
const { chromium } = createRequire(import.meta.url)("playwright");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "out");
const PAGE = "file://" + path.join(ROOT, "index.html");
const W = 1080, H = 1920;

const [mode = "video", ...rest] = process.argv.slice(2);
const opt = (name, def) => { const k = rest.indexOf("--" + name); return k >= 0 ? Number(rest[k + 1]) : def; };

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on("console", m => { if (m.type() === "warning" || m.type() === "error") console.log("[page]", m.text()); });
  page.on("pageerror", e => console.log("[pageerror]", e.message));
  await page.goto(PAGE);
  await page.waitForFunction(() => window.READY === true);
  return page;
}

function run(cmd, args, opts = {}) {
  return new Promise((res, rej) => {
    const p = spawn(cmd, args, { stdio: ["pipe", "inherit", "inherit"], ...opts });
    p.on("exit", c => (c === 0 ? res() : rej(new Error(cmd + " salió con " + c))));
    p.on("error", rej);
    if (opts.feed) opts.feed(p);
  });
}

async function shots(times) {
  const dir = path.join(OUT, "preview");
  fs.mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch();
  const page = await openPage(browser);
  const files = [];
  for (const t of times) {
    await page.evaluate(t => window.seek(t), t);
    const f = path.join(dir, `t${String(t).padStart(5, "0")}.png`);
    await page.screenshot({ path: f });
    files.push(f);
  }
  await browser.close();
  return files;
}

if (mode === "preview" || mode === "sheet") {
  const times = rest.filter(a => !a.startsWith("--")).map(Number);
  const files = await shots(times);
  if (mode === "sheet") {
    const cols = Math.min(4, files.length), scale = 300;
    const inputs = files.flatMap(f => ["-i", f]);
    const filters = files.map((_, k) => `[${k}:v]scale=${scale}:-1[v${k}]`).join(";");
    const layout = files.map((_, k) => `${(k % cols) * scale}_${Math.floor(k / cols) * Math.round(scale * H / W)}`).join("|");
    await run("ffmpeg", ["-y", "-loglevel", "error", ...inputs, "-filter_complex",
      `${filters};${files.map((_, k) => `[v${k}]`).join("")}xstack=inputs=${files.length}:layout=${layout}:fill=gray`,
      path.join(OUT, "preview", "sheet.png")]);
    console.log("hoja:", path.join(OUT, "preview", "sheet.png"));
  } else console.log(files.join("\n"));
} else if (mode === "video") {
  const FPS = opt("fps", 30), WORKERS = opt("workers", 4);
  const browser = await chromium.launch();
  const probe = await openPage(browser);
  const DURATION = await probe.evaluate(() => window.DURATION);
  await probe.close();
  const total = Math.round(DURATION * FPS);
  const per = Math.ceil(total / WORKERS);
  const segDir = path.join(OUT, "segments");
  fs.mkdirSync(segDir, { recursive: true });
  let done = 0;
  const t0 = Date.now();
  const segs = await Promise.all(Array.from({ length: WORKERS }, async (_, w) => {
    const a = w * per, b = Math.min(total, a + per);
    const seg = path.join(segDir, `seg${w}.mp4`);
    if (a >= b) return null;
    const page = await openPage(browser);
    const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "png", "-i", "-",
      "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p", "-r", String(FPS), seg], { stdio: ["pipe", "inherit", "inherit"] });
    const finished = new Promise((res, rej) => ff.on("exit", c => (c === 0 ? res() : rej(new Error("ffmpeg " + c)))));
    for (let f = a; f < b; f++) {
      await page.evaluate(t => window.seek(t), f / FPS);
      const buf = await page.screenshot({ type: "png" });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
      if (++done % 60 === 0) console.log(`cuadros ${done}/${total}  (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    }
    ff.stdin.end();
    await finished;
    await page.close();
    return seg;
  }));
  await browser.close();
  const list = path.join(segDir, "list.txt");
  fs.writeFileSync(list, segs.filter(Boolean).map(s => `file '${s}'`).join("\n"));
  const silent = path.join(OUT, "video-sin-audio.mp4");
  await run("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", silent]);
  console.log("listo:", silent, `en ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}
