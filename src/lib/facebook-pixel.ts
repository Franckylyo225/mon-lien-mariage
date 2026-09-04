/**
 * Facebook Pixel (Meta Pixel) wrapper.
 * The base pixel script is injected in __root.tsx; this module only
 * initialises / resets it in response to the user's consent choices.
 */

export const FB_PIXEL_ID = "262463860846118";

declare global {
  interface Window {
    fbq?:
      | ((
          command: "track" | "trackCustom" | "init",
          eventName: string,
          params?: Record<string, unknown>,
        ) => void)
      & {
        callMethod?: (...args: unknown[]) => void;
        queue?: unknown[];
        loaded?: boolean;
        version?: string;
        push?: (x: unknown) => void;
      };
  }
}

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
  if (typeof window === "undefined" || !window.fbq) return;
  if (command === "trackCustom") {
    window.fbq(command, eventName, params);
  } else {
    window.fbq(command, eventName, params);
  }
}

export function initFacebookPixel() {
  if (typeof window === "undefined") return;
  if (window.fbq?.loaded) return;

  const w = window;
  const d = document;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existing: any = w.fbq;
  if (existing) return;

  const n = (w.fbq = function () {
    // eslint-disable-next-line prefer-rest-params
    n.callMethod ? n.callMethod.apply(n, arguments as never) : n.queue?.push(arguments);
  } as Window["fbq"]);

  if (!w._fbq) w._fbq = n;
  if (n) {
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
  }

  const t = d.createElement("script");
  t.async = true;
  t.src = "https://connect.facebook.net/en_US/fbevents.js";
  const s = d.getElementsByTagName("script")[0];
  s?.parentNode?.insertBefore(t, s);

  n?.("init", FB_PIXEL_ID);
  n?.("track", "PageView");
}

export function updateFacebookConsent(allowed: boolean) {
  if (typeof window === "undefined" || !window.fbq) return;
  // Meta consent mode API is not identical to GTM, but we can at least
  // avoid loading the pixel script when consent is denied. If already
  // loaded, we do nothing (Facebook does not provide a granular revoke).
  if (allowed) initFacebookPixel();
}
