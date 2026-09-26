import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CircleCheck, Download, MessageCircle, Plus, Upload, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useWedding, isPastEvent, confirmedHeadcount, type RSVPStatus } from "@/lib/wedding-store";
import { guestTypeMeta, guestTypeOrder, type GuestType } from "@/lib/guest-meta";
import { useAllGuests } from "@/hooks/use-all-guests";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { GuestAvatar, StatusBadge, globalRsvp } from "@/components/dashboard/guest-ui";
import { IconBadge, PageHeader, SettingRow, StatusPill } from "@/components/dashboard/premium";
import { GuestSheet } from "@/components/dashboard/GuestSheet";
import { GuestQuickAddSheet } from "@/components/dashboard/GuestQuickAddSheet";
import { GuestImportSheet } from "@/components/dashboard/GuestImportSheet";
import { DEFAULT_WHATSAPP_INVITE_TEMPLATE } from "@/lib/whatsapp-invite";

export const Route = createFileRoute("/dashboard/guests/")({
  validateSearch: (search: Record<string, unknown>): { add?: boolean } =>
    search.add === true || search.add === "1" || search.add === "true" ? { add: true } : {},
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
  const { ceremonies, couple, updateCouple, weddingId } = useWedding();
  const isPast = isPastEvent(couple.weddingDate);
  const { allGuests, publicRsvps, rsvpIdsByGuest, refetch, loading } = useAllGuests();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<GuestType | "all">("all");
  const [ceremonyFilter, setCeremonyFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<"add" | "import" | null>(null);
  const navigate = useNavigate();
  const { add } = Route.useSearch();

  // /dashboard/guests?add=1 (the floating button, old links) opens the quick-add sheet once.
  useEffect(() => {
    if (!add) return;
    if (!isPast) setSheet("add");
    void navigate({ to: "/dashboard/guests", search: {}, replace: true });
  }, [add, isPast, navigate]);



  const filtered = useMemo(() => {
    return allGuests.filter((g) => {
      if (query && !g.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (typeFilter !== "all" && g.guestType !== typeFilter) return false;
      if (ceremonyFilter !== "all" && !g.ceremonyIds.includes(ceremonyFilter)) return false;
      return true;
    });
  }, [allGuests, query, typeFilter, ceremonyFilter]);

  const selectedGuest = selectedId ? (allGuests.find((g) => g.id === selectedId) ?? null) : null;

  const totalCeremonies = new Set(allGuests.flatMap((g) => g.ceremonyIds)).size;

  const confirmedCount = useMemo(() => confirmedHeadcount(allGuests), [allGuests]);

  const [rsvpToDelete, setRsvpToDelete] = useState<{ id: string; name: string } | null>(null);

  const deleteRsvpsForGuest = async (guestId: string) => {
    const ids = rsvpIdsByGuest[guestId] ?? [];
    if (!weddingId || ids.length === 0) return;
    const { error } = await supabase
      .from("rsvps")
      .delete()
      .in("id", ids)
      .eq("wedding_id", weddingId);
    if (error) {
      toast.error("Suppression impossible pour le moment.");
      return;
    }
    toast.success("Confirmation supprimée.");
    refetch();
  };

  const deleteAllRsvps = async () => {
    if (!weddingId) return false;
    const { error } = await supabase.from("rsvps").delete().eq("wedding_id", weddingId);
    if (error) {
      toast.error("Suppression impossible pour le moment.");
      return false;
    }
    toast.success("Toutes les confirmations ont été supprimées.");
    refetch();
    return true;
  };

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
    <div className="space-y-6 pt-2">
      <PageHeader
        title="Mes invités"
        subtitle={`${allGuests.length} invité${allGuests.length > 1 ? "s" : ""} · ${totalCeremonies} étape${totalCeremonies > 1 ? "s" : ""} couverte${totalCeremonies > 1 ? "s" : ""}`}
        actions={
          <>
            <button
              type="button"
              onClick={() => void exportXlsx()}
              disabled={filtered.length === 0}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm font-medium transition hover:bg-secondary/40 disabled:cursor-not-allowed disabled:opacity-50"
              title="Télécharger la liste au format Excel"
            >
              <Download className="size-4" />
              Excel
            </button>
            {isPast ? null : (
              <>
                <button
                  type="button"
                  onClick={() => setSheet("import")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm font-medium transition hover:bg-secondary/40"
                  title="Importer une liste d'invités"
                >
                  <Upload className="size-4" />
                  Importer
                </button>
                <button
                  type="button"
                  onClick={() => setSheet("add")}
                  className="btn-accent-gradient inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold"
                >
                  <Plus className="size-4" />
                  Ajouter
                </button>
              </>
            )}
          </>
        }
      />

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
          templateSaved={!!couple.whatsappInviteTemplate?.trim()}
          onSave={(patch) => void updateCouple(patch)}
        />
      )}

      <div className="space-y-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un invité…"
          className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
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
      </div>

      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {loading && allGuests.length === 0 ? (
          Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3 p-4">
              <Skeleton className="size-11 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3.5 w-2/5" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </li>
          ))
        ) : allGuests.length === 0 ? (
          <li className="flex flex-col items-center gap-4 px-6 py-12 text-center">
            <IconBadge className="size-14">
              <Users className="size-6" strokeWidth={1.75} />
            </IconBadge>
            <div>
              <p className="font-produit text-lg font-bold">Vous n'avez pas encore d'invité</p>
              <p className="mx-auto mt-1 max-w-xs text-[13px] text-muted-foreground">
                Ajoutez vos premiers invités un par un, ou importez toute votre liste d'un coup.
              </p>
            </div>
            {isPast ? null : (
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setSheet("add")}
                  className="btn-accent-gradient inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold"
                >
                  <Plus className="size-4" />
                  Ajouter votre premier invité
                </button>
                <button
                  type="button"
                  onClick={() => setSheet("import")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition hover:bg-secondary/40"
                >
                  <Upload className="size-4" />
                  Importer une liste
                </button>
              </div>
            )}
          </li>
        ) : filtered.length === 0 ? (
          <li className="p-8 text-center text-sm text-muted-foreground">
            Aucun invité ne correspond à votre recherche
          </li>
        ) : (
          filtered.map((g) => {
            const global = globalRsvp(g.rsvps.map((r) => r.status));
            return (
              <li key={g.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(g.id)}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-secondary/30 active:bg-secondary/50"
                >
                  <GuestAvatar name={g.name} guestType={g.guestType} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{g.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {g.phone || "Pas de numéro"}
                    </span>
                  </span>
                  <StatusBadge status={global} />
                </button>
              </li>
            );
          })
        )}
      </ul>

      <ResetRsvpSection
        rsvpCount={publicRsvps.length}
        onExport={() => void exportXlsx()}
        onConfirm={deleteAllRsvps}
      />

      {selectedGuest ? (
        <GuestSheet
          key={selectedGuest.id}
          guest={selectedGuest}
          fromPublicRsvp={selectedGuest.id.startsWith("rsvp-")}
          readOnly={isPast}
          onClose={() => setSelectedId(null)}
          onDeleteRsvps={() => {
            setSelectedId(null);
            setRsvpToDelete({ id: selectedGuest.id, name: selectedGuest.name });
          }}
        />
      ) : null}
      {sheet === "add" ? (
        <GuestQuickAddSheet
          existing={allGuests}
          onClose={() => setSheet(null)}
          onImport={() => setSheet("import")}
        />
      ) : null}
      {sheet === "import" ? (
        <GuestImportSheet existing={allGuests} onClose={() => setSheet(null)} />
      ) : null}

      <ConfirmDialog
        open={rsvpToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setRsvpToDelete(null);
        }}
        title={`Supprimer la confirmation de ${rsvpToDelete?.name ?? ""} ?`}
        description="Cette action est définitive."
        confirmLabel="Supprimer"
        destructive
        onConfirm={() => {
          if (rsvpToDelete) void deleteRsvpsForGuest(rsvpToDelete.id);
        }}
      />
    </div>
  );
}

function ResetRsvpSection({
  rsvpCount,
  onExport,
  onConfirm,
}: {
  rsvpCount: number;
  onExport: () => void;
  onConfirm: () => Promise<boolean>;
}) {
  const [step, setStep] = useState<"idle" | "confirming">("idle");
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);

  if (rsvpCount === 0) return null;

  return (
    <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
      <p className="text-sm font-semibold text-destructive">Zone sensible</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Supprime définitivement toutes les confirmations reçues sur cette invitation.
        Utile pour repartir de zéro après avoir testé le formulaire.
      </p>

      {step === "idle" ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onExport}>
            <Download className="size-4" />
            Télécharger la liste avant de supprimer
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => {
              setConfirmText("");
              setStep("confirming");
            }}
          >
            Vider toutes les confirmations
          </Button>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          <label htmlFor="reset-rsvp-confirm" className="block text-xs">
            Tapez <strong>SUPPRIMER</strong> pour confirmer ({rsvpCount} confirmation
            {rsvpCount > 1 ? "s" : ""} seront perdues) :
          </label>
          <input
            id="reset-rsvp-confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-base outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={confirmText !== "SUPPRIMER" || busy}
              onClick={async () => {
                setBusy(true);
                const ok = await onConfirm();
                setBusy(false);
                if (ok) {
                  setConfirmText("");
                  setStep("idle");
                }
              }}
            >
              Confirmer la suppression
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setStep("idle")}
            >
              Annuler
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

function InvitationSettings({
  enabled,
  everEnabled,
  quota,
  behavior,
  confirmedCount,
  template,
  templateSaved,
  onSave,
}: {
  enabled: boolean;
  everEnabled: boolean;
  quota: number | null;
  behavior: "message" | "hide";
  confirmedCount: number;
  template: string;
  templateSaved: boolean;
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
  const rsvpDescription = enabled
    ? mode === "quota"
      ? `Actif · ${confirmedCount}/${quota} inscrits`
      : "Actif · sans limite"
    : everEnabled
      ? "Désactivé pour le moment"
      : "À configurer · limite facultative";
  const allReady = enabled && templateSaved;

  return (
    <section className="space-y-3.5">
      <div>
        <h2 className="text-[15px] font-semibold">Réglages de l'invitation</h2>
        <p className="mt-0.5 text-[12px] text-muted-foreground">
          Activez les confirmations et préparez le message à envoyer à vos invités.
        </p>
      </div>
      <div className="space-y-2.5">
        <SettingRow
          icon={<CircleCheck className="size-5" />}
          title="Liste RSVP"
          description={rsvpDescription}
          trailing={<StatusPill ready={enabled} />}
        />
        <SettingRow
          icon={<MessageCircle className="size-5" />}
          title="Message WhatsApp"
          description={templateSaved ? "Message personnalisé" : "Modèle par défaut · personnalisable"}
          trailing={<StatusPill ready={templateSaved} />}
        />
      </div>
      <button
        type="button"
        onClick={openSheet}
        className={
          allReady
            ? "w-full rounded-xl border border-border bg-card py-3 text-sm font-semibold transition hover:bg-secondary/40"
            : "btn-accent-gradient w-full rounded-xl py-3 text-sm font-semibold"
        }
      >
        {allReady ? "Modifier les réglages" : "Configurer l'invitation"}
      </button>

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

