import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AppNotification {
  id: string;
  wedding_id: string | null;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
}

/**
 * Subscribes to the current user's notifications with realtime updates.
 * Returns the latest 30 notifications ordered by newest first.
 */
export function useNotifications(userId: string | null | undefined) {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("notifications")
      .select("id, wedding_id, type, title, body, data, read_at, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30);
    setItems((data ?? []) as AppNotification[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setItems((prev) => [payload.new as AppNotification, ...prev].slice(0, 30));
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const unreadCount = items.filter((n) => !n.read_at).length;

  const markAllRead = useCallback(async () => {
    if (!userId) return;
    const unreadIds = items.filter((n) => !n.read_at).map((n) => n.id);
    if (unreadIds.length === 0) return;
    const nowIso = new Date().toISOString();
    setItems((prev) =>
      prev.map((n) => (n.read_at ? n : { ...n, read_at: nowIso })),
    );
    await supabase
      .from("notifications")
      .update({ read_at: nowIso })
      .in("id", unreadIds);
  }, [items, userId]);

  const markOneRead = useCallback(
    async (id: string) => {
      const nowIso = new Date().toISOString();
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: nowIso } : n)),
      );
      await supabase.from("notifications").update({ read_at: nowIso }).eq("id", id);
    },
    [],
  );

  return { items, unreadCount, loading, markAllRead, markOneRead, refresh: load };
}
