// Genera assets/icons.js con los íconos usados en el video.
// Uso: node scripts/build-icons.mjs <ruta a node_modules>
import fs from "node:fs";
import path from "node:path";
const nm = process.argv[2];
const brand = ["discord", "youtube", "whatsapp", "instagram", "apple", "android"];
const lucide = ["check", "bot", "globe", "smartphone", "film", "play", "shield-check", "zap",
  "sparkles", "message-circle", "gamepad-2", "monitor", "code-xml", "workflow", "plug", "brain-circuit",
  "scissors", "clapperboard", "server", "users", "search", "star", "map-pin", "arrow-right", "layout-dashboard",
  "store", "cpu", "wand-sparkles", "rocket", "badge-check", "hand-coins", "lock", "bell", "trophy", "heart"];
const out = {};
for (const n of brand) {
  const s = fs.readFileSync(path.join(nm, "simple-icons/icons", n + ".svg"), "utf8");
  out[n] = { brand: true, body: s.match(/<path[^>]*\/>/)[0] };
}
for (const n of lucide) {
  const s = fs.readFileSync(path.join(nm, "lucide-static/icons", n + ".svg"), "utf8");
  out[n] = { brand: false, body: s.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").trim() };
}
fs.writeFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), "../assets/icons.js"),
  "// Íconos: Simple Icons (CC0) y Lucide (ISC).\nwindow.ICONS = " + JSON.stringify(out) + ";\n");
console.log("icons:", Object.keys(out).length);
