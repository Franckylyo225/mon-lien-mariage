export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

const PREVIEW_HOSTS = [
  "lovableproject.com",
  "lovableproject-dev.com",
  "beta.lovable.dev",
];

function isPreviewHost(hostname: string) {
  return (
    hostname.startsWith("id-preview--") ||
    hostname.startsWith("preview--") ||
    PREVIEW_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`))
  );
}

async function removeDashboardWorker() {
  if (!("serviceWorker" in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations
      .filter((registration) => {
        const path = new URL(registration.scope).pathname;
        return path === "/dashboard/" || path === "/";
      })
      .map((registration) => registration.unregister()),
  );
}

export async function registerDashboardServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  const disabled = new URLSearchParams(window.location.search).get("sw") === "off";
  const refused =
    !import.meta.env.PROD ||
    window.self !== window.top ||
    isPreviewHost(window.location.hostname) ||
    disabled;

  if (refused) {
    await removeDashboardWorker();
    return;
  }

  try {
    await navigator.serviceWorker.register("/sw.js", { scope: "/dashboard/" });
  } catch (error) {
    console.warn("PWA registration unavailable", error);
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    listeners.forEach((l) => l());
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    listeners.forEach((l) => l());
  });
}

export function getDeferredPrompt() {
  return deferredPrompt;
}

export function subscribeInstallPrompt(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && "ontouchend" in document);
}

export type InstallState = "installed" | "android" | "ios" | "unavailable";

export function getInstallState(): InstallState {
  if (isStandalone()) return "installed";
  if (isIos()) return "ios";
  if (deferredPrompt) return "android";
  return "unavailable";
}
