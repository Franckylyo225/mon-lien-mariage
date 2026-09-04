/**
 * Facebook Pixel (Meta Pixel) wrapper.
 * The base pixel is loaded dynamically only after the user grants analytics
 * or marketing consent (see src/lib/consent.tsx). This avoids firing the
 * pixel before the ConsentManager choice is recorded.
 */

export const FB_PIXEL_ID = "262463860846118";

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

type Fbq = ((command: "init" | "track" | "trackCustom", ...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  loaded?: boolean;
  version?: string;
  push?: (x: unknown) => void;
};

export const FB_EVENTS = [
  "PageView",
  "Lead",
  "Purchase",
  "CompleteRegistration",
  "Contact",
] as const;

type FbEvent = (typeof FB_EVENTS)[number];

export function fbq(
  command: "track" | "trackCustom",
  eventName: FbEvent | string,
  params?: Record<string, unknown>,
) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  window.fbq(command, eventName, params);
}

export function initFacebookPixel() {
  if (typeof window === "undefined") return;

  const w = window;
  if (w.fbq?.loaded) return;

  const n: Fbq = (w.fbq = function (
    this: unknown,
    ...args: unknown[]
  ) {
    if (n.callMethod) {
      n.callMethod.apply(this === w ? n : this, args);
    } else {
      n.queue?.push(args);
    }
  });

  if (!w._fbq) w._fbq = n;
  n.push = n as unknown as (x: unknown) => void;
  n.loaded = true;

  n.version = "2.0";
  n.queue = [];

  const d = document;
  const t = d.createElement("script");
  t.async = true;
  t.src = "https://connect.facebook.net/en_US/fbevents.js";
  const s = d.getElementsByTagName("script")[0];
  s?.parentNode?.insertBefore(t, s);

  n("init", FB_PIXEL_ID);
  n("track", "PageView");
}


export function updateFacebookConsent(allowed: boolean) {
  if (typeof window === "undefined") return;
  if (allowed) initFacebookPixel();
}
