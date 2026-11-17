// Genera assets/earth.jpg (textura equirectangular de la Tierra) a partir de Natural Earth (world-atlas, dominio público).
// Uso: node scripts/build-earth.mjs <geo.bundle.js con d3-geo + topojson-client> <land-50m.json>
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
const { chromium } = createRequire(import.meta.url)("playwright");
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [bundle, land] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage();
await p.setContent("<canvas id=c width=4096 height=2048></canvas>");
await p.addScriptTag({ content: fs.readFileSync(bundle, "utf8") });
const url = await p.evaluate((topo) => {
  const { geoEquirectangular, geoPath, geoGraticule10, feature } = window.Geo;
  const c = document.getElementById("c"), x = c.getContext("2d");
  const W = c.width, H = c.height;
  const proj = geoEquirectangular().scale(W / (2 * Math.PI)).translate([W / 2, H / 2]);
  const path = geoPath(proj, x);
  // océano con degradado según latitud
  const g = x.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#14365a"); g.addColorStop(0.5, "#0f4c7d"); g.addColorStop(1, "#14365a");
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.strokeStyle = "rgba(255,255,255,.07)"; x.lineWidth = 2; x.beginPath(); path(geoGraticule10()); x.stroke();
  const landF = feature(topo, topo.objects.land);
  // plataforma continental: halo claro alrededor de la tierra
  x.strokeStyle = "rgba(90,170,210,.35)"; x.lineWidth = 14; x.lineJoin = "round"; x.beginPath(); path(landF); x.stroke();
  x.fillStyle = "#e7d7ac"; x.beginPath(); path(landF); x.fill();
  x.strokeStyle = "#b39c68"; x.lineWidth = 2.5; x.beginPath(); path(landF); x.stroke();
  return c.toDataURL("image/jpeg", 0.9);
}, JSON.parse(fs.readFileSync(land, "utf8")));
fs.writeFileSync(path.join(ROOT, "assets/earth.jpg"), Buffer.from(url.split(",")[1], "base64"));
await b.close();
console.log("assets/earth.jpg listo");
