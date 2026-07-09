import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  useWedding,
  type Guest,
  type GuestSource,
  type RSVPStatus,
} from "@/lib/wedding-store";

export const Route = createFileRoute("/dashboard/invites")({
  component: GuestsPage,
});

const statusLabel: Record<RSVPStatus, string> = {
  confirmé: "Confirmé",
  en_attente: "En attente",
  décliné: "Décliné",
  sans_reponse: "Sans réponse",
};

const sourceLabel: Record<GuestSource, string> = {
  manuel: "Manuel",
  csv: "CSV",
  auto: "QR / lien",
  qr_signup: "QR",
};

function GuestsPage() {
  const { guests, ceremonies, addGuest, removeGuest, setRsvp } = useWedding();
  const [query, setQuery] = useState("");
  const [ceremonyFilter, setCeremonyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | RSVPStatus>("all");
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guests.filter((g) => {
      if (q && !g.name.toLowerCase().includes(q) && !(g.phone ?? "").includes(q))
        return false;
      if (ceremonyFilter !== "all" && !g.ceremonyIds.includes(ceremonyFilter))
        return false;
      if (statusFilter !== "all") {
        const rs = g.rsvps.map((r) => r.status);
        if (!rs.includes(statusFilter)) return false;
      }
      return true;
    });
  }, [guests, query, ceremonyFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-50">
            {guests.length} invités
          </p>
          <h1 className="mt-1 font-serif text-3xl italic">Vos invités</h1>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="rounded-full bg-primary px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-primary-foreground shadow-md shadow-primary/20 transition hover:opacity-90"
        >
          + Ajouter
        </button>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un nom, un numéro…"
          className="w-full rounded-full border border-input bg-background px-4 py-3 text-sm placeholder:opacity-40 focus:border-primary focus:outline-none"
        />
        <div className="flex flex-wrap gap-2">
          <Chip
            active={ceremonyFilter === "all"}
            onClick={() => setCeremonyFilter("all")}
          >
            Toutes étapes
          </Chip>
          {ceremonies.map((c) => (
            <Chip
              key={c.id}
              active={ceremonyFilter === c.id}
              onClick={() => setCeremonyFilter(c.id)}
              color={c.color}
            >
              {c.label}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "confirmé", "en_attente", "décliné"] as const).map((s) => (
            <Chip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
              {s === "all" ? "Tous statuts" : statusLabel[s as RSVPStatus]}
            </Chip>
          ))}
        </div>
      </div>

      {/* List */}
      <ul className="space-y-2">
        {filtered.map((g) => (
          <GuestRow
            key={g.id}
            guest={g}
            onRemove={() => removeGuest(g.id)}
            onSetRsvp={(cid, s) => setRsvp(g.id, cid, s)}
          />
        ))}
        {filtered.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-border p-8 text-center text-sm opacity-60">
            Aucun invité ne correspond aux filtres.
          </li>
        ) : null}
      </ul>

      {creating ? (
        <AddGuestSheet
          onClose={() => setCreating(false)}
          onSave={(g) => {
            addGuest(g);
            setCreating(false);
          }}
        />
      ) : null}
    </div>
  );
}

function Chip({
  active,
  onClick,
  color,
  children,
}: {
  active: boolean;
  onClick: () => void;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition " +
        (active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background text-foreground/70 hover:bg-accent/20")
      }
    >
      {color ? (
        <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
      ) : null}
      {children}
    </button>
  );
}

function GuestRow({
  guest,
  onRemove,
  onSetRsvp,
}: {
  guest: Guest;
  onRemove: () => void;
  onSetRsvp: (ceremonyId: string, status: RSVPStatus) => void;
}) {
  const { ceremonies } = useWedding();
  const [open, setOpen] = useState(false);

  return (
    <li className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-accent/30 font-serif italic">
          {guest.name[0]}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{guest.name}</p>
          <p className="truncate font-mono text-[10px] uppercase tracking-widest opacity-60">
            {guest.group} · {sourceLabel[guest.source]}
            {guest.phone ? " · " + guest.phone : ""}
          </p>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-full border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-widest transition hover:bg-accent/20"
        >
          {open ? "Fermer" : "RSVP"}
        </button>
      </div>

      {open ? (
        <div className="mt-4 space-y-2 border-t border-border pt-4">
          {guest.ceremonyIds.map((cid) => {
            const c = ceremonies.find((x) => x.id === cid);
            if (!c) return null;
            const rsvp = guest.rsvps.find((r) => r.ceremonyId === cid);
            return (
              <div key={cid} className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="truncate text-xs">{c.name}</span>
                </div>
                <div className="flex gap-1">
                  {(["confirmé", "en_attente", "décliné"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => onSetRsvp(cid, s)}
                      className={
                        "rounded-full px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest transition " +
                        ((rsvp?.status ?? "en_attente") === s
                          ? s === "confirmé"
                            ? "bg-primary text-primary-foreground"
                            : s === "décliné"
                              ? "bg-foreground text-background"
                              : "bg-muted text-foreground"
                          : "border border-border text-foreground/70 hover:bg-accent/20")
                      }
                    >
                      {statusLabel[s]}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          <div className="flex items-center justify-between pt-3">
            {guest.phone ? (
              <a
                href={`https://wa.me/${guest.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                  `Bonjour ${guest.name}, voici votre invitation à notre mariage : ${typeof window !== "undefined" ? window.location.origin : ""}/`,
                )}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-primary/30 px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest text-primary transition hover:bg-primary/10"
              >
                Envoyer WhatsApp
              </a>
            ) : (
              <span className="font-mono text-[9px] uppercase tracking-widest opacity-40">
                Pas de numéro
              </span>
            )}
            <button
              onClick={onRemove}
              className="font-mono text-[9px] uppercase tracking-widest text-destructive hover:underline"
            >
              Supprimer
            </button>
          </div>
        </div>
      ) : null}
    </li>
  );
}

function AddGuestSheet({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (g: {
    name: string;
    phone?: string;
    group: string;
    guestType: import("@/lib/guest-meta").GuestType;
    allowedPlusOnes: number;
    source: GuestSource;
    ceremonyIds: string[];
  }) => void;
}) {
  const { ceremonies } = useWedding();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [group, setGroup] = useState("Famille mariée");
  const [plus, setPlus] = useState(1);
  const [ids, setIds] = useState<string[]>(ceremonies.map((c) => c.id));

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl bg-background p-6 sm:rounded-3xl"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border sm:hidden" />
        <h3 className="font-serif text-xl italic">Nouvel invité</h3>
        <div className="mt-4 space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom complet"
            className="w-full rounded-full border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Téléphone WhatsApp"
            className="w-full rounded-full border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
          />
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="w-full rounded-full border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
          >
            {["Famille mariée", "Famille marié", "Amis", "Amies mariée", "Collègues", "VIP"].map(
              (g) => (
                <option key={g}>{g}</option>
              ),
            )}
          </select>
          <div className="flex items-center justify-between rounded-full border border-input px-4 py-2">
            <span className="font-mono text-[10px] uppercase tracking-widest opacity-60">
              Accompagnants autorisés
            </span>
            <div className="flex items-center gap-3">
              <button onClick={() => setPlus((v) => Math.max(0, v - 1))}>−</button>
              <span className="font-mono">{plus}</span>
              <button onClick={() => setPlus((v) => Math.min(9, v + 1))}>+</button>
            </div>
          </div>
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest opacity-60">
              Étapes invitées
            </p>
            <div className="flex flex-wrap gap-2">
              {ceremonies.map((c) => {
                const active = ids.includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() =>
                      setIds((prev) =>
                        active ? prev.filter((x) => x !== c.id) : [...prev, c.id],
                      )
                    }
                    className={
                      "flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition " +
                      (active
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-foreground/70")
                    }
                  >
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-border py-3 font-mono text-[10px] uppercase tracking-widest hover:bg-accent/20"
          >
            Annuler
          </button>
          <button
            disabled={!name.trim() || ids.length === 0}
            onClick={() =>
              onSave({
                name: name.trim(),
                phone: phone.trim() || undefined,
                group,
                guestType: "autre",
                allowedPlusOnes: plus,
                source: "manuel",
                ceremonyIds: ids,
              })
            }
            className="flex-1 rounded-full bg-primary py-3 font-mono text-[10px] uppercase tracking-widest text-primary-foreground disabled:opacity-40"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
