import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Pencil, Settings2 } from "lucide-react";
import whatsappIconAsset from "@/assets/phone.png.asset.json";
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
    <div className="space-y-4">
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
        <InvitationSettings
          enabled={!!couple.rsvpEnabled}
          everEnabled={!!couple.rsvpEverEnabled}
          quota={couple.rsvpQuota ?? null}
          behavior={couple.rsvpQuotaBehavior ?? "message"}
          confirmedCount={confirmedCount}
          template={couple.whatsappInviteTemplate ?? DEFAULT_WHATSAPP_INVITE_TEMPLATE}
          onSave={(patch) => void updateCouple(patch)}
        />
      )}

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
        {allGuests.length === 0 ? (
          <li className="flex flex-col items-center gap-4 p-8 text-center">
            <p className="text-sm text-muted-foreground">Vous n'avez pas encore d'invité</p>
            {isPast ? null : (
              <Button asChild>
                <Link to="/dashboard/guests/new">+ Ajouter votre premier invité</Link>
              </Button>
            )}
          </li>
        ) : filtered.length === 0 ? (
          <li className="p-8 text-center text-sm text-muted-foreground">
            Aucun invité ne correspond à votre recherche
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="bg-whatsapp hover:bg-whatsapp/90 border-0 shadow-sm"
                            asChild
                          >
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`Envoyer l'invitation WhatsApp à ${g.name}`}
                            >
                              <img
                                src={whatsappIconAsset.url}
                                alt="WhatsApp"
                                className="h-5 w-5 object-contain"
                              />
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
                              variant="ghost"
                              size="icon"
                              disabled
                              className="bg-whatsapp/60 border-0"
                              aria-label={unavailableReason}
                            >
                              <img
                                src={whatsappIconAsset.url}
                                alt="WhatsApp"
                                className="h-5 w-5 object-contain opacity-50"
                              />
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

function InvitationSettings({
  enabled,
  everEnabled,
  quota,
  behavior,
  confirmedCount,
  template,
  onSave,
}: {
  enabled: boolean;
  everEnabled: boolean;
  quota: number | null;
  behavior: "message" | "hide";
  confirmedCount: number;
  template: string;
  onSave: (patch: {
    rsvpEnabled?: boolean;
    rsvpEverEnabled?: boolean;
    rsvpQuota?: number | null;
    rsvpQuotaBehavior?: "message" | "hide";
    whatsappInviteTemplate?: string;
  }) => void;
}) {
  const mode: "unlimited" | "quota" = quota != null && quota > 0 ? "quota" : "unlimited";
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draftEnabled, setDraftEnabled] = useState(enabled);
  const [draftMode, setDraftMode] = useState<"unlimited" | "quota">(mode);
  const [draftQuota, setDraftQuota] = useState(quota != null && quota > 0 ? String(quota) : "");
  const [draftBehavior, setDraftBehavior] = useState<"message" | "hide">(behavior);
  const [draftTemplate, setDraftTemplate] = useState(template);

  const openSheet = () => {
    setDraftEnabled(enabled);
    setDraftMode(mode);
    setDraftQuota(quota != null && quota > 0 ? String(quota) : "");
    setDraftBehavior(behavior);
    setDraftTemplate(template);
    setSheetOpen(true);
  };
  const quotaValue = Math.max(1, Number(draftQuota) || 0);
  const canSubmit =
    (!draftEnabled || draftMode === "unlimited" || quotaValue > 0) &&
    draftTemplate.trim().length > 0 &&
    draftTemplate.length <= 1000;

  const submit = () => {
    onSave({
      rsvpEnabled: draftEnabled,
      rsvpEverEnabled: everEnabled || draftEnabled,
      rsvpQuota: draftMode === "quota" ? quotaValue : null,
      rsvpQuotaBehavior: draftBehavior,
      whatsappInviteTemplate: draftTemplate.trim(),
    });
    setSheetOpen(false);
  };
  const rsvpSummary = !enabled
    ? "RSVP désactivé"
    : mode === "quota"
      ? `RSVP actif · ${confirmedCount}/${quota} inscrits`
      : "RSVP actif · Sans limite";

  return (
    <section className="rounded-lg border border-border bg-card p-3.5">
      {everEnabled ? (
        <button type="button" onClick={openSheet} className="flex w-full items-center gap-3 text-left">
          <Settings2 className="size-5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-medium">Réglages de l'invitation</h2>
            <p className="truncate text-xs text-muted-foreground">
              {rsvpSummary} · Message WhatsApp personnalisé
            </p>
          </div>
          <Pencil className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">Modifier les réglages</span>
        </button>
      ) : (
        <div className="space-y-3">
          <div>
            <h2 className="font-medium">Réglages de l'invitation</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Activez les confirmations et préparez le message à envoyer à vos invités.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg bg-secondary/30 p-3">
              <p className="text-sm font-medium">Liste RSVP</p>
              <p className="mt-0.5 text-xs text-muted-foreground">À configurer · limite facultative</p>
            </div>
            <div className="rounded-lg bg-secondary/30 p-3">
              <p className="text-sm font-medium">Message WhatsApp</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Modèle personnalisable</p>
            </div>
          </div>
          <Button type="button" className="w-full" onClick={openSheet}>
            Configurer l'invitation
          </Button>
        </div>
      )}

      <BottomSheet open={sheetOpen} onOpenChange={setSheetOpen} title="Réglages de l'invitation" actionLabel="Fermer">
        <div className="space-y-6">
          <section className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-medium">Liste RSVP</h3>
                <p className="text-xs text-muted-foreground">Confirmer sa présence depuis la page d'invitation.</p>
              </div>
              <Button
                type="button"
                role="switch"
                aria-checked={draftEnabled}
                aria-label="Activer la liste d'invitation"
                variant={draftEnabled ? "default" : "secondary"}
                size="sm"
                onClick={() => setDraftEnabled((current) => !current)}
              >
                {draftEnabled ? "Activé" : "Désactivé"}
              </Button>
            </div>

            {draftEnabled ? (
              <>
                <div className="grid gap-2 sm:grid-cols-2">
                  <OptionButton active={draftMode === "unlimited"} title="Sans limite" desc="Tous les invités sont acceptés" onClick={() => setDraftMode("unlimited")} />
                  <OptionButton active={draftMode === "quota"} title="Avec quota" desc="Limiter le nombre maximum d'invités" onClick={() => setDraftMode("quota")} />
                </div>
                {draftMode === "quota" ? (
                  <div className="space-y-3 rounded-lg bg-secondary/30 p-3">
                    <label className="block text-xs font-medium">
                      Nombre maximum d'invités
                      <input type="number" min={1} inputMode="numeric" value={draftQuota} onChange={(event) => setDraftQuota(event.target.value)} placeholder="Ex. 300" className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-base" />
                    </label>
                    <p className="text-xs font-medium">Une fois le quota atteint :</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <OptionButton active={draftBehavior === "message"} title="Afficher un message" desc="Indiquer qu'il n'y a plus de place" onClick={() => setDraftBehavior("message")} />
                      <OptionButton active={draftBehavior === "hide"} title="Masquer le RSVP" desc="La section disparaît de la page publique" onClick={() => setDraftBehavior("hide")} />
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}
          </section>

          <section className="space-y-2 border-t border-border pt-5">
            <label htmlFor="whatsapp-template" className="font-medium">Message d'invitation WhatsApp</label>
            <textarea
              id="whatsapp-template"
              value={draftTemplate}
              onChange={(event) => setDraftTemplate(event.target.value)}
              maxLength={1000}
              rows={6}
              className="w-full resize-none rounded-lg border border-input bg-card px-3 py-3 text-base outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <p className="min-w-0">{"{prenom} · {noms_maries} · {date} · {lien_rsvp}"}</p>
              <span className="shrink-0">{draftTemplate.length}/1000</span>
            </div>
          </section>

          <Button type="button" disabled={!canSubmit} onClick={submit} className="w-full">
            Enregistrer les réglages
          </Button>
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
