// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Detect deploy target. Inside the Lovable sandbox the Cloudflare preset is
// forced automatically; on Vercel we hard-pin the vercel preset so that
// dynamic routes like `/e/$slug` are served by the SSR function instead of
// being treated as missing static files (which caused 500/404 on refresh
// and on direct link opens from WhatsApp).
const isVercel = !!process.env.VERCEL;

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    pages: [{ path: "/" }],
    prerender: { enabled: true, autoStaticPathsDiscovery: false },
  },
  nitro: {
    ...(isVercel ? { preset: "vercel" } : {}),
    routeRules: {
      "/_build/assets/**": {
        headers: { "Cache-Control": "public, max-age=31536000, immutable" },
      },
      "/assets/**": {
        headers: { "Cache-Control": "public, max-age=31536000, immutable" },
      },
      "/media/**": {
        headers: { "Cache-Control": "public, max-age=31536000, immutable" },
      },
      "/manifest.webmanifest": {
        headers: { "Cache-Control": "public, max-age=3600, must-revalidate" },
      },
      "/favicon.ico": {
        headers: { "Cache-Control": "public, max-age=3600, must-revalidate" },
      },
      "/icons/**": {
        headers: { "Cache-Control": "public, max-age=3600, must-revalidate" },
      },
    },
  },
});
