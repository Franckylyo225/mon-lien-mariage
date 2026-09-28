import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Calendar,
  Check,
  ChevronRight,
  CircleCheck,
  LayoutTemplate,
  Lock,
  Pencil,
  Share,
  Sparkles,
  Users,
} from "lucide-react";
import { openingModelMeta } from "@/components/public/opening/types";
import { useWedding, configProgress, isPastEvent } from "@/lib/wedding-store";
import { toast } from "sonner";
import { BasicInfoSheet } from "@/components/dashboard/BasicInfoSheet";
import { PublishReminderBanner } from "@/components/dashboard/PublishReminderBanner";
import { StatusPanel } from "@/components/dashboard/StatusPanel";
import { IconBadge, StatusPill } from "@/components/dashboard/premium";
import { BASE_PRICE_XOF, formatXof } from "@/lib/pricing";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Tableau de bord — MonInvit.com" }] }),
  component: DashboardHome,
});

type TodoItem = {
  key: string;
  label: string;
  description: string;
  Icon: typeof Calendar;
  to: "/dashboard/ceremonies" | "/dashboard/preview" | "/dashboard/guests";
};

function DashboardHome() {
  const { couple, ceremonies, weddingId, duplicateWedding } = useWedding();
  const navigate = useNavigate();
  const [infoSheetOpen, setInfoSheetOpen] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  const isPast = isPastEvent(couple.weddingDate);

  const handleDuplicate = async () => {
    if (!weddingId || duplicating) return;
    setDuplicating(true);
    const id = await duplicateWedding(weddingId);
    setDuplicating(false);
    if (id) {
      toast.success("Événement dupliqué. Choisissez une nouvelle date.");
      navigate({ to: "/dashboard" });
    } else {
      toast.error("Duplication impossible.");
    }
  };

  // ---- 5 configuration criteria
  const { flags, done, total } = configProgress({ couple, ceremonies });
  const {
    infos: infosDone,
    theme: themeDone,
    programme: programmeDone,
    page: pageDone,
    invites: invitesDone,
  } = flags;

  // Publishing only needs the names and the date: the rest can be completed after going live.
  const canPublish = infosDone;
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
      onEdit: () => navigate({ to: "/dashboard/preview", search: { sheet: "theme" } }),
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
      onEdit: () => navigate({ to: "/dashboard/preview", search: { sheet: "hero" } }),
    });
  }
  if (invitesDone) {
    doneItems.push({
      key: "invites",
      label: "Liste des invités activée",
      onEdit: () => navigate({ to: "/dashboard/guests" }),
    });
  }

  // ---- Remaining actionable items (only 3 tracked cards per spec)
  const allTodos: (TodoItem & { done: boolean })[] = [
    {
      key: "programme",
      label: "Le programme",
      description: "Dot, civil, réception…",
      Icon: Calendar,
      to: "/dashboard/ceremonies",
      done: programmeDone,
    },
    {
      key: "page",
      label: "Ma page d'invitation",
      description: "Photos, textes, mise en page",
      Icon: LayoutTemplate,
      to: "/dashboard/preview",
      done: pageDone,
    },
    {
      key: "invites",
      label: "Activez la liste des invités",
      description: "Permettez à vos invités de s'inscrire",
      Icon: Users,
      to: "/dashboard/guests",
      done: invitesDone,
    },
  ];
  const todos = allTodos.filter((i) => !i.done);

  // If infos incomplete, surface a card to open the sheet at the top of todos
  const showInfosCard = !infosDone;

  // The opening page always has a working default, so it is a discovery card rather than a
  // to-do: it disappears as soon as the couple has touched it in any way.
  const showOpeningDiscovery =
    couple.splashEnabled !== false &&
    (couple.openingPageModel ?? "classique") === "classique" &&
    !couple.splashKicker &&
    !couple.splashBgImageUrl;

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
    <div className="space-y-6 pt-2">
      <StatusPanel onEditDate={() => setInfoSheetOpen(true)} />

      {/* Bandeau événement passé */}
      {isPast ? (
        <section className="rounded-xl border border-amber-200 bg-amber-50/70 px-3.5 py-3">
          <p className="text-[12px] font-medium text-amber-900">
            Cet événement est passé — certaines actions ne sont plus disponibles.
          </p>
          {!isPublished ? (
            <>
              <p className="mt-1 text-[11px] leading-snug text-amber-800">
                Cette page n'a jamais été publiée et sa date est passée. Vous pouvez consulter vos
                données ou dupliquer l'événement pour une nouvelle date.
              </p>
              <button
                type="button"
                onClick={handleDuplicate}
                disabled={duplicating}
                className="mt-2 rounded-full bg-foreground px-3 py-1.5 text-[11px] font-medium text-background transition active:scale-95 disabled:opacity-60"
              >
                {duplicating ? "Duplication…" : "Dupliquer l'événement"}
              </button>
            </>
          ) : null}
        </section>
      ) : null}

      {/* Bannière de relance publication */}
      {!isPast && !isPublished && couple.weddingDate ? (
        <PublishReminderBanner
          weddingDate={couple.weddingDate}
          brideFirstName={couple.brideName || "Prénom A"}
          groomFirstName={couple.groomName || "Prénom B"}
        />
      ) : null}

      {/* Bloc 3 — À compléter */}
      {isPast ? null : todos.length > 0 || showInfosCard ? (
        <section>
          <h2 className="mb-3 text-[15px] font-semibold">À compléter</h2>
          <ul className="space-y-2.5">
            {showInfosCard ? (
              <li>
                <button
                  type="button"
                  onClick={() => setInfoSheetOpen(true)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3.5 text-left transition hover:bg-secondary/30 active:bg-secondary/50"
                >
                  <IconBadge>
                    <Pencil className="size-[18px]" strokeWidth={1.75} />
                  </IconBadge>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold">Informations de base</p>
                    <p className="truncate text-[12px] text-muted-foreground">
                      Prénoms, type, dates, ville
                    </p>
                  </div>
                  <StatusPill ready={false} />
                  <ChevronRight size={16} className="shrink-0 text-muted-foreground" />
                </button>
              </li>
            ) : null}
            {todos.map((i) => (
              <li key={i.key}>
                <Link
                  to={i.to}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 transition hover:bg-secondary/30 active:bg-secondary/50"
                >
                  <IconBadge>
                    <i.Icon className="size-[18px]" strokeWidth={1.75} />
                  </IconBadge>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold">{i.label}</p>
                    <p className="truncate text-[12px] text-muted-foreground">{i.description}</p>
                  </div>
                  <StatusPill ready={false} />
                  <ChevronRight size={16} className="shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-6 py-8 text-center">
          <IconBadge className="size-12">
            <CircleCheck className="size-6" strokeWidth={1.75} />
          </IconBadge>
          <p className="font-produit text-lg font-bold">Tout est prêt</p>
          <p className="text-[13px] text-muted-foreground">
            Publiez votre mariage pour l'ouvrir à vos invités.
          </p>
        </section>
      )}

      {/* Bloc 4 — Publier et partager */}
      <section>
        {isPublished ? (
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5">
            <IconBadge>
              <CircleCheck className="size-[18px]" strokeWidth={1.75} />
            </IconBadge>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold">Votre mariage est en ligne</p>
              {publicUrl ? (
                <p className="truncate text-[12px] text-muted-foreground">{publicUrl}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={handleShare}
              className="btn-accent-gradient flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] font-semibold"
            >
              <Share size={14} strokeWidth={1.75} />
              Partager
            </button>
          </div>
        ) : canPublish && !isPast ? (
          <Link
            to="/publish"
            className="btn-accent-gradient flex items-center gap-3 rounded-2xl p-4"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/20">
              <ArrowRight size={18} strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold">Publier et partager</p>
              <p className="text-[12px] leading-snug text-white/80">
                {done === total ? "Tout est prêt" : `${done}/${total} étapes prêtes`} · à partir de{" "}
                {formatXof(BASE_PRICE_XOF)} F CFA
              </p>
              <p className="text-[12px] leading-snug text-white/70">
                Lien à partager, QR code et RSVP illimités
              </p>
            </div>
            <ChevronRight size={16} className="shrink-0 text-white/75" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setInfoSheetOpen(true)}
            disabled={isPast}
            className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/40 p-3.5 text-left opacity-80"
          >
            <IconBadge className="bg-card text-muted-foreground">
              <Lock className="size-4" strokeWidth={1.75} />
            </IconBadge>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold text-muted-foreground">Publier et partager</p>
              <p className="text-[12px] text-muted-foreground">
                {isPast
                  ? "Cet événement est passé."
                  : "Renseignez d'abord les prénoms et la date pour publier."}
              </p>
            </div>
          </button>
        )}
      </section>

      {/* Bloc 4 bis — Découverte de la page d'ouverture (disparaît une fois personnalisée) */}
      {showOpeningDiscovery ? (
        <Link
          to="/dashboard/preview"
          search={{ sheet: "splash" }}
          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 transition hover:bg-secondary/30 active:bg-secondary/50"
        >
          <IconBadge>
            <Sparkles className="size-[18px]" strokeWidth={1.75} />
          </IconBadge>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold">Votre page d'ouverture</p>
            <p className="text-[12px] leading-snug text-muted-foreground">
              Le premier écran que voient vos invités. 7 modèles au choix — actuellement «{" "}
              {openingModelMeta(couple.openingPageModel).label} ».
            </p>
          </div>
          <ChevronRight size={16} className="shrink-0 text-muted-foreground" />
        </Link>
      ) : null}

      {/* Bloc 5 — Déjà fait */}
      {doneItems.length > 0 ? (
        <section>
          <h2 className="mb-3 text-[15px] font-semibold">Déjà fait</h2>
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {doneItems.map((i) => (
              <li key={i.key} className="flex items-center gap-3 px-3.5 py-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-champagne-light text-champagne-deep">
                  <Check size={13} strokeWidth={3} />
                </span>
                <p className="flex-1 truncate text-[13px]">{i.label}</p>
                <button
                  type="button"
                  onClick={i.onEdit}
                  className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[12px] text-muted-foreground transition hover:bg-secondary/50 hover:text-foreground"
                >
                  <span>Modifier</span>
                  <Pencil size={12} strokeWidth={1.75} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <BasicInfoSheet open={infoSheetOpen} onOpenChange={setInfoSheetOpen} />
    </div>
  );
}
