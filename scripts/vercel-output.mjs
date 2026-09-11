// Complète la sortie Build Output API (v3) attendue par Vercel.
// Le preset nitro "vercel" (beta) écrit bien .vercel/output/{static,functions}
// mais pas config.json ni .vc-config.json — sans eux Vercel ne route rien
// vers la fonction SSR et renvoie 404 sur toutes les routes dynamiques.
import { existsSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = ".vercel/output";
const FUNCTIONS = join(OUT, "functions");

if (!existsSync(FUNCTIONS)) {
  console.error(`[vercel-output] ${FUNCTIONS} introuvable — build nitro incomplet.`);
  process.exit(1);
}

const funcDirs = readdirSync(FUNCTIONS).filter((d) => d.endsWith(".func"));
if (funcDirs.length === 0) {
  console.error("[vercel-output] Aucune fonction serveur générée.");
  process.exit(1);
}

const serverFunc = funcDirs.includes("__server.func") ? "__server.func" : funcDirs[0];
const serverPath = "/" + serverFunc.replace(/\.func$/, "");

for (const dir of funcDirs) {
  const vcConfig = join(FUNCTIONS, dir, ".vc-config.json");
  if (existsSync(vcConfig)) continue;
  writeFileSync(
    vcConfig,
    JSON.stringify(
      {
        runtime: "nodejs22.x",
        handler: "index.mjs",
        launcherType: "Nodejs",
        shouldAddHelpers: false,
        supportsResponseStreaming: true,
      },
      null,
      2,
    ),
  );
}

const immutable = { "cache-control": "public, max-age=31536000, immutable" };
const shortCache = { "cache-control": "public, max-age=3600, must-revalidate" };

const config = {
  version: 3,
  routes: [
    { src: "^/assets/(.*)$", headers: immutable, continue: true },
    { src: "^/_build/assets/(.*)$", headers: immutable, continue: true },
    { src: "^/media/(.*)$", headers: immutable, continue: true },
    { src: "^/icons/(.*)$", headers: shortCache, continue: true },
    { src: "^/manifest\\.webmanifest$", headers: shortCache, continue: true },
    { handle: "filesystem" },
    { src: "/(.*)", dest: serverPath },
  ],
};

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, "config.json"), JSON.stringify(config, null, 2));

console.log(`[vercel-output] config.json écrit — SSR routé vers ${serverPath}`);
