import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Esta app vive en una subcarpeta del repositorio, con su propio package-lock.json.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
