import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { useWedding, type Guest, type RSVPStatus } from "@/lib/wedding-store";
import { guestTypeMeta, guestTypeOrder, type GuestType } from "@/lib/guest-meta";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard/guests/")({
  head: () => ({ meta: [{ title: "Mes invités — MonInvit.com" }] }),
  component: GuestsPage,
});

type PublicRsvpRow = {
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

function GuestsPage() {
  const { guests, ceremonies, weddingId } = useWedding();
  const [publicRsvps, setPublicRsvps] = useState<PublicRsvpRow[]>([]);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<GuestType | "all">("all");
  const [ceremonyFilter, setCeremonyFilter] = useState<string>("all");

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
      if (!cancelled && !error && data) setPublicRsvps(data as PublicRsvpRow[]);
    })();
    return () => {
      cancelled = true;
    };
  }, [weddingId]);

  // Merge public RSVPs (submitted through the invitation link) into the guests
  // list as synthetic entries, grouped by name + phone. Skip duplicates that
  // already exist as manually-added guests (same name, case-insensitive).
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


  const filtered = useMemo(() => {
    return allGuests.filter((g) => {
      if (query && !g.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (typeFilter !== "all" && g.guestType !== typeFilter) return false;
      if (ceremonyFilter !== "all" && !g.ceremonyIds.includes(ceremonyFilter)) return false;
      return true;
    });
  }, [allGuests, query, typeFilter, ceremonyFilter]);

  const totalCeremonies = new Set(allGuests.flatMap((g) => g.ceremonyIds)).size;

  const exportXlsx = () => {
    const ceremonyLabel = (id: string) => {
      const c = ceremonies.find((x) => x.id === id);
      return c?.name || c?.label || id;
    };
    const rows = filtered.map((g) => {
      const perCeremony = g.rsvps.reduce<Record<string, RSVPStatus>>((acc, r) => {
        acc[r.ceremonyId] = r.status;
        return acc;
      }, {});
      const plusOnes = g.rsvps.reduce((sum, r) => sum + (r.plusOnes ?? 0), 0);
      const global = globalRsvp(g.rsvps.map((r) => r.status));
      return {
        Nom: g.name,
        Téléphone: g.phone ?? "",
        Email: (g as { email?: string }).email ?? "",
        Type: guestTypeMeta[g.guestType]?.short ?? g.guestType,
        Groupe: g.group ?? "",
        Source: g.source === "auto" ? "Auto-inscription" : "Manuel",
        "Statut global": global,
        "Accompagnants": plusOnes,
        Étapes: g.ceremonyIds.map(ceremonyLabel).join(", "),
        "Détails par étape": g.ceremonyIds
          .map((id) => `${ceremonyLabel(id)}: ${perCeremony[id] ?? "en_attente"}`)
          .join(" | "),
        Message: g.message ?? "",
      };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [
      { wch: 24 },
      { wch: 16 },
      { wch: 24 },
      { wch: 14 },
      { wch: 18 },
      { wch: 16 },
      { wch: 14 },
      { wch: 14 },
      { wch: 30 },
      { wch: 40 },
      { wch: 40 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invités");
    const stamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `invites-moninvit-${stamp}.xlsx`);
  };


  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">
            {allGuests.length} invités · {totalCeremonies} étapes couvertes
          </p>
          <h1 className="mt-1 font-serif text-3xl italic">Mes invités</h1>
        </div>
        <Link
          to="/dashboard/guests/new"
          className="shrink-0 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          + Ajouter
        </Link>
      </header>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher un invité…"
        className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      />

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <FilterChip active={typeFilter === "all"} onClick={() => setTypeFilter("all")}>
          Tous les types
        </FilterChip>
        {guestTypeOrder.map((t) => (
          <FilterChip key={t} active={typeFilter === t} onClick={() => setTypeFilter(t)}>
            {guestTypeMeta[t].short}
          </FilterChip>
        ))}
      </div>

      <select
        value={ceremonyFilter}
        onChange={(e) => setCeremonyFilter(e.target.value)}
        className="w-full rounded-lg border border-input bg-card px-4 py-2.5 text-sm"
      >
        <option value="all">Toutes les étapes</option>
        {ceremonies.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name || c.label}
          </option>
        ))}
      </select>

      <ul className="divide-y divide-border rounded-xl border border-border bg-card">
        {filtered.length === 0 ? (
          <li className="p-8 text-center text-sm text-muted-foreground">
            Aucun invité ne correspond.
          </li>
        ) : (
          filtered.map((g) => {
            const meta = guestTypeMeta[g.guestType];
            const initials = g.name
              .split(" ")
              .slice(0, 2)
              .map((s) => s[0])
              .join("");
            const global = globalRsvp(g.rsvps.map((r) => r.status));
            return (
              <li key={g.id} className="p-4">
                <div className="flex items-start gap-3">
                  <span
                    className="grid size-11 shrink-0 place-items-center rounded-full font-medium"
                    style={{ backgroundColor: meta.bg, color: meta.fg }}
                  >
                    {initials.toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{g.name}</p>
                      <span
                        className={
                          "size-2 shrink-0 rounded-full " +
                          (global === "confirmé"
                            ? "bg-primary"
                            : global === "décliné"
                              ? "bg-muted-foreground"
                              : "bg-amber-500")
                        }
                      />
                    </div>
                    {g.phone ? (
                      <p className="text-xs text-muted-foreground">{g.phone}</p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{ backgroundColor: meta.bg, color: meta.fg }}
                      >
                        {meta.short}
                      </span>
                      {g.ceremonyIds.slice(0, 3).map((cid) => {
                        const c = ceremonies.find((x) => x.id === cid);
                        if (!c) return null;
                        return (
                          <span
                            key={cid}
                            className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground"
                          >
                            {c.label}
                          </span>
                        );
                      })}
                      {g.ceremonyIds.length > 3 ? (
                        <span className="text-[10px] text-muted-foreground">
                          +{g.ceremonyIds.length - 3}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "shrink-0 rounded-full border px-3 py-1.5 text-xs transition " +
        (active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card hover:bg-secondary/40")
      }
    >
      {children}
    </button>
  );
}

function globalRsvp(all: RSVPStatus[]): RSVPStatus {
  if (all.length === 0) return "en_attente";
  if (all.every((s) => s === "confirmé")) return "confirmé";
  if (all.every((s) => s === "décliné")) return "décliné";
  return "en_attente";
}
