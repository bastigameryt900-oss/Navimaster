// Exporta cada <section class="art"> de index.html como PNG en out/.
// Uso: node render.mjs
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const { chromium } = createRequire(import.meta.url)("playwright");
const HERE = path.dirname(fileURLToPath(import.meta.url));
fs.mkdirSync(path.join(HERE, "out"), { recursive: true });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 1400 }, deviceScaleFactor: 1 });
p.on("pageerror", (e) => console.log("[pageerror]", e.message));
await p.goto("file://" + path.join(HERE, "index.html"));
await p.waitForFunction(() => window.READY === true);
const arts = await p.$$("section.art");
for (const a of arts) {
  const name = await a.getAttribute("data-name");
  await a.screenshot({ path: path.join(HERE, "out", name + ".png") });
  console.log("out/" + name + ".png");
}
await b.close();
