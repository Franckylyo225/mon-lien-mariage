// vite-plugin-pwa écrit sw.js à la racine de `dist/` alors que les fichiers
// servis publiquement se trouvent dans `dist/client` (et `.vercel/output/static`
// sur Vercel). Sans cette copie, /sw.js renvoie 404 et la PWA ne s'installe pas.
import { existsSync, readdirSync, copyFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const SRC = "dist";
const TARGETS = ["dist/client", ".vercel/output/static"].filter((d) => existsSync(d));

if (!existsSync(SRC)) {
  console.warn("[copy-sw] dist/ introuvable — rien à copier.");
  process.exit(0);
}

const files = readdirSync(SRC).filter((f) => f === "sw.js" || /^workbox-.*\.js$/.test(f));
if (files.length === 0) {
  console.warn("[copy-sw] Aucun service worker généré.");
  process.exit(0);
}

for (const dir of TARGETS) {
  mkdirSync(dir, { recursive: true });
  for (const file of files) copyFileSync(join(SRC, file), join(dir, file));
  console.log(`[copy-sw] ${files.join(", ")} → ${dir}`);
}
