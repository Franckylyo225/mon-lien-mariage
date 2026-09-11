import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, MessageCircle, Settings2 } from "lucide-react";
import { useWedding, isPastEvent, type RSVPStatus } from "@/lib/wedding-store";
import { guestTypeMeta, guestTypeOrder, type GuestType } from "@/lib/guest-meta";
import { useAllGuests } from "@/hooks/use-all-guests";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DEFAULT_WHATSAPP_INVITE_TEMPLATE,
  createWhatsAppInviteUrl,
  firstName,
  formatEventDate,
  renderWhatsAppInvite,
} from "@/lib/whatsapp-invite";

export const Route = createFileRoute("/dashboard/guests/")({
  head: () => ({
    meta: [
      { title: "Mes invités — MonInvit.com" },
      { name: "description", content: "Gérez vos invités et envoyez leurs invitations personnalisées par WhatsApp." },
      { property: "og:title", content: "Mes invités — MonInvit.com" },
      { property: "og:description", content: "Gérez vos invités et leurs confirmations de présence." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GuestsPage,
});

function GuestsPage() {
  const { ceremonies, couple, updateCouple } = useWedding();
  const isPast = isPastEvent(couple.weddingDate);
  const { allGuests } = useAllGuests();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<GuestType | "all">("all");
  const [ceremonyFilter, setCeremonyFilter] = useState<string>("all");



  const filtered = useMemo(() => {
    return allGuests.filter((g) => {
      if (query && !g.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (typeFilter !== "all" && g.guestType !== typeFilter) return false;
      if (ceremonyFilter !== "all" && !g.ceremonyIds.includes(ceremonyFilter)) return false;
      return true;
    });
  }, [allGuests, query, typeFilter, ceremonyFilter]);

  const totalCeremonies = new Set(allGuests.flatMap((g) => g.ceremonyIds)).size;

  const confirmedCount = useMemo(
    () =>
      allGuests.reduce((sum, g) => {
        const confirmed = g.rsvps.filter((r) => r.status === "confirmé");
        if (confirmed.length === 0) return sum;
        const plus = confirmed.reduce((n, r) => Math.max(n, r.plusOnes ?? 0), 0);
        return sum + 1 + plus;
      }, 0),
    [allGuests],
  );

  const exportXlsx = async () => {
    const XLSX = await import("xlsx");
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
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => void exportXlsx()}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-medium hover:bg-secondary/40 disabled:cursor-not-allowed disabled:opacity-50"
            title="Télécharger la liste au format Excel"
          >
            <Download className="size-4" />
            <span className="hidden sm:inline">Excel</span>
          </button>
          {isPast ? null : (
            <Link
              to="/dashboard/guests/new"
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              + Ajouter
            </Link>
          )}
        </div>
      </header>

      {isPast ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50/70 px-3.5 py-2.5 text-[12px] text-amber-900">
          Cet événement est passé — les inscriptions et les rappels ne sont plus
          disponibles. Vous pouvez toujours consulter et exporter votre liste.
        </p>
      ) : (
        <RsvpActivationCard
          enabled={!!couple.rsvpEnabled}
          quota={couple.rsvpQuota ?? null}
          behavior={couple.rsvpQuotaBehavior ?? "message"}
          confirmedCount={confirmedCount}
          onChange={(patch) => void updateCouple(patch)}
        />
      )}

      {!isPast ? (
        <WhatsAppMessageCard
          template={couple.whatsappInviteTemplate ?? DEFAULT_WHATSAPP_INVITE_TEMPLATE}
          onSave={(template) => void updateCouple({ whatsappInviteTemplate: template })}
        />
      ) : null}

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
            const publicUrl = couple.slug ? `https://moninvit.com/e/${couple.slug}` : "";
            const message = renderWhatsAppInvite(
              couple.whatsappInviteTemplate ?? DEFAULT_WHATSAPP_INVITE_TEMPLATE,
              {
                prenom: firstName(g.name),
                noms_maries: `${couple.brideName} & ${couple.groomName}`,
                date: formatEventDate(couple.weddingDate),
                lien_rsvp: publicUrl,
              },
            );
            const whatsappUrl = publicUrl ? createWhatsAppInviteUrl(g.phone, message) : null;
            const unavailableReason = !g.phone
              ? "Ajoutez un numéro pour activer l’envoi WhatsApp"
              : !publicUrl
                ? "Publiez votre page pour activer l’envoi WhatsApp"
                : "Vérifiez le numéro pour activer l’envoi WhatsApp";
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
                  <TooltipProvider delayDuration={200}>
                    {whatsappUrl ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" asChild>
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`Envoyer l'invitation WhatsApp à ${g.name}`}
                            >
                              <MessageCircle />
                            </a>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Envoyer par WhatsApp</TooltipContent>
                      </Tooltip>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex" tabIndex={0}>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              disabled
                              aria-label={unavailableReason}
                            >
                              <MessageCircle />
                            </Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>{unavailableReason}</TooltipContent>
                      </Tooltip>
                    )}
                  </TooltipProvider>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}

function WhatsAppMessageCard({
  template,
  onSave,
}: {
  template: string;
  onSave: (template: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(template);
  const isValid = draft.trim().length > 0 && draft.length <= 1000;

  const edit = () => {
    setDraft(template);
    setOpen(true);
  };

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-medium">Message d'invitation WhatsApp</h2>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{template}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={edit}>
          <Settings2 />
          Modifier
        </Button>
      </div>

      <BottomSheet open={open} onOpenChange={setOpen} title="Personnaliser le message WhatsApp" actionLabel="Fermer">
        <div className="space-y-4">
          <div>
            <label htmlFor="whatsapp-template" className="text-sm font-medium">
              Message par défaut
            </label>
            <textarea
              id="whatsapp-template"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              maxLength={1000}
              rows={7}
              className="mt-2 w-full resize-none rounded-lg border border-input bg-card px-3 py-3 text-base outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <p>{"{prenom} · {noms_maries} · {date} · {lien_rsvp}"}</p>
              <span>{draft.length}/1000</span>
            </div>
          </div>
          <Button
            type="button"
            className="w-full"
            disabled={!isValid}
            onClick={() => {
              onSave(draft.trim());
              setOpen(false);
            }}
          >
            Enregistrer le message
          </Button>
        </div>
      </BottomSheet>
    </section>
  );
}

function RsvpActivationCard({
  enabled,
  quota,
  behavior,
  confirmedCount,
  onChange,
}: {
  enabled: boolean;
  quota: number | null;
  behavior: "message" | "hide";
  confirmedCount: number;
  onChange: (patch: {
    rsvpEnabled?: boolean;
    rsvpQuota?: number | null;
    rsvpQuotaBehavior?: "message" | "hide";
  }) => void;
}) {
  const mode: "unlimited" | "quota" = quota != null && quota > 0 ? "quota" : "unlimited";

  const [sheetOpen, setSheetOpen] = useState(false);
  const [activating, setActivating] = useState(false);
  const [draftMode, setDraftMode] = useState<"unlimited" | "quota">(mode);
  const [draftQuota, setDraftQuota] = useState(quota != null && quota > 0 ? String(quota) : "");
  const [draftBehavior, setDraftBehavior] = useState<"message" | "hide">(behavior);

  const openSheet = (isActivating: boolean) => {
    setDraftMode(mode);
    setDraftQuota(quota != null && quota > 0 ? String(quota) : "");
    setDraftBehavior(behavior);
    setActivating(isActivating);
    setSheetOpen(true);
  };

  const handleToggle = () => {
    if (enabled) {
      // Désactivation : on conserve la configuration en base.
      onChange({ rsvpEnabled: false });
      return;
    }
    openSheet(true);
  };

  const quotaValue = Math.max(1, Number(draftQuota) || 0);
  const canSubmit = draftMode === "unlimited" || quotaValue > 0;

  const submit = () => {
    onChange({
      rsvpEnabled: true,
      rsvpQuota: draftMode === "quota" ? quotaValue : null,
      rsvpQuotaBehavior: draftBehavior,
    });
    setActivating(false);
    setSheetOpen(false);
  };

  const handleSheetOpenChange = (open: boolean) => {
    if (!open) {
      // Fermeture sans validation : pas d'activation « à moitié ».
      if (activating) onChange({ rsvpEnabled: false });
      setActivating(false);
    }
    setSheetOpen(open);
  };

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-medium">Activer la liste d'invitation</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Affiche le bouton « Confirmer ma présence » sur votre page d'invitation.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Activer la liste d'invitation"
          onClick={handleToggle}
          className={
            "relative mt-0.5 h-7 w-12 shrink-0 rounded-full transition " +
            (enabled ? "bg-primary" : "bg-muted")
          }
        >
          <span
            className={
              "absolute top-1 size-5 rounded-full bg-white shadow transition-all " +
              (enabled ? "left-6" : "left-1")
            }
          />
        </button>
      </div>

      {enabled ? (
        <div className="mt-4 space-y-2 border-t border-border pt-3">
          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 text-sm">
              {mode === "quota"
                ? `Avec quota · ${quota} max · ${
                    behavior === "hide" ? "RSVP masqué au quota atteint" : "Message au quota atteint"
                  }`
                : "Sans limite · Tous les invités acceptés"}
            </p>
            <button
              type="button"
              onClick={() => openSheet(false)}
              className="shrink-0 text-sm font-medium text-primary underline underline-offset-4"
            >
              Modifier
            </button>
          </div>
          {mode === "quota" ? (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{confirmedCount}</span> / {quota}{" "}
              inscrits
            </p>
          ) : null}
        </div>
      ) : null}

      <BottomSheet
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
        title="Configurer la liste d'invitation"
        actionLabel="Fermer"
      >
        <div className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <OptionButton
              active={draftMode === "unlimited"}
              title="Sans limite"
              desc="Tous les invités qui s'inscrivent sont acceptés"
              onClick={() => setDraftMode("unlimited")}
            />
            <OptionButton
              active={draftMode === "quota"}
              title="Avec quota"
              desc="Limiter le nombre maximum d'invités"
              onClick={() => setDraftMode("quota")}
            />
          </div>

          {draftMode === "quota" ? (
            <div className="space-y-3 rounded-lg bg-secondary/30 p-3">
              <label className="block text-xs font-medium">
                Nombre maximum d'invités
                <input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={draftQuota}
                  onChange={(e) => setDraftQuota(e.target.value)}
                  placeholder="Ex. 300"
                  className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-base"
                />
              </label>

              <p className="text-xs font-medium">Une fois le quota atteint :</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <OptionButton
                  active={draftBehavior === "message"}
                  title="Afficher un message"
                  desc="« Il n'y a plus de place disponible »"
                  onClick={() => setDraftBehavior("message")}
                />
                <OptionButton
                  active={draftBehavior === "hide"}
                  title="Masquer le RSVP"
                  desc="La section disparaît de la page publique"
                  onClick={() => setDraftBehavior("hide")}
                />
              </div>
            </div>
          ) : null}

          <button
            type="button"
            disabled={!canSubmit}
            onClick={submit}
            className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Valider
          </button>
        </div>
      </BottomSheet>
    </section>
  );
}

function OptionButton({
  active,
  title,
  desc,
  onClick,
}: {
  active: boolean;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-lg border p-3 text-left transition " +
        (active ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-secondary/40")
      }
    >
      <span className="flex items-center gap-2 text-sm font-medium">
        <span
          className={
            "grid size-4 shrink-0 place-items-center rounded-full border " +
            (active ? "border-primary" : "border-muted-foreground/40")
          }
        >
          {active ? <span className="size-2 rounded-full bg-primary" /> : null}
        </span>
        {title}
      </span>
      <span className="mt-1 block text-xs text-muted-foreground">{desc}</span>
    </button>
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
