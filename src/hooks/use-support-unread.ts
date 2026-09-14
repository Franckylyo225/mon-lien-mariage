import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supportUnreadCount, adminSupportUnreadCount } from "@/lib/support.functions";

/**
 * Nombre de conversations de support contenant des messages non lus.
 * `scope` = "user" (réponses de l'équipe) ou "admin" (messages des clients).
 */
export function useSupportUnread(scope: "user" | "admin", enabled = true) {
  const fn = useServerFn(scope === "admin" ? adminSupportUnreadCount : supportUnreadCount);
  const [count, setCount] = useState(0);

  const refresh = useCallback(() => {
    if (!enabled) return;
    fn()
      .then((r: { count: number }) => setCount(r.count ?? 0))
      .catch(() => setCount(0));
  }, [fn, enabled]);

  useEffect(() => {
    refresh();
    if (!enabled) return;
    const id = window.setInterval(refresh, 60_000);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh, enabled]);

  return { count, refresh };
}
