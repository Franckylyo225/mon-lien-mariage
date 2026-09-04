import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { fbq } from "@/lib/facebook-pixel";

/**
 * Track a Facebook Pixel PageView on every client-side route change.
 * The initial PageView is already emitted when the pixel script loads.
 */
export function useFacebookPixelPageView() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    fbq("track", "PageView", { page_path: pathname });
  }, [pathname]);
}
