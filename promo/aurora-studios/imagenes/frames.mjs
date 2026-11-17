// Captura cuadros limpios (sin subtítulo) de las animaciones 3D, para usarlos de fondo en las portadas.
// Uso: node frames.mjs
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const { chromium } = createRequire(import.meta.url)("playwright");
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const SHOTS = [
  { page: "tiktok/hook.html", tiempos: "tiktok/out/tiempos.json", t: 16.9, out: "cables.png" },
  { page: "anuncios/web/hook.html", tiempos: "anuncios/web/out/tiempos.json", ep: "anuncios/web/episodio.json", t: 7.05, out: "web.png" },
  { page: "anuncios/bots/hook.html", tiempos: "anuncios/bots/out/tiempos.json", ep: "anuncios/bots/episodio.json", t: 2.6, out: "bots.png" },
  { page: "anuncios/juegos/hook.html", tiempos: "anuncios/juegos/out/tiempos.json", ep: "anuncios/juegos/episodio.json", t: 4.4, out: "juegos.png" },
];
fs.mkdirSync(path.join(HERE, "frames"), { recursive: true });
const b = await chromium.launch({ args: ["--allow-file-access-from-files", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
for (const s of SHOTS) {
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on("pageerror", (e) => console.log("[pageerror]", e.message));
  let init = `window.TIEMPOS = ${fs.readFileSync(path.join(ROOT, s.tiempos), "utf8")};`;
  if (s.ep) init += `window.EPISODIO = ${fs.readFileSync(path.join(ROOT, s.ep), "utf8")};`;
  await p.addInitScript(init);
  await p.goto("file://" + path.join(ROOT, s.page));
  await p.waitForFunction(() => window.READY === true, null, { timeout: 180000 });
  await p.evaluate((t) => { window.seek(t); document.getElementById("cap").style.display = "none"; document.querySelectorAll(".ov").forEach((e) => (e.style.display = "none")); }, s.t);
  await p.screenshot({ path: path.join(HERE, "frames", s.out) });
  console.log("frames/" + s.out);
  await p.close();
}
await b.close();
