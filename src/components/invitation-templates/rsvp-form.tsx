import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Ceremony, ThemeId } from "@/lib/wedding-store";
import { guestTypeMeta, guestTypeOrder, type GuestType } from "@/lib/guest-meta";
import { resolveRsvpDesign, type RsvpDesign } from "@/lib/rsvp-design";
import { RsvpOrnament } from "./rsvp-ornament";

/**
 * Public RSVP form.
 *
 * Prefers a per-theme design (`theme`) so the palette, typography and
 * ornament match the invitation. Falls back to a neutral tone-based mapping
 * for legacy callers that only know a template tone.
 */
type LegacyTone = "warm" | "dark" | "gold" | "tropical" | "deco";

interface Props {
  theme?: ThemeId;
  /** @deprecated Use `theme` for full per-theme styling. */
  tone?: LegacyTone;
  weddingId?: string;
  ceremonies?: Ceremony[];
  /** Called once when the guest successfully confirms their attendance. */
  onConfirmed?: () => void;
}

// Legacy tone → representative theme (kept only for invitation.tsx preview)
const TONE_TO_THEME: Record<LegacyTone, ThemeId> = {
  warm: "terracotta-boheme",
  dark: "monochrome",
  gold: "or-antique",
  tropical: "confetti",
  deco: "or-antique",
};

const DIETARY_TAGS = [
  "Végétarien",
  "Végétalien",
  "Sans gluten",
  "Sans lactose",
  "Halal",
  "Casher",
  "Allergie",
] as const;

export function TemplateRsvpForm({ theme, tone, weddingId, ceremonies = [], onConfirmed }: Props) {
  const resolvedTheme: ThemeId | undefined =
    theme ?? (tone ? TONE_TO_THEME[tone] : undefined);
  const design = resolveRsvpDesign(resolvedTheme);

  const published = ceremonies.filter((c) => c.status === "publiée");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [guestType, setGuestType] = useState<GuestType | "">("");
  const [plus, setPlus] = useState(0);
  const [message, setMessage] = useState("");
  const [dietaryTags, setDietaryTags] = useState<string[]>([]);
  const [dietaryDetail, setDietaryDetail] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const canSubmit = useMemo(
    () => name.trim().length > 1 && guestType !== "" && !submitting,
    [name, guestType, submitting],
  );

  const toggleTag = (tag: string) =>
    setDietaryTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  const composedDietary = useMemo(() => {
    const parts: string[] = [];
    if (dietaryTags.length > 0) parts.push(dietaryTags.join(", "));
    const detail = dietaryDetail.trim();
    if (detail) parts.push(detail);
    return parts.join(" — ").slice(0, 500);
  }, [dietaryTags, dietaryDetail]);

  const reset = () => {
    setDone(false);
    setName("");
    setPhone("");
    setGuestType("");
    setPlus(0);
    setMessage("");
    setDietaryTags([]);
    setDietaryDetail("");
    setError(null);
  };

  const submit = async (): Promise<boolean> => {
    setError(null);
    if (!weddingId) {
      setDone(true);
      onConfirmed?.();
      return true;
    }
    setSubmitting(true);
    try {
      const rows = published.map((c) => ({
        wedding_id: weddingId,
        ceremony_id: c.id,
        guest_name: name.trim(),
        guest_phone: phone || null,
        guest_type: guestType || null,
        attending: true,
        companions: plus,
        message: message.trim() || null,
        dietary_notes: composedDietary || null,
      }));
      const { error: err } = await supabase.from("rsvps").insert(rows as never);
      if (err) throw err;
      setDone(true);
      onConfirmed?.();
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Une erreur s'est produite.";
      setError(msg);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const noPublished = !published.length;

  return (
    <>
      <section
        className={
          "relative mt-12 w-full max-w-full overflow-hidden px-5 py-8 text-center sm:px-8 sm:py-10 " +
          design.wrapperRadius +
          " " +
          design.border1
        }
        style={{
          background: design.bg,
          color: design.ink,
          borderColor: design.border,
          fontFamily: design.bodyFont,
        }}
      >
        <div className="mb-4">
          <RsvpOrnament kind={design.ornament} color={design.accent} />
        </div>

        <p
          className="text-[10px] uppercase tracking-[0.35em]"
          style={{ color: design.accent, fontFamily: design.eyebrowFont }}
        >
          {design.eyebrow}
        </p>

        <h3
          className={
            "mt-3 break-words text-3xl leading-tight sm:text-4xl " +
            (design.headingItalic ? "italic" : "")
          }
          style={{ fontFamily: design.headingFont, color: design.ink }}
        >
          {done ? `Merci ${name.split(" ")[0] || ""} !` : "Confirmez votre venue"}
        </h3>

        <p
          className="mx-auto mt-3 max-w-sm text-sm leading-relaxed"
          style={{ color: design.mutedInk }}
        >
          {noPublished
            ? "Les détails seront ajoutés bientôt. Repassez pour confirmer."
            : done
              ? weddingId
                ? "Votre réponse est bien enregistrée."
                : "Aperçu — la réponse n'a pas été enregistrée."
              : "Répondez en quelques secondes pour nous aider à préparer cette belle journée."}
        </p>

        {!noPublished && (
          <button
            type="button"
            onClick={() => {
              if (done) reset();
              setOpen(true);
            }}
            className={
              "mt-6 inline-flex max-w-full items-center justify-center gap-2 px-6 py-3 text-[11px] uppercase tracking-[0.25em] transition hover:opacity-90 " +
              design.fieldRadius
            }
            style={{
              background: design.accent,
              color: design.accentInk,
              fontFamily: design.eyebrowFont,
              boxShadow: `0 10px 25px -12px ${design.accent}`,
            }}
          >
            {done ? "Modifier ma réponse" : "Je serai présent(e)"}
          </button>
        )}
      </section>

      {open
        ? createPortal(
            <RsvpModal
              design={design}
              published={published}
              name={name}
              setName={setName}
              phone={phone}
              setPhone={setPhone}
              guestType={guestType}
              setGuestType={setGuestType}
              plus={plus}
              setPlus={setPlus}
              message={message}
              setMessage={setMessage}
              dietaryTags={dietaryTags}
              toggleTag={toggleTag}
              dietaryDetail={dietaryDetail}
              setDietaryDetail={setDietaryDetail}
              submitting={submitting}
              canSubmit={canSubmit}
              error={error}
              onClose={() => setOpen(false)}
              onSubmit={async () => {
                const ok = await submit();
                if (ok) setOpen(false);
              }}
            />,
            document.body,
          )
        : null}
    </>
  );
}

interface ModalProps {
  design: RsvpDesign;
  published: Ceremony[];
  name: string;
  setName: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  guestType: GuestType | "";
  setGuestType: (v: GuestType) => void;
  plus: number;
  setPlus: (fn: (v: number) => number) => void;
  message: string;
  setMessage: (v: string) => void;
  dietaryTags: string[];
  toggleTag: (tag: string) => void;
  dietaryDetail: string;
  setDietaryDetail: (v: string) => void;
  submitting: boolean;
  canSubmit: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: () => void;
}

function RsvpModal({
  design: d,
  published,
  name,
  setName,
  phone,
  setPhone,
  guestType,
  setGuestType,
  plus,
  setPlus,
  message,
  setMessage,
  dietaryTags,
  toggleTag,
  dietaryDetail,
  setDietaryDetail,
  submitting,
  canSubmit,
  error,
  onClose,
  onSubmit,
}: ModalProps) {
  const inputStyle: React.CSSProperties = {
    background: d.inputBg,
    borderColor: d.inputBorder,
    color: d.inputInk,
    fontFamily: d.bodyFont,
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={
          "relative flex max-h-[92vh] w-full max-w-full flex-col overflow-hidden sm:max-w-lg " +
          d.modalRadius
        }
        style={{
          background: d.surface,
          color: d.ink,
          borderTop: `1px solid ${d.border}`,
          fontFamily: d.bodyFont,
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 z-10 grid size-9 shrink-0 place-items-center rounded-full text-lg opacity-70 hover:opacity-100"
          style={{ border: `1px solid ${d.border}`, color: d.ink }}
        >
          ×
        </button>

        <div className="overflow-y-auto overscroll-contain px-5 pb-8 pt-6 sm:px-7">
          <RsvpOrnament
            kind={d.ornament}
            color={d.accent}
            className="mx-auto block h-5 w-24"
          />
          <p
            className="mt-3 text-center text-[10px] uppercase tracking-[0.35em]"
            style={{ color: d.accent, fontFamily: d.eyebrowFont }}
          >
            {d.eyebrow}
          </p>
          <h4
            className={
              "mt-2 text-center text-2xl sm:text-3xl " +
              (d.headingItalic ? "italic" : "")
            }
            style={{ fontFamily: d.headingFont, color: d.ink }}
          >
            Votre présence
          </h4>

          <div className="mt-6 space-y-3">
            <input data-rsvp-input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom complet"
              className={
                "w-full max-w-full border px-4 py-3 text-sm outline-none " +
                d.fieldRadius
              }
              style={{ ...inputStyle, ...placeholderVar(d.placeholderInk) }}
            />
            <input data-rsvp-input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Téléphone WhatsApp (optionnel)"
              className={
                "w-full max-w-full border px-4 py-3 text-sm outline-none " +
                d.fieldRadius
              }
              style={{ ...inputStyle, ...placeholderVar(d.placeholderInk) }}
            />
          </div>

          <div className="mt-6">
            <p
              className="text-[10px] uppercase tracking-[0.25em]"
              style={{ color: d.mutedInk, fontFamily: d.eyebrowFont }}
            >
              Vous êtes…
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {guestTypeOrder.map((g) => {
                const meta = guestTypeMeta[g];
                const active = guestType === g;
                return (
                  <Chip
                    key={g}
                    active={active}
                    design={d}
                    onClick={() => setGuestType(g)}
                  >
                    {meta.label}
                  </Chip>
                );
              })}
            </div>
          </div>

          {published.length > 0 && (
            <div
              className="mt-4 max-w-full overflow-hidden p-4"
              style={{
                border: `1px solid ${d.border}`,
                borderRadius: "1rem",
                background: d.bg,
              }}
            >
              <p
                className="text-[10px] uppercase tracking-[0.25em]"
                style={{ color: d.mutedInk, fontFamily: d.eyebrowFont }}
              >
                Événements
              </p>
              <div className="mt-2 space-y-2">
                {published.map((c) => (
                  <div key={c.id} className="flex min-w-0 items-center gap-3">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{c.name}</p>
                      <p
                        className="truncate text-[9px] uppercase tracking-wider"
                        style={{ color: d.mutedInk }}
                      >
                        {c.timeStart} · {c.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          <div className="mt-6">
            <p
              className="text-[10px] uppercase tracking-[0.25em]"
              style={{ color: d.mutedInk, fontFamily: d.eyebrowFont }}
            >
              Allergies ou régime alimentaire
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {DIETARY_TAGS.map((tag) => {
                const active = dietaryTags.includes(tag);
                return (
                  <Chip
                    key={tag}
                    active={active}
                    design={d}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Chip>
                );
              })}
            </div>
            <textarea data-rsvp-input
              value={dietaryDetail}
              onChange={(e) => setDietaryDetail(e.target.value.slice(0, 300))}
              placeholder="Précisez si besoin (ex. allergie aux arachides, sans porc, etc.)"
              rows={2}
              className="mt-3 w-full max-w-full resize-none rounded-2xl border px-4 py-3 text-sm outline-none"
              style={{ ...inputStyle, ...placeholderVar(d.placeholderInk) }}
            />
            <p className="mt-1 text-[10px]" style={{ color: d.mutedInk }}>
              {dietaryDetail.length}/300
            </p>
          </div>

          <textarea data-rsvp-input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Un mot pour les mariés (optionnel)"
            rows={3}
            className="mt-4 w-full max-w-full resize-none rounded-2xl border px-4 py-3 text-sm outline-none"
            style={{ ...inputStyle, ...placeholderVar(d.placeholderInk) }}
          />

          {error ? (
            <p className="mt-3 text-center text-xs text-red-500">{error}</p>
          ) : null}

          <button
            disabled={!canSubmit}
            onClick={onSubmit}
            className={
              "mt-6 w-full py-4 text-[11px] uppercase tracking-[0.25em] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 " +
              d.fieldRadius
            }
            style={{
              background: d.accent,
              color: d.accentInk,
              fontFamily: d.eyebrowFont,
            }}
          >
            {submitting ? "Envoi…" : "Confirmer ma venue"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Chip({
  children,
  active,
  design: d,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  design: RsvpDesign;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "max-w-full break-words px-3 py-1.5 text-xs transition " + d.chipRadius
      }
      style={
        active
          ? {
              background: d.accent,
              color: d.accentInk,
              border: `1px solid ${d.accent}`,
              fontFamily: d.eyebrowFont,
            }
          : {
              background: "transparent",
              color: d.mutedInk,
              border: `1px solid ${d.border}`,
              fontFamily: d.eyebrowFont,
            }
      }
    >
      {children}
    </button>
  );
}

/**
 * Inline CSS variable read by the `[data-rsvp-input]::placeholder` rule in
 * src/styles.css so each input inherits the themed placeholder color.
 */
function placeholderVar(color: string): React.CSSProperties {
  return { ["--rsvp-placeholder" as never]: color } as React.CSSProperties;
}
