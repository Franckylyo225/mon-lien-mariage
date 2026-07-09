import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useWedding, type RSVPStatus } from "@/lib/wedding-store";
import { guestTypeMeta, guestTypeOrder, type GuestType } from "@/lib/guest-meta";

export const Route = createFileRoute("/dashboard/guests/")({
  head: () => ({ meta: [{ title: "Mes invités — MonMariage.ci" }] }),
  component: GuestsPage,
});

function GuestsPage() {
  const { guests, ceremonies } = useWedding();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<GuestType | "all">("all");
  const [ceremonyFilter, setCeremonyFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return guests.filter((g) => {
      if (query && !g.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (typeFilter !== "all" && g.guestType !== typeFilter) return false;
      if (ceremonyFilter !== "all" && !g.ceremonyIds.includes(ceremonyFilter)) return false;
      return true;
    });
  }, [guests, query, typeFilter, ceremonyFilter]);

  const totalCeremonies = new Set(guests.flatMap((g) => g.ceremonyIds)).size;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">
            {guests.length} invités · {totalCeremonies} étapes couvertes
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
