import { useRef, useState, type ReactNode } from "react";
import { Drawer } from "vaul";
import { Mail, Minus, Pencil, Phone, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useWedding, type Guest, type RSVP, type RSVPStatus } from "@/lib/wedding-store";
import { guestTypeMeta, guestTypeOrder, type GuestType } from "@/lib/guest-meta";
import {
  DEFAULT_WHATSAPP_INVITE_TEMPLATE,
  buildGuestInviteUrl,
  createWhatsAppInviteUrl,
  firstName,
  formatEventDate,
  renderWhatsAppInvite,
} from "@/lib/whatsapp-invite";
import { useVisualViewport } from "@/hooks/use-visual-viewport";
import { PhoneField, isValidPhoneNumber } from "@/components/ui/PhoneField";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  GuestAvatar,
  StatusBadge,
  globalRsvp,
  isSelfSignup,
  sourceLabel,
  statusLabel,
} from "@/components/dashboard/guest-ui";
import whatsappIconUrl from "@/assets/whatsapp-phone.png";
import { cn } from "@/lib/utils";

const STATUS_CHOICES: RSVPStatus[] = ["confirmé", "en_attente", "décliné"];

interface Props {
  guest: Guest;
  /** Built from a public RSVP rather than a row of the guests table: read-only, only its confirmation can be deleted. */
  fromPublicRsvp: boolean;
  /** The event is over: consult only. */
  readOnly: boolean;
  onClose: () => void;
  onDeleteRsvps: () => void;
}

export function GuestSheet({ guest, fromPublicRsvp, readOnly, onClose, onDeleteRsvps }: Props) {
  const { ceremonies, couple, updateGuest, removeGuest } = useWedding();
  const vv = useVisualViewport();
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const editDirty = useRef(false);

  const global = globalRsvp(guest.rsvps.map((r) => r.status));
  const meta = guestTypeMeta[guest.guestType] ?? guestTypeMeta.autre;
  const canManage = !fromPublicRsvp && !readOnly;

  const guestCeremonies = guest.ceremonyIds.flatMap((cid) => {
    const c = ceremonies.find((x) => x.id === cid);
    return c ? [{ ceremony: c, rsvp: guest.rsvps.find((r) => r.ceremonyId === cid) }] : [];
  });

  // WhatsApp invitation, same message as before but sent from the guest's sheet.
  const publicUrl = couple.slug ? buildGuestInviteUrl(couple.slug, guest.inviteToken) : "";
  const message = renderWhatsAppInvite(
    couple.whatsappInviteTemplate ?? DEFAULT_WHATSAPP_INVITE_TEMPLATE,
    {
      prenom: firstName(guest.name),
      noms_maries: `${couple.brideName} & ${couple.groomName}`,
      date: formatEventDate(couple.weddingDate),
      lien_rsvp: publicUrl,
    },
  );
  const whatsappUrl = publicUrl ? createWhatsAppInviteUrl(guest.phone, message) : null;
  const showWhatsapp = canManage && !isSelfSignup(guest.source) && global === "en_attente";
  const whatsappBlockedReason = !guest.phone
    ? "Ajoutez un numéro (Modifier) pour envoyer l'invitation."
    : !publicUrl
      ? "Publiez votre page pour envoyer l'invitation."
      : "Vérifiez le numéro (Modifier) pour envoyer l'invitation.";

  const setStatus = (status: RSVPStatus) => {
    const rsvps: RSVP[] = guest.ceremonyIds.map((cid) => ({
      ceremonyId: cid,
      status,
      plusOnes:
        status === "confirmé" ? (guest.rsvps.find((r) => r.ceremonyId === cid)?.plusOnes ?? 0) : 0,
    }));
    void updateGuest(guest.id, { rsvps });
    toast.success(`${firstName(guest.name)} : ${statusLabel[status].toLowerCase()}.`);
  };

  const plusOnes = guest.rsvps.reduce((n, r) => Math.max(n, r.plusOnes ?? 0), 0);
  const setPlusOnes = (n: number) => {
    void updateGuest(guest.id, {
      rsvps: guest.rsvps.map((r) => (r.status === "confirmé" ? { ...r, plusOnes: n } : r)),
    });
  };

  const handleOpenChange = (open: boolean) => {
    if (open) return;
    if (mode === "edit" && editDirty.current) setConfirmDiscard(true);
    else onClose();
  };

  return (
    <>
      <ConfirmDialog
        open={confirmDiscard}
        onOpenChange={setConfirmDiscard}
        title="Abandonner les modifications ?"
        description="Les changements non enregistrés seront perdus."
        confirmLabel="Abandonner"
        cancelLabel="Continuer l'édition"
        destructive
        onConfirm={onClose}
      />
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Supprimer ${guest.name} ?`}
        description="L'invité et ses réponses seront supprimés. Cette action est définitive."
        confirmLabel="Supprimer"
        destructive
        onConfirm={() => {
          void removeGuest(guest.id);
          toast.success("Invité supprimé.");
          onClose();
        }}
      />
      <Drawer.Root open onOpenChange={handleOpenChange} repositionInputs={false}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <Drawer.Content
            style={
              vv
                ? { bottom: vv.keyboardHeight, maxHeight: Math.max(vv.visibleHeight - 12, 240) }
                : undefined
            }
            className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[90vh] w-full max-w-xl flex-col rounded-t-3xl border border-b-0 border-border bg-background outline-none"
          >
            <Drawer.Title className="sr-only">{guest.name}</Drawer.Title>
            <div className="flex items-center justify-center pt-3">
              <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
            </div>

            {mode === "edit" ? (
              <EditForm
                guest={guest}
                dirtyRef={editDirty}
                onCancel={() => {
                  if (editDirty.current) setConfirmDiscard(true);
                  else setMode("view");
                }}
                onSaved={() => {
                  editDirty.current = false;
                  setMode("view");
                }}
              />
            ) : (
              <>
                <header className="flex items-start gap-3 px-5 pb-3 pt-4">
                  <GuestAvatar name={guest.name} guestType={guest.guestType} className="size-12" />
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-serif text-xl leading-tight">{guest.name}</h2>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <StatusBadge status={global} />
                      <span
                        className="rounded-full px-2.5 py-1 text-[11px] font-medium"
                        style={{ backgroundColor: meta.bg, color: meta.fg }}
                      >
                        {meta.short}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Fermer"
                    className="-mr-2 grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted"
                  >
                    <X className="size-4" />
                  </button>
                </header>

                <div className="flex-1 space-y-5 overflow-y-auto px-5 pb-6 pt-2">
                  {showWhatsapp ? (
                    <div>
                      {whatsappUrl ? (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex w-full items-center justify-center gap-2 rounded-lg bg-whatsapp py-3 text-sm font-medium text-white transition hover:opacity-90"
                        >
                          <img src={whatsappIconUrl} alt="" className="size-5 object-contain" />
                          Envoyer l'invitation sur WhatsApp
                        </a>
                      ) : (
                        <>
                          <span
                            aria-disabled
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-whatsapp/50 py-3 text-sm font-medium text-white"
                          >
                            <img
                              src={whatsappIconUrl}
                              alt=""
                              className="size-5 object-contain opacity-60"
                            />
                            Envoyer l'invitation sur WhatsApp
                          </span>
                          <p className="mt-1.5 text-[12px] text-muted-foreground">
                            {whatsappBlockedReason}
                          </p>
                        </>
                      )}
                    </div>
                  ) : null}

                  <Section title="Réponse">
                    {canManage ? (
                      guest.ceremonyIds.length === 0 ? (
                        <p className="text-[13px] text-muted-foreground">
                          Cet invité n'est rattaché à aucune étape. Utilisez « Modifier » pour en
                          choisir.
                        </p>
                      ) : (
                        <>
                          <div
                            role="radiogroup"
                            aria-label="Statut de la réponse"
                            className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1"
                          >
                            {STATUS_CHOICES.map((s) => (
                              <button
                                key={s}
                                type="button"
                                role="radio"
                                aria-checked={global === s}
                                onClick={() => global !== s && setStatus(s)}
                                className={cn(
                                  "rounded-lg py-2 text-[13px] transition",
                                  global === s
                                    ? "bg-card font-medium shadow-sm"
                                    : "text-muted-foreground hover:text-foreground",
                                )}
                              >
                                {statusLabel[s]}
                              </button>
                            ))}
                          </div>
                          <p className="mt-1.5 text-[12px] text-muted-foreground">
                            Pour ceux qui répondent par téléphone. S'applique à toutes ses étapes.
                          </p>
                          {global === "confirmé" && guest.allowedPlusOnes > 0 ? (
                            <div className="mt-3 flex items-center justify-between rounded-xl border border-border bg-card px-3.5 py-2.5">
                              <span className="text-[13px]">
                                Accompagnants
                                <span className="text-muted-foreground">
                                  {" "}
                                  (max {guest.allowedPlusOnes})
                                </span>
                              </span>
                              <Stepper
                                value={plusOnes}
                                min={0}
                                max={guest.allowedPlusOnes}
                                onChange={setPlusOnes}
                              />
                            </div>
                          ) : null}
                        </>
                      )
                    ) : (
                      <p className="text-[13px] text-muted-foreground">
                        {fromPublicRsvp
                          ? "Réponse reçue via le lien public de votre invitation."
                          : "L'événement est passé : la fiche est en lecture seule."}
                      </p>
                    )}
                  </Section>

                  {guest.phone || guest.email ? (
                    <Section title="Contact">
                      <div className="space-y-2">
                        {guest.phone ? (
                          <a
                            href={`tel:${guest.phone}`}
                            className="flex items-center gap-2.5 text-[14px]"
                          >
                            <Phone className="size-4 text-muted-foreground" />
                            {guest.phone}
                          </a>
                        ) : null}
                        {guest.email ? (
                          <a
                            href={`mailto:${guest.email}`}
                            className="flex items-center gap-2.5 text-[14px]"
                          >
                            <Mail className="size-4 text-muted-foreground" />
                            <span className="truncate">{guest.email}</span>
                          </a>
                        ) : null}
                      </div>
                    </Section>
                  ) : null}

                  <Section title="Détail">
                    <dl className="divide-y divide-border rounded-xl border border-border bg-card text-[13px]">
                      <Row label="Type">{meta.label}</Row>
                      <Row label="Source">{sourceLabel[guest.source] ?? "—"}</Row>
                      {guest.allowedPlusOnes > 0 ? (
                        <Row label="Accompagnants autorisés">{guest.allowedPlusOnes}</Row>
                      ) : null}
                      <Row label="Étapes">
                        {guestCeremonies.length === 0 ? (
                          "Aucune"
                        ) : (
                          <ul className="space-y-1">
                            {guestCeremonies.map(({ ceremony, rsvp }) => (
                              <li key={ceremony.id} className="flex items-center justify-end gap-2">
                                <span className="truncate">{ceremony.name || ceremony.label}</span>
                                <span className="shrink-0 text-[12px] text-muted-foreground">
                                  {statusLabel[rsvp?.status ?? "en_attente"]}
                                  {rsvp?.status === "confirmé" && rsvp.plusOnes > 0
                                    ? ` +${rsvp.plusOnes}`
                                    : ""}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </Row>
                      {guest.message ? <Row label="Message">{guest.message}</Row> : null}
                    </dl>
                  </Section>

                  {canManage ? (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setMode("edit")}
                        className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card py-3 text-sm font-medium transition hover:bg-secondary/40"
                      >
                        <Pencil className="size-4" />
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        className="flex items-center justify-center gap-1.5 rounded-lg border border-destructive/30 py-3 text-sm font-medium text-destructive transition hover:bg-destructive/10"
                      >
                        <Trash2 className="size-4" />
                        Supprimer
                      </button>
                    </div>
                  ) : fromPublicRsvp && !readOnly ? (
                    <button
                      type="button"
                      onClick={onDeleteRsvps}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-destructive/30 py-3 text-sm font-medium text-destructive transition hover:bg-destructive/10"
                    >
                      <Trash2 className="size-4" />
                      Supprimer la confirmation
                    </button>
                  ) : null}
                </div>
              </>
            )}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <p className="mb-2 text-[12px] font-medium text-muted-foreground">{title}</p>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 px-3.5 py-2.5">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right">{children}</dd>
    </div>
  );
}

function Stepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        aria-label="Moins"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        className="grid size-9 place-items-center rounded-full border border-border hover:bg-secondary/40 disabled:opacity-40"
      >
        <Minus className="size-4" />
      </button>
      <span className="min-w-5 text-center text-[15px] font-medium tabular-nums">{value}</span>
      <button
        type="button"
        aria-label="Plus"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className="grid size-9 place-items-center rounded-full border border-border hover:bg-secondary/40 disabled:opacity-40"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

function EditForm({
  guest,
  dirtyRef,
  onCancel,
  onSaved,
}: {
  guest: Guest;
  dirtyRef: { current: boolean };
  onCancel: () => void;
  onSaved: () => void;
}) {
  const { ceremonies, updateGuest } = useWedding();
  const [name, setName] = useState(guest.name);
  const [phone, setPhone] = useState<string | undefined>(guest.phone || undefined);
  const [email, setEmail] = useState(guest.email ?? "");
  const [type, setType] = useState<GuestType>(guest.guestType);
  const [ids, setIds] = useState<string[]>(guest.ceremonyIds);
  const [allowed, setAllowed] = useState(guest.allowedPlusOnes);
  const [error, setError] = useState<string | null>(null);

  const dirty =
    name !== guest.name ||
    (phone ?? "") !== (guest.phone ?? "") ||
    email !== (guest.email ?? "") ||
    type !== guest.guestType ||
    allowed !== guest.allowedPlusOnes ||
    ids.slice().sort().join() !== guest.ceremonyIds.slice().sort().join();
  dirtyRef.current = dirty;

  const save = () => {
    if (!name.trim()) return setError("Le nom est obligatoire.");
    if (phone && !isValidPhoneNumber(phone)) return setError("Numéro de téléphone invalide.");
    const rsvps: RSVP[] = ids.map(
      (cid) =>
        guest.rsvps.find((r) => r.ceremonyId === cid) ?? {
          ceremonyId: cid,
          status: "en_attente",
          plusOnes: 0,
        },
    );
    void updateGuest(guest.id, {
      name: name.trim(),
      phone: phone ?? "",
      email: email.trim(),
      guestType: type,
      group: guestTypeMeta[type].short,
      allowedPlusOnes: allowed,
      ceremonyIds: ids,
      rsvps,
    });
    toast.success("Invité mis à jour.");
    onSaved();
  };

  return (
    <>
      <header className="px-5 pb-2 pt-4">
        <h2 className="font-serif text-xl">Modifier l'invité</h2>
      </header>
      <div className="flex-1 space-y-4 overflow-y-auto px-5 pb-6 pt-2">
        <div>
          <label
            htmlFor="guest-name"
            className="mb-1.5 block text-[12px] font-medium text-muted-foreground"
          >
            Nom complet
          </label>
          <input
            id="guest-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <p className="mb-1.5 text-[12px] font-medium text-muted-foreground">Téléphone WhatsApp</p>
          <PhoneField
            value={phone}
            onChange={setPhone}
            showError
            errorMessage="Numéro de téléphone invalide"
          />
        </div>
        <div>
          <label
            htmlFor="guest-email"
            className="mb-1.5 block text-[12px] font-medium text-muted-foreground"
          >
            Email (facultatif)
          </label>
          <input
            id="guest-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <p className="mb-1.5 text-[12px] font-medium text-muted-foreground">Type d'invité</p>
          <div className="flex flex-wrap gap-2">
            {guestTypeOrder.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={type === t}
                onClick={() => setType(t)}
                className={cn(
                  "rounded-full border px-3 py-2 text-[13px] transition",
                  type === t
                    ? "border-primary bg-secondary font-medium"
                    : "border-border bg-card hover:bg-secondary/40",
                )}
              >
                {guestTypeMeta[t].label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-[12px] font-medium text-muted-foreground">Invité aux étapes</p>
          {ceremonies.length === 0 ? (
            <p className="text-[13px] text-muted-foreground">Aucune étape créée pour l'instant.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {ceremonies.map((c) => {
                const on = ids.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() =>
                      setIds((prev) => (on ? prev.filter((x) => x !== c.id) : [...prev, c.id]))
                    }
                    className={cn(
                      "rounded-full border px-3 py-2 text-[13px] transition",
                      on
                        ? "border-primary bg-secondary font-medium"
                        : "border-border bg-card text-muted-foreground hover:bg-secondary/40",
                    )}
                  >
                    {c.name || c.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border bg-card px-3.5 py-2.5">
          <span className="text-[13px]">Accompagnants autorisés</span>
          <Stepper value={allowed} min={0} max={5} onChange={setAllowed} />
        </div>

        {error ? <p className="text-[13px] text-destructive">{error}</p> : null}

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border bg-card py-3 text-sm font-medium transition hover:bg-secondary/40"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!dirty}
            className="rounded-lg bg-primary py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </>
  );
}
