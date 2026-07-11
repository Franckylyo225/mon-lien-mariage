import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  IconArrowRight,
  IconCalendarEvent,
  IconCheck,
  IconChevronRight,
  IconCircleCheck,
  IconLayout,
  IconLayoutList,

  IconLock,
  IconPencil,
  IconShare,
  IconUsers,
} from "@tabler/icons-react";
import {
  useWedding,
  daysUntil,
  formatFrenchDate,
} from "@/lib/wedding-store";
import { cn } from "@/lib/utils";
import { BasicInfoSheet } from "@/components/dashboard/BasicInfoSheet";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Tableau de bord — MonInvit.com" }] }),
  component: DashboardHome,
});

type TodoItem = {
  key: string;
  label: string;
  description: string;
  Icon: typeof IconCalendarEvent;
  to: "/dashboard/ceremonies" | "/dashboard/landing" | "/dashboard/guests";
};

function DashboardHome() {
  const { couple, ceremonies, guests, weddings } = useWedding();
  const navigate = useNavigate();
  const [infoSheetOpen, setInfoSheetOpen] = useState(false);

  // ---- 5 configuration criteria
  const infosDone = !!couple.brideName && !!couple.groomName && !!couple.weddingDate;
  const themeDone = !!couple.theme;
  const programmeDone = ceremonies.some((c) => c.date && c.venue);
  const pageDone = !!couple.heroImageUrl;
  const invitesDone = guests.length >= 5;

  const criteria = [infosDone, themeDone, programmeDone, pageDone, invitesDone];
  const done = criteria.filter(Boolean).length;
  const total = criteria.length;
  const pct = Math.round((done / total) * 100);

  const canPublish = programmeDone && pageDone && invitesDone;
  const isPublished = !!couple.isPublished;

  // ---- Done items (compact list)
  const doneItems: {
    key: string;
    label: string;
    onEdit: () => void;
  }[] = [];
  if (infosDone) {
    doneItems.push({
      key: "infos",
      label: "Informations de base",
      onEdit: () => setInfoSheetOpen(true),
    });
  }
  if (themeDone) {
    doneItems.push({
      key: "theme",
      label: "Thème choisi",
      onEdit: () => navigate({ to: "/dashboard/landing" }),
    });
  }
  if (programmeDone) {
    doneItems.push({
      key: "programme",
      label: "Programme",
      onEdit: () => navigate({ to: "/dashboard/ceremonies" }),
    });
  }
  if (pageDone) {
    doneItems.push({
      key: "page",
      label: "Photo du couple",
      onEdit: () => navigate({ to: "/dashboard/landing" }),
    });
  }
  if (invitesDone) {
    doneItems.push({
      key: "invites",
      label: "Invités",
      onEdit: () => navigate({ to: "/dashboard/guests" }),
    });
  }

  // ---- Remaining actionable items (only 3 tracked cards per spec)
  const allTodos: (TodoItem & { done: boolean })[] = [
    {
      key: "programme",
      label: "Le programme",
      description: "Dot, civil, réception…",
      Icon: IconCalendarEvent,
      to: "/dashboard/ceremonies",
      done: programmeDone,
    },
    {
      key: "page",
      label: "Ma page d'invitation",
      description: "Photos, textes, mise en page",
      Icon: IconLayout,
      to: "/dashboard/landing",
      done: pageDone,
    },
    {
      key: "invites",
      label: "Les invités",
      description: "Votre liste de convives",
      Icon: IconUsers,
      to: "/dashboard/guests",
      done: invitesDone,
    },
  ];
  const todos = allTodos.filter((i) => !i.done);

  // If infos incomplete, surface a card to open the sheet at the top of todos
  const showInfosCard = !infosDone;

  const days = couple.weddingDate ? daysUntil(couple.weddingDate) : null;
  const brideName = couple.brideName || "Prénom A";
  const groomName = couple.groomName || "Prénom B";

  const publicUrl =
    couple.slug && typeof window !== "undefined"
      ? `${window.location.host}/e/${couple.slug}`
      : couple.slug
        ? `moninvit.com/e/${couple.slug}`
        : "";

  const handleShare = async () => {
    const url =
      couple.slug && typeof window !== "undefined"
        ? `${window.location.origin}/e/${couple.slug}`
        : "";
    if (!url) return;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: `${brideName} & ${groomName}`, url });
      } catch {
        // user cancelled
      }
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="space-y-7 pt-4">
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
            {days !== null ? (
              <>
                {" · "}
                <span className="font-semibold text-primary">{days} jours</span>
              </>
            ) : null}
          </p>
        ) : (
          <button
            onClick={() => setInfoSheetOpen(true)}
            className="mt-2 inline-block text-[12px] italic text-muted-foreground underline"
          >
            Date à définir
          </button>
        )}
        {weddings.length > 1 ? (
          <Link
            to="/dashboard/events"
            className="mt-2 inline-flex items-center gap-1 text-[10px] text-muted-foreground transition hover:text-foreground"
          >
            <IconLayoutList size={11} strokeWidth={1.75} />
            <span>Mes événements</span>
          </Link>
        ) : null}
      </section>


      {/* Bloc 2 — Progression */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Configuration
          </p>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {done} / {total}
          </p>
        </div>
        <div className="h-[5px] overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-foreground transition-all duration-500 ease-out"
            style={{ width: pct + "%" }}
          />
        </div>
      </section>

      {/* Bloc 3 — Déjà fait */}
      {doneItems.length > 0 ? (
        <section>
          <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            Déjà fait
          </p>
          <ul className="divide-y divide-border/60">
            {doneItems.map((i) => (
              <li key={i.key} className="flex items-center gap-3 py-2.5">
                <span className="grid size-[18px] shrink-0 place-items-center rounded-full bg-foreground text-background">
                  <IconCheck size={11} strokeWidth={3} />
                </span>
                <p className="flex-1 truncate text-[12px] text-muted-foreground line-through">
                  {i.label}
                </p>
                <button
                  type="button"
                  onClick={i.onEdit}
                  className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] text-muted-foreground transition active:bg-secondary/60"
                >
                  <span>Modifier</span>
                  <IconPencil size={12} strokeWidth={1.75} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Bloc 4 — À compléter */}
      {todos.length > 0 || showInfosCard ? (
        <section>
          <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            À compléter
          </p>
          <ul className="space-y-2">
            {showInfosCard ? (
              <li>
                <button
                  type="button"
                  onClick={() => setInfoSheetOpen(true)}
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-3 text-left transition active:bg-secondary/60"
                >
                  <TodoBullet Icon={IconPencil} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium">Informations de base</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      Prénoms, type, dates, ville
                    </p>
                  </div>
                  <IconChevronRight size={16} className="text-muted-foreground" />
                </button>
              </li>
            ) : null}
            {todos.map((i) => (
              <li key={i.key}>
                <Link
                  to={i.to}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-3 transition active:bg-secondary/60"
                >
                  <TodoBullet Icon={i.Icon} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium">{i.label}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {i.description}
                    </p>
                  </div>
                  <IconChevronRight size={16} className="text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="flex flex-col items-center gap-2 py-2">
          <IconCircleCheck size={24} className="text-emerald-600" strokeWidth={1.75} />
          <p className="text-[13px] text-muted-foreground">
            Tout est prêt · Publiez votre mariage !
          </p>
        </section>
      )}

      {/* Bloc 5 — Publier et partager */}
      <section className="mt-2">
        {isPublished ? (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3">
            <IconCircleCheck size={22} className="shrink-0 text-emerald-700" strokeWidth={1.75} />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-emerald-800">
                Votre mariage est en ligne
              </p>
              {publicUrl ? (
                <p className="truncate text-[10px] text-emerald-700">{publicUrl}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={handleShare}
              className="flex shrink-0 items-center gap-1 rounded-full bg-background px-3 py-1.5 text-[11px] font-medium text-foreground shadow-sm transition active:scale-95"
            >
              <IconShare size={12} strokeWidth={1.75} />
              Partager
            </button>
          </div>
        ) : canPublish ? (
          <Link
            to="/publish"
            className="flex items-center gap-3 rounded-xl bg-foreground px-3.5 py-3 text-background transition active:scale-[0.99]"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-background/15">
              <IconArrowRight size={16} strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium">Publier et partager</p>
              <p className="truncate text-[11px] text-background/65">
                Activez le lien et le QR code
              </p>
            </div>
            <IconChevronRight size={16} className="text-background/70" />
          </Link>
        ) : (
          <div
            className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted/40 px-3.5 py-3 opacity-60"
            aria-disabled
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-card">
              <IconLock size={14} className="text-muted-foreground" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-muted-foreground">
                Publier et partager
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                Complétez les étapes ci-dessus
              </p>
            </div>
            <IconLock size={14} className="shrink-0 text-muted-foreground" strokeWidth={1.75} />
          </div>
        )}
      </section>

      <BasicInfoSheet open={infoSheetOpen} onOpenChange={setInfoSheetOpen} />
    </div>
  );
}

function TodoBullet({ Icon }: { Icon: typeof IconCalendarEvent }) {
  return (
    <span
      className={cn(
        "relative grid size-[22px] shrink-0 place-items-center rounded-full border border-border bg-background text-muted-foreground",
      )}
    >
      <Icon size={12} strokeWidth={1.75} />
    </span>
  );
}
