import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrowLeft, BookHeart, Download, Heart, Loader2, Trash2 } from "lucide-react";
import { useWedding } from "@/lib/wedding-store";
import { ceremonyMeta } from "@/lib/ceremony-meta";
import {
  listOwnGuestbook,
  deleteGuestbookMessage,
  setGuestbookFavorite,
} from "@/lib/guestbook.functions";
import { initializePaystackPayment } from "@/lib/paystack.functions";
import { redirectToCheckout } from "@/lib/checkout-redirect";
import { GUESTBOOK_ADDON_XOF } from "@/lib/pricing";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { IconBadge, PageHeader } from "@/components/dashboard/premium";
import { initialsOf } from "@/components/dashboard/guest-ui";


export const Route = createFileRoute("/app/guestbook")({
  head: () => ({
    meta: [{ title: "Livre d'or — MonInvit.com" }, { name: "robots", content: "noindex" }],
  }),
  component: OwnerGuestbookPage,
});

interface Message {
  id: string;
  author_name: string;
  author_relation?: string | null;
  is_favorite?: boolean;
  message: string;
  created_at: string;
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

const relativeFormat = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });

/** "il y a 2 jours", "hier", "à l'instant"… */
function relativeTime(iso: string) {
  const diffSec = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
  if (Number.isNaN(diffSec)) return "";
  const abs = Math.abs(diffSec);
  if (abs < 60) return "à l'instant";
  if (abs < 3600) return relativeFormat.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return relativeFormat.format(Math.round(diffSec / 3600), "hour");
  if (abs < 86400 * 30) return relativeFormat.format(Math.round(diffSec / 86400), "day");
  if (abs < 86400 * 365) return relativeFormat.format(Math.round(diffSec / (86400 * 30)), "month");
  return relativeFormat.format(Math.round(diffSec / (86400 * 365)), "year");
}

// Stable per guest: the same name always maps to the same color (palette reused from the ceremony colors).
const AVATAR_COLORS = Object.values(ceremonyMeta).map((m) => m.color);

function avatarBackground(name: string) {
  let hash = 0;
  for (const ch of name.trim().toLowerCase()) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const color = AVATAR_COLORS[hash % AVATAR_COLORS.length];
  return `linear-gradient(135deg, ${color}, color-mix(in oklab, ${color} 68%, black))`;
}

function OwnerGuestbookPage() {
  const { weddingId, couple, loading } = useWedding();
  const listFn = useServerFn(listOwnGuestbook);
  const delFn = useServerFn(deleteGuestbookMessage);
  const favFn = useServerFn(setGuestbookFavorite);
  const payFn = useServerFn(initializePaystackPayment);
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(true);
  const [paying, setPaying] = useState(false);
  const [toDelete, setToDelete] = useState<Message | null>(null);
  const [favoritesEnabled, setFavoritesEnabled] = useState(true);

  const handleGuestbookPayment = async () => {
    if (!weddingId) return;
    setPaying(true);
    try {
      const { authorization_url } = await payFn({
        data: {
          weddingId,
          paymentType: "addon_guestbook",
          amountFcfa: GUESTBOOK_ADDON_XOF,
          callbackUrl: `${window.location.origin}/payment/callback`,
        },
      });
      if (!authorization_url) throw new Error("Passerelle indisponible.");
      redirectToCheckout(authorization_url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur de paiement. Réessayez.");
      setPaying(false);
    }
  };

  useEffect(() => {
    if (!weddingId) return;
    setBusy(true);
    listFn({ data: { weddingId } })
      .then((r) => {
        setMessages(r.messages as Message[]);
        setFavoritesEnabled(r.favoritesEnabled);
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setBusy(false));
  }, [weddingId, listFn]);

  const toggleFavorite = async (m: Message) => {
    const next = !m.is_favorite;
    const apply = (value: boolean) =>
      setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, is_favorite: value } : x)));
    apply(next);
    try {
      await favFn({ data: { id: m.id, isFavorite: next } });
    } catch (e) {
      apply(!next);
      toast.error(e instanceof Error ? e.message : "Impossible d'enregistrer ce cœur.");
    }
  };

  const onDelete = async (id: string) => {
    try {
      await delFn({ data: { id } });
      setMessages((prev) => prev.filter((m) => m.id !== id));
      toast.success("Message supprimé.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Suppression impossible.");
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="size-5 animate-spin opacity-50" />
      </div>
    );
  }

  const hasGuestbook = couple.hasGuestbook === true;
  const count = messages.length;
  const favorites = messages.filter((m) => m.is_favorite).length;
  const kicker =
    hasGuestbook && !busy ? `${count} message${count > 1 ? "s" : ""}` : "Espace organisateurs";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Tableau de bord
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <PageHeader
          kicker={kicker}
          title="Livre d'or"
          subtitle={
            favoritesEnabled && favorites > 0
              ? `Les mots que vos invités ont laissés pour vous · ${favorites} aimé${favorites > 1 ? "s" : ""}`
              : "Les mots que vos invités ont laissés pour vous."
          }
          actions={
            hasGuestbook && weddingId ? (
              <Link
                to="/guestbook/print/$id"
                params={{ id: weddingId }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm font-medium transition hover:bg-secondary/40"
                title="Exporter le livre d'or en PDF souvenir"
              >
                <Download className="size-4" />
                PDF souvenir
              </Link>
            ) : null
          }
        />

        {!hasGuestbook ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-12 text-center">
            <IconBadge className="size-14">
              <BookHeart className="size-6" strokeWidth={1.75} />
            </IconBadge>
            <div>
              <p className="font-produit text-lg font-bold">Le livre d'or n'est pas activé</p>
              <p className="mx-auto mt-1 max-w-xs text-[13px] text-muted-foreground">
                {couple.isPublished
                  ? `Activez-le dès maintenant pour ${GUESTBOOK_ADDON_XOF.toLocaleString("fr-FR")} F CFA.`
                  : "Publiez votre page pour pouvoir activer le livre d'or."}
              </p>
            </div>
            {couple.isPublished ? (
              <button
                type="button"
                onClick={handleGuestbookPayment}
                disabled={paying || !weddingId}
                className="btn-accent-gradient inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
              >
                {paying ? <Loader2 className="size-4 animate-spin" /> : null}
                {paying
                  ? "Redirection…"
                  : `Activer pour ${GUESTBOOK_ADDON_XOF.toLocaleString("fr-FR")} F CFA`}
              </button>
            ) : (
              <Link
                to="/publish"
                className="btn-accent-gradient inline-flex items-center rounded-xl px-5 py-2.5 text-sm font-semibold"
              >
                Activer le livre d'or
              </Link>
            )}
          </div>
        ) : busy ? (
          <ul className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-11 shrink-0 rounded-full" />
                  <Skeleton className="h-3.5 w-32" />
                </div>
                <Skeleton className="mt-4 h-3 w-full" />
                <Skeleton className="mt-2 h-3 w-4/5" />
              </li>
            ))}
          </ul>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-14 text-center">
            <IconBadge className="size-14">
              <BookHeart className="size-6" strokeWidth={1.75} />
            </IconBadge>
            <div>
              <p className="font-produit text-lg font-bold">Aucun message pour l'instant</p>
              <p className="mx-auto mt-1 max-w-xs text-[13px] text-muted-foreground">
                Les messages laissés par vos invités apparaîtront ici.
              </p>
            </div>
          </div>
        ) : (
          <ul className="space-y-3">
            {messages.map((m) => (
              <li key={m.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="grid size-11 shrink-0 place-items-center rounded-full text-[14px] font-semibold text-white"
                    style={{ backgroundImage: avatarBackground(m.author_name) }}
                  >
                    {initialsOf(m.author_name) || "?"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-bold">{m.author_name}</p>
                    <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                      {m.author_relation?.trim() ? (
                        <>
                          <span className="font-medium text-champagne-deep">
                            {m.author_relation.trim()}
                          </span>
                          {" · "}
                        </>
                      ) : null}
                      <time dateTime={m.created_at} title={formatDate(m.created_at)}>
                        {relativeTime(m.created_at)}
                      </time>
                    </p>
                  </div>
                  <div className="-mr-1 -mt-1 flex shrink-0 items-center">
                    {favoritesEnabled ? (
                      <button
                        type="button"
                        onClick={() => void toggleFavorite(m)}
                        aria-pressed={!!m.is_favorite}
                        aria-label={
                          m.is_favorite ? "Retirer des messages aimés" : "Aimer ce message"
                        }
                        className={
                          "grid size-9 place-items-center rounded-full transition active:scale-90 " +
                          (m.is_favorite
                            ? "bg-secondary text-primary"
                            : "text-muted-foreground hover:bg-secondary/50 hover:text-primary")
                        }
                      >
                        <Heart className={"size-4 " + (m.is_favorite ? "fill-current" : "")} />
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setToDelete(m)}
                      className="grid size-9 place-items-center rounded-full text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Supprimer le message de ${m.author_name}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed">{m.message}</p>
              </li>
            ))}
          </ul>
        )}
      </main>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => {
          if (!open) setToDelete(null);
        }}
        title={`Supprimer le message de ${toDelete?.author_name ?? ""} ?`}
        description="Cette action est définitive."
        confirmLabel="Supprimer"
        destructive
        onConfirm={() => {
          if (toDelete) void onDelete(toDelete.id);
        }}
      />
    </div>
  );
}
