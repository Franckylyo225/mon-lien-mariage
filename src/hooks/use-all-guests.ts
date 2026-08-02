import { useEffect, useMemo, useState } from "react";
import { useWedding, type Guest, type RSVPStatus } from "@/lib/wedding-store";
import type { GuestType } from "@/lib/guest-meta";
import { supabase } from "@/integrations/supabase/client";

export type PublicRsvpRow = {
  id: string;
  ceremony_id: string | null;
  guest_name: string;
  guest_phone: string | null;
  guest_type: string | null;
  companions: number;
  attending: boolean;
  message: string | null;
  dietary_notes: string | null;
  created_at: string;
};

/**
 * Loads the public RSVPs (submitted through the invitation link) and merges
 * them into the manually-managed guest list as synthetic entries, grouped by
 * name + phone. Shared by the guest list and the RSVP statistics page so both
 * always show the same numbers.
 */
export function useAllGuests() {
  const { guests, weddingId } = useWedding();
  const [publicRsvps, setPublicRsvps] = useState<PublicRsvpRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!weddingId) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("rsvps")
        .select(
          "id, ceremony_id, guest_name, guest_phone, guest_type, companions, attending, message, dietary_notes, created_at",
        )
        .eq("wedding_id", weddingId)
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (!error && data) setPublicRsvps(data as PublicRsvpRow[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [weddingId]);

  const publicGuests: Guest[] = useMemo(() => {
    const existingNames = new Set(guests.map((g) => g.name.trim().toLowerCase()));
    const grouped = new Map<string, Guest>();
    for (const r of publicRsvps) {
      const key = `${r.guest_name.trim().toLowerCase()}|${(r.guest_phone ?? "").trim()}`;
      if (existingNames.has(r.guest_name.trim().toLowerCase())) continue;
      const gt = (r.guest_type as GuestType) || "autre";
      const status: RSVPStatus = r.attending ? "confirmé" : "décliné";
      const existing = grouped.get(key);
      if (existing) {
        if (r.ceremony_id && !existing.ceremonyIds.includes(r.ceremony_id)) {
          existing.ceremonyIds.push(r.ceremony_id);
          existing.rsvps.push({ ceremonyId: r.ceremony_id, status, plusOnes: r.companions });
        }
      } else {
        grouped.set(key, {
          id: `rsvp-${r.id}`,
          name: r.guest_name,
          phone: r.guest_phone ?? undefined,
          group: "Auto-inscription",
          guestType: gt,
          allowedPlusOnes: r.companions,
          source: "auto",
          ceremonyIds: r.ceremony_id ? [r.ceremony_id] : [],
          rsvps: r.ceremony_id
            ? [{ ceremonyId: r.ceremony_id, status, plusOnes: r.companions }]
            : [],
          message: r.message ?? undefined,
        } as Guest);
      }
    }
    return Array.from(grouped.values());
  }, [publicRsvps, guests]);

  const allGuests = useMemo(() => [...publicGuests, ...guests], [publicGuests, guests]);

  return { allGuests, publicGuests, publicRsvps, loading };
}
