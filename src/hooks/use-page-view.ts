import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Records one page view per visitor session for a published invitation page.
 * Deduplicated with sessionStorage so a reload during the same visit doesn't
 * inflate the counter.
 */
export function usePageView(weddingId?: string | null) {
  useEffect(() => {
    if (!weddingId || typeof window === "undefined") return;
    const key = `mi_view_${weddingId}`;
    try {
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, "1");
    } catch {
      /* storage unavailable — count the view anyway */
    }
    void supabase.from("page_views").insert({
      wedding_id: weddingId,
      referrer: document.referrer ? document.referrer.slice(0, 300) : null,
    });
  }, [weddingId]);
}
