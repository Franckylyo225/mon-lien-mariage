import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { IconCheck, IconChevronRight, IconLock } from "@tabler/icons-react";
import {
  useWedding,
  daysUntil,
  formatFrenchDate,
} from "@/lib/wedding-store";
import { cn } from "@/lib/utils";
import { BasicInfoSheet } from "@/components/dashboard/BasicInfoSheet";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Tableau de bord — MonMariage.ci" }] }),
  component: DashboardHome,
});

type ChecklistItem = {
  key: string;
  label: string;
  description: string;
  done: boolean;
  onClick?: () => void;
  to?:
    | "/dashboard/ceremonies"
    | "/dashboard/guests"
    | "/dashboard/landing"
    | "/publish";
  locked?: boolean;
};

function DashboardHome() {
  const { couple, ceremonies, guests } = useWedding();
  const [infoSheetOpen, setInfoSheetOpen] = useState(false);

  // ---- 5 configuration criteria (1 point each)
  const infosDone = !!couple.brideName && !!couple.groomName && !!couple.weddingDate;
  const programmeDone = ceremonies.some((c) => c.date && c.venue);
  const pageDone = !!couple.heroImageUrl;
  const invitesDone = guests.length >= 5;
  const canPublish = infosDone && programmeDone && pageDone && invitesDone;
  const publishDone = !!couple.isPublished;

  const criteria = [infosDone, programmeDone, pageDone, invitesDone, publishDone];
  const done = criteria.filter(Boolean).length;
  const total = criteria.length;
  const pct = Math.round((done / total) * 100);

  const items: ChecklistItem[] = [
    {
      key: "infos",
      label: "Informations de base",
      description: "Prénoms, type, dates, ville",
      done: infosDone,
      onClick: () => setInfoSheetOpen(true),
    },
    {
      key: "programme",
      label: "Le programme",
      description: "Dot, civil, réception et leurs détails",
      done: programmeDone,
      to: "/dashboard/ceremonies",
    },
    {
      key: "page",
      label: "Ma page d'invitation",
      description: "Photos, textes, thème et mise en page",
      done: pageDone,
      to: "/dashboard/landing",
    },
    {
      key: "invites",
      label: "Les invités",
      description: "Votre liste de convives",
      done: invitesDone,
      to: "/dashboard/guests",
    },
    {
      key: "publish",
      label: "Publier et partager",
      description: "Activer le lien et le QR code",
      done: publishDone,
      to: canPublish ? "/publish" : undefined,
      locked: !canPublish,
    },
  ];

  const completed = items.filter((i) => i.done);
  const remaining = items.filter((i) => !i.done);
  const allComplete = remaining.length === 0;

  const days = couple.weddingDate ? daysUntil(couple.weddingDate) : null;
  const brideName = couple.brideName || "Prénom A";
  const groomName = couple.groomName || "Prénom B";

  return (
    <div className="space-y-8 pt-4">
      {/* Bloc 1 — Identité */}
      <section className="text-center">
        <p className="font-serif text-[24px] italic leading-tight">
          {brideName}
          <span className="mx-1 text-primary">&amp;</span>
          {groomName}
        </p>
        {couple.weddingDate ? (
          <p className="mt-2 text-[12px] text-muted-foreground">
            {formatFrenchDate(couple.weddingDate)}
            {couple.city ? <> · {couple.city}</> : null}
            {days !== null ? <> · <span className="text-primary">{days} jours</span></> : null}
          </p>
        ) : (
          <button
            onClick={() => setInfoSheetOpen(true)}
            className="mt-2 inline-block text-[12px] italic text-muted-foreground underline"
          >
            Date à définir
          </button>
        )}
      </section>

      {/* Bloc 2 — Progression */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Configuration
          </p>
          <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {done} / {total}
          </p>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-foreground transition-all duration-500 ease-out"
            style={{ width: pct + "%" }}
          />
        </div>
      </section>

      {/* Bloc 3 — Checklist */}
      <section className="space-y-4">
        {completed.length > 0 ? (
          <ul className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border bg-card/60">
            {completed.map((i) => (
              <ChecklistRow key={i.key} item={i} />
            ))}
          </ul>
        ) : null}

        {remaining.length > 0 ? (
          <ul className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border bg-card">
            {remaining.map((i) => (
              <ChecklistRow key={i.key} item={i} />
            ))}
          </ul>
        ) : null}

        {allComplete ? (
          <div className="rounded-xl border border-border bg-card p-5 text-center">
            <p className="font-serif text-xl italic">Tout est prêt</p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Publiez votre mariage !
            </p>
            <Link
              to="/publish"
              className="mt-4 block w-full rounded-lg bg-foreground py-3 text-[13px] font-medium text-background transition active:scale-[0.99]"
            >
              Publier
            </Link>
          </div>
        ) : null}
      </section>

      <BasicInfoSheet open={infoSheetOpen} onOpenChange={setInfoSheetOpen} />
    </div>
  );
}

function ChecklistRow({ item }: { item: ChecklistItem }) {
  const clickable = !item.locked && (item.to || item.onClick);
  const inner = (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3.5",
        clickable && "transition active:bg-secondary/60",
        item.done && !item.onClick && "opacity-70",
      )}
    >
      <span
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-full",
          item.done
            ? "bg-foreground text-background"
            : "border border-border",
        )}
      >
        {item.done ? <IconCheck size={12} strokeWidth={3} /> : null}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-[13px]",
            item.done && !item.onClick && "line-through text-muted-foreground",
          )}
        >
          {item.label}
        </p>
        <p className="truncate text-[11px] text-muted-foreground">
          {item.description}
        </p>
      </div>
      {item.locked ? (
        <IconLock size={16} className="text-muted-foreground" />
      ) : clickable ? (
        <IconChevronRight size={16} className="text-muted-foreground" />
      ) : null}
    </div>
  );

  if (item.locked) return <li>{inner}</li>;
  if (item.onClick) {
    return (
      <li>
        <button type="button" onClick={item.onClick} className="w-full text-left">
          {inner}
        </button>
      </li>
    );
  }
  if (item.to) {
    return (
      <li>
        <Link to={item.to}>{inner}</Link>
      </li>
    );
  }
  return <li>{inner}</li>;
}
