import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useWedding, type RSVPStatus, type Guest, type Ceremony } from "@/lib/wedding-store";
import { IconChevronRight, IconTrendingUp, IconUsers, IconCheck, IconX, IconClock } from "@tabler/icons-react";

export const Route = createFileRoute("/dashboard/stats")({
  head: () => ({ meta: [{ title: "Statistiques RSVP — MonMariage.ci" }] }),
  component: StatsPage,
});

interface CeremonyStats {
  ceremony: Ceremony;
  invited: number;
  confirmed: number;
  declined: number;
  pending: number;
  noResponse: number;
  expectedAttendees: number; // confirmés + plusOnes
  responseRate: number; // % (confirmé+décliné)/invited
  confirmationRate: number; // % confirmé / répondu
  capacityFill: number | null; // % expected / capacity
}

function computeCeremonyStats(guests: Guest[], ceremony: Ceremony): CeremonyStats {
  const invitedGuests = guests.filter((g) => g.ceremonyIds.includes(ceremony.id));
  let confirmed = 0, declined = 0, pending = 0, noResponse = 0, expected = 0;
  for (const g of invitedGuests) {
    const r = g.rsvps.find((x) => x.ceremonyId === ceremony.id);
    const status: RSVPStatus = r?.status ?? "sans_reponse";
    if (status === "confirmé") {
      confirmed++;
      expected += 1 + (r?.plusOnes ?? 0);
    } else if (status === "décliné") declined++;
    else if (status === "en_attente") pending++;
    else noResponse++;
  }
  const invited = invitedGuests.length;
  const responded = confirmed + declined;
  const responseRate = invited > 0 ? Math.round(((responded + pending) / invited) * 100) : 0;
  const confirmationRate = responded > 0 ? Math.round((confirmed / responded) * 100) : 0;
  const capacityFill = ceremony.capacity ? Math.round((expected / ceremony.capacity) * 100) : null;
  return {
    ceremony,
    invited,
    confirmed,
    declined,
    pending,
    noResponse,
    expectedAttendees: expected,
    responseRate,
    confirmationRate,
    capacityFill,
  };
}

function StatsPage() {
  const { guests, ceremonies } = useWedding();

  const perCeremony = useMemo(
    () => ceremonies.map((c) => computeCeremonyStats(guests, c)),
    [guests, ceremonies],
  );

  const global = useMemo(() => {
    const totalInvited = guests.length;
    let anyConfirmed = 0, anyDeclined = 0, anyPending = 0, allNoResponse = 0;
    let totalExpected = 0;
    for (const g of guests) {
      const statuses = g.rsvps.map((r) => r.status);
      const hasConfirmed = statuses.includes("confirmé");
      const hasDeclined = statuses.includes("décliné");
      const hasPending = statuses.includes("en_attente");
      if (hasConfirmed) anyConfirmed++;
      else if (hasDeclined) anyDeclined++;
      else if (hasPending) anyPending++;
      else allNoResponse++;
      for (const r of g.rsvps) {
        if (r.status === "confirmé") totalExpected += 1 + (r.plusOnes ?? 0);
      }
    }
    const responded = anyConfirmed + anyDeclined + anyPending;
    const responseRate = totalInvited ? Math.round((responded / totalInvited) * 100) : 0;
    const confirmationRate = anyConfirmed + anyDeclined > 0
      ? Math.round((anyConfirmed / (anyConfirmed + anyDeclined)) * 100)
      : 0;
    return {
      totalInvited,
      anyConfirmed,
      anyDeclined,
      anyPending,
      allNoResponse,
      totalExpected,
      responseRate,
      confirmationRate,
    };
  }, [guests]);

  const byGroup = useMemo(() => {
    const map = new Map<string, { total: number; confirmed: number }>();
    for (const g of guests) {
      const key = g.group?.trim() || "Sans groupe";
      const entry = map.get(key) ?? { total: 0, confirmed: 0 };
      entry.total++;
      if (g.rsvps.some((r) => r.status === "confirmé")) entry.confirmed++;
      map.set(key, entry);
    }
    return Array.from(map.entries())
      .map(([label, v]) => ({ label, ...v, rate: v.total ? Math.round((v.confirmed / v.total) * 100) : 0 }))
      .sort((a, b) => b.total - a.total);
  }, [guests]);

  if (ceremonies.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="font-serif text-3xl italic">Statistiques RSVP</h1>
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm opacity-70">
          Ajoutez d'abord des étapes pour visualiser les statistiques.
          <div className="mt-3">
            <Link to="/dashboard/ceremonies" className="text-primary underline text-[13px]">
              Créer une étape
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4">
      <header>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-50">
          Vue d'ensemble
        </p>
        <h1 className="mt-1 font-serif text-3xl italic">Statistiques RSVP</h1>
      </header>

      {/* Global metrics */}
      <section className="grid grid-cols-2 gap-3">
        <BigMetric
          label="Invités"
          value={global.totalInvited}
          sub={`${global.totalExpected} attendus`}
          Icon={IconUsers}
        />
        <BigMetric
          label="Taux de réponse"
          value={`${global.responseRate}%`}
          sub={`${global.totalInvited - global.allNoResponse}/${global.totalInvited} répondu`}
          Icon={IconTrendingUp}
          progress={global.responseRate}
        />
      </section>

      <section className="grid grid-cols-3 gap-2">
        <MiniStat label="Confirmés" value={global.anyConfirmed} tone="success" Icon={IconCheck} />
        <MiniStat label="En attente" value={global.anyPending} tone="warning" Icon={IconClock} />
        <MiniStat label="Déclinés" value={global.anyDeclined} tone="danger" Icon={IconX} />
      </section>

      {/* Confirmation rate donut */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-60">
              Taux de confirmation
            </p>
            <p className="mt-1 font-serif text-3xl italic">{global.confirmationRate}%</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Parmi les invités ayant répondu
            </p>
          </div>
          <Donut value={global.confirmationRate} />
        </div>
      </section>

      {/* Per ceremony */}
      <section>
        <h2 className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Par cérémonie
        </h2>
        <ul className="space-y-3">
          {perCeremony.map((s) => (
            <li key={s.ceremony.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: s.ceremony.color }}
                    />
                    <p className="truncate font-serif text-lg italic">{s.ceremony.label}</p>
                  </div>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {s.invited} invités · {s.expectedAttendees} attendus
                  </p>
                </div>
                <Link
                  to="/dashboard/ceremonies/$id"
                  params={{ id: s.ceremony.id }}
                  aria-label={`Détails ${s.ceremony.label}`}
                  className="grid size-8 place-items-center rounded-full text-muted-foreground transition hover:bg-accent/20"
                >
                  <IconChevronRight size={16} />
                </Link>
              </div>

              {/* Stacked repartition bar */}
              <StackedBar
                total={s.invited}
                segments={[
                  { value: s.confirmed, color: "#059669", label: "Confirmés" },
                  { value: s.pending, color: "#d97706", label: "En attente" },
                  { value: s.declined, color: "#dc2626", label: "Déclinés" },
                  { value: s.noResponse, color: "#94a3b8", label: "Sans réponse" },
                ]}
              />

              <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                <Cell label="Conf." value={s.confirmed} tone="#059669" />
                <Cell label="Att." value={s.pending} tone="#d97706" />
                <Cell label="Décl." value={s.declined} tone="#dc2626" />
                <Cell label="—" value={s.noResponse} tone="#94a3b8" />
              </div>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                <span>
                  Réponse{" "}
                  <span className="font-medium text-foreground">{s.responseRate}%</span>
                </span>
                <span>
                  Confirmation{" "}
                  <span className="font-medium text-foreground">{s.confirmationRate}%</span>
                </span>
                {s.capacityFill !== null ? (
                  <span>
                    Capacité{" "}
                    <span
                      className={
                        "font-medium " +
                        (s.capacityFill > 100
                          ? "text-destructive"
                          : s.capacityFill > 85
                            ? "text-amber-600"
                            : "text-foreground")
                      }
                    >
                      {s.capacityFill}%
                    </span>{" "}
                    <span className="opacity-60">({s.ceremony.capacity} places)</span>
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Repartition by group */}
      {byGroup.length > 0 ? (
        <section>
          <h2 className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Répartition par groupe
          </h2>
          <ul className="space-y-2 rounded-2xl border border-border bg-card p-4">
            {byGroup.map((g) => (
              <li key={g.label}>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="truncate">{g.label}</span>
                  <span className="font-mono text-[10px] opacity-70">
                    {g.confirmed}/{g.total} · {g.rate}%
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: g.rate + "%" }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function BigMetric({
  label,
  value,
  sub,
  Icon,
  progress,
}: {
  label: string;
  value: string | number;
  sub?: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  progress?: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon size={14} strokeWidth={1.75} />
        <span className="font-mono text-[10px] uppercase tracking-[0.18em]">{label}</span>
      </div>
      <p className="mt-2 font-serif text-3xl italic leading-none">{value}</p>
      {sub ? <p className="mt-1 text-[11px] text-muted-foreground">{sub}</p> : null}
      {typeof progress === "number" ? (
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-foreground transition-all"
            style={{ width: Math.min(100, progress) + "%" }}
          />
        </div>
      ) : null}
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone,
  Icon,
}: {
  label: string;
  value: number;
  tone: "success" | "warning" | "danger";
  Icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  const map = {
    success: { fg: "#065F46", bg: "#05966915", border: "#05966930" },
    warning: { fg: "#92400E", bg: "#d9770615", border: "#d9770630" },
    danger: { fg: "#991B1B", bg: "#dc262615", border: "#dc262630" },
  } as const;
  const c = map[tone];
  return (
    <div
      className="rounded-xl border p-3"
      style={{ backgroundColor: c.bg, borderColor: c.border, color: c.fg }}
    >
      <div className="flex items-center gap-1.5">
        <Icon size={12} />
        <span className="font-mono text-[9px] uppercase tracking-widest">{label}</span>
      </div>
      <p className="mt-1 font-serif text-xl italic leading-none">{value}</p>
    </div>
  );
}

function StackedBar({
  total,
  segments,
}: {
  total: number;
  segments: { value: number; color: string; label: string }[];
}) {
  if (total === 0) {
    return (
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted" aria-label="Aucun invité" />
    );
  }
  return (
    <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-muted" role="img" aria-label="Répartition RSVP">
      {segments.map((s) =>
        s.value > 0 ? (
          <div
            key={s.label}
            title={`${s.label}: ${s.value}`}
            style={{ width: (s.value / total) * 100 + "%", backgroundColor: s.color }}
          />
        ) : null,
      )}
    </div>
  );
}

function Cell({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-lg bg-muted/40 py-1.5">
      <p className="font-serif text-base italic leading-none" style={{ color: tone }}>
        {value}
      </p>
      <p className="mt-1 font-mono text-[8px] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function Donut({ value }: { value: number }) {
  const size = 72;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, value) / 100) * c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="hsl(var(--muted))" strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="hsl(var(--primary))"
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}
