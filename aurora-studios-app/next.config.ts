import path from "node:path";
import type { NextConfig } from "next";

// `npm run exportar` genera un sitio estático (HTML, CSS y JS) en la carpeta `out/`,
// listo para subir a cualquier hosting. `npm run build` sigue funcionando igual que antes.
const exportar = process.env.EXPORTAR === "1";

const nextConfig: NextConfig = {
  // Esta app vive en una subcarpeta del repositorio, con su propio package-lock.json.
  turbopack: {
    root: path.join(__dirname),
  },
  ...(exportar && {
    output: "export",
    // Cada página queda como carpeta/index.html: funciona en cualquier hosting sin configurar nada.
    trailingSlash: true,
  }),
};

export default nextConfig;
