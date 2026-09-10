// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

// Detect deploy target. Inside the Lovable sandbox the Cloudflare preset is
// forced automatically; on Vercel we hard-pin the vercel preset so that
// dynamic routes like `/e/$slug` are served by the SSR function instead of
// being treated as missing static files (which caused 500/404 on refresh
// and on direct link opens from WhatsApp).
const isVercel = !!process.env.VERCEL;

export default defineConfig({
  vite: {
    plugins: [
      VitePWA({
        strategies: "generateSW",
        registerType: "autoUpdate",
        injectRegister: null,
        filename: "sw.js",
        manifest: false,
        devOptions: { enabled: false },
        workbox: {
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          navigateFallback: null,
          additionalManifestEntries: [
            { url: "/offline-dashboard.html", revision: "1" },
          ],
          globPatterns: ["**/*.{js,css,woff2,png,svg,webp,avif,ico}"],
          globIgnores: ["media/**"],
          runtimeCaching: [
            {
              urlPattern: ({ request, url }) =>
                request.mode === "navigate" &&
                url.origin === self.location.origin &&
                url.pathname.startsWith("/dashboard") &&
                !url.pathname.startsWith("/~oauth"),
              handler: "NetworkFirst",
              options: {
                cacheName: "moninvit-dashboard-pages",
                networkTimeoutSeconds: 4,
                precacheFallback: { fallbackURL: "/offline-dashboard.html" },
                expiration: { maxEntries: 12, maxAgeSeconds: 24 * 60 * 60 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: ({ request, url }) =>
                url.origin === self.location.origin &&
                url.pathname.startsWith("/assets/") &&
                ["script", "style", "font", "image"].includes(request.destination),
              handler: "CacheFirst",
              options: {
                cacheName: "moninvit-static-assets",
                expiration: { maxEntries: 120, maxAgeSeconds: 30 * 24 * 60 * 60 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
      }),
    ],
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    pages: [{ path: "/" }],
    prerender: { enabled: true, autoStaticPathsDiscovery: false },
  },
  nitro: {
    ...(isVercel ? { preset: "vercel" } : {}),
  },
});
