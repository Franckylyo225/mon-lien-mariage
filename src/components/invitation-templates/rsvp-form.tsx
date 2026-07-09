import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Ceremony } from "@/lib/wedding-store";
import { guestTypeMeta, guestTypeOrder, type GuestType } from "@/lib/guest-meta";

interface Props {
  tone: "warm" | "dark" | "gold" | "tropical" | "deco";
  weddingId?: string;
  ceremonies?: Ceremony[];
}

type Choice = "confirmé" | "décliné";

const toneClasses: Record<
  Props["tone"],
  {
    wrapper: string;
    title: string;
    input: string;
    button: string;
    disabled: string;
    active: string;
    inactive: string;
    successBg: string;
    modalBg: string;
    modalText: string;
  }
> = {
  warm: {
    wrapper: "bg-[#f4e2d4] text-[#4a2a20]",
    title: "font-serif italic text-[#4a2a20]",
    input:
      "bg-white/70 border-[#4a2a20]/15 text-[#4a2a20] placeholder:text-[#4a2a20]/40 focus:border-[#d97757]",
    button: "bg-[#d97757] text-white shadow-md shadow-[#d97757]/30 hover:opacity-90",
    disabled: "disabled:opacity-40",
    active: "bg-[#d97757] text-white",
    inactive: "border border-[#4a2a20]/20 text-[#4a2a20]/80 hover:bg-white/60",
    successBg: "bg-[#d97757]/15 text-[#4a2a20]",
    modalBg: "bg-[#fbf1e8]",
    modalText: "text-[#4a2a20]",
  },
  dark: {
    wrapper: "bg-[#0d0d0d] text-[#f5f3ee] border border-[#f5f3ee]/10",
    title: "font-sans font-medium tracking-tight text-[#f5f3ee]",
    input:
      "bg-[#1a1a1a] border-[#f5f3ee]/15 text-[#f5f3ee] placeholder:text-[#f5f3ee]/40 focus:border-[#f5f3ee]",
    button: "bg-[#f5f3ee] text-[#0d0d0d] hover:opacity-90",
    disabled: "disabled:opacity-40",
    active: "bg-[#f5f3ee] text-[#0d0d0d]",
    inactive: "border border-[#f5f3ee]/25 text-[#f5f3ee]/70 hover:bg-white/5",
    successBg: "bg-[#1a1a1a] text-[#f5f3ee]",
    modalBg: "bg-[#0d0d0d]",
    modalText: "text-[#f5f3ee]",
  },
  gold: {
    wrapper: "bg-[#f5f0e4] text-[#3d4a2d] border border-[#c9a84c]/30",
    title: "font-serif italic text-[#3d4a2d]",
    input:
      "bg-white border-[#c9a84c]/40 text-[#3d4a2d] placeholder:text-[#3d4a2d]/40 focus:border-[#c9a84c]",
    button: "bg-[#3d4a2d] text-[#f5f0e4] hover:opacity-90",
    disabled: "disabled:opacity-40",
    active: "bg-[#c9a84c] text-[#3d4a2d]",
    inactive:
      "border border-[#3d4a2d]/20 text-[#3d4a2d]/80 hover:bg-[#c9a84c]/10",
    successBg: "bg-[#c9a84c]/20 text-[#3d4a2d]",
    modalBg: "bg-[#faf5e8]",
    modalText: "text-[#3d4a2d]",
  },
  tropical: {
    wrapper: "bg-[#0d3b2e] text-[#f4e4c1] border border-[#e88b62]/30",
    title: "font-serif italic text-[#f4e4c1]",
    input:
      "bg-[#1a4d3d] border-[#f4e4c1]/20 text-[#f4e4c1] placeholder:text-[#f4e4c1]/40 focus:border-[#e88b62]",
    button: "bg-[#e88b62] text-[#0d3b2e] hover:opacity-90",
    disabled: "disabled:opacity-40",
    active: "bg-[#e88b62] text-[#0d3b2e]",
    inactive:
      "border border-[#f4e4c1]/30 text-[#f4e4c1]/80 hover:bg-[#f4e4c1]/10",
    successBg: "bg-[#1a4d3d] text-[#f4e4c1]",
    modalBg: "bg-[#0d3b2e]",
    modalText: "text-[#f4e4c1]",
  },
  deco: {
    wrapper:
      "bg-gradient-to-br from-[#1a0f1a] to-[#2a1520] text-[#f0d78c] border border-[#c9a84c]/40",
    title: "font-serif italic text-[#f0d78c]",
    input:
      "bg-[#1a0f1a] border-[#c9a84c]/40 text-[#f0d78c] placeholder:text-[#f0d78c]/40 focus:border-[#c9a84c]",
    button: "bg-[#c9a84c] text-[#1a0f1a] hover:opacity-90",
    disabled: "disabled:opacity-40",
    active: "bg-[#c9a84c] text-[#1a0f1a]",
    inactive:
      "border border-[#c9a84c]/30 text-[#f0d78c]/80 hover:bg-[#c9a84c]/10",
    successBg: "bg-[#1a0f1a] text-[#f0d78c]",
    modalBg: "bg-gradient-to-br from-[#1a0f1a] to-[#2a1520]",
    modalText: "text-[#f0d78c]",
  },
};

export function TemplateRsvpForm({ tone, weddingId, ceremonies = [] }: Props) {
  const t = toneClasses[tone];
  const published = ceremonies.filter((c) => c.status === "publiée");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [guestType, setGuestType] = useState<GuestType | "">("");
  const [plus, setPlus] = useState(0);
  const [choices, setChoices] = useState<Record<string, Choice>>({});
  const [message, setMessage] = useState("");
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
    () =>
      name.trim().length > 1 &&
      guestType !== "" &&
      Object.keys(choices).length === published.length &&
      !submitting,
    [name, guestType, choices, published.length, submitting],
  );

  const reset = () => {
    setDone(false);
    setName("");
    setPhone("");
    setGuestType("");
    setPlus(0);
    setChoices({});
    setMessage("");
    setError(null);
  };

  const submit = async (): Promise<boolean> => {
    setError(null);
    if (!weddingId) {
      setDone(true);
      return true;
    }
    setSubmitting(true);
    try {
      const rows = published.map((c) => ({
        wedding_id: weddingId,
        ceremony_id: c.id,
        guest_name: name.trim(),
        guest_phone: phone.trim() || null,
        guest_type: guestType || null,
        attending: choices[c.id] === "confirmé",
        companions: choices[c.id] === "confirmé" ? plus : 0,
        message: message.trim() || null,
      }));
      const { error: err } = await supabase.from("rsvps").insert(rows as never);
      if (err) throw err;
      setDone(true);
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
      <section className={`mt-12 rounded-3xl p-8 text-center ${t.wrapper}`}>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-60">
          Votre présence
        </p>
        <h3 className={`mt-3 text-2xl ${t.title}`}>
          {done ? `Merci ${name.split(" ")[0] || ""} !` : "Confirmez votre venue"}
        </h3>
        <p className="mx-auto mt-3 max-w-sm text-sm opacity-70">
          {noPublished
            ? "Les étapes seront ajoutées bientôt. Repassez pour confirmer."
            : done
              ? weddingId
                ? "Votre réponse est bien enregistrée."
                : "Aperçu — la réponse n'a pas été enregistrée."
              : "Répondez en 30 secondes, à chaque étape à laquelle vous êtes convié·e."}
        </p>
        {!noPublished && (
          <button
            type="button"
            onClick={() => {
              if (done) reset();
              setOpen(true);
            }}
            className={
              "mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 font-mono text-[11px] uppercase tracking-[0.25em] transition " +
              t.button
            }
          >
            {done ? "Modifier ma réponse" : "Répondre (RSVP)"}
          </button>
        )}
      </section>

      {open
        ? createPortal(
            <RsvpModal
              t={t}
              published={published}
              name={name}
              setName={setName}
              phone={phone}
              setPhone={setPhone}
              guestType={guestType}
              setGuestType={setGuestType}
              plus={plus}
              setPlus={setPlus}
              choices={choices}
              setChoices={setChoices}
              message={message}
              setMessage={setMessage}
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
  t: (typeof toneClasses)[Props["tone"]];
  published: Ceremony[];
  name: string;
  setName: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  guestType: GuestType | "";
  setGuestType: (v: GuestType) => void;
  plus: number;
  setPlus: (fn: (v: number) => number) => void;
  choices: Record<string, Choice>;
  setChoices: (fn: (v: Record<string, Choice>) => Record<string, Choice>) => void;
  message: string;
  setMessage: (v: string) => void;
  submitting: boolean;
  canSubmit: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: () => void;
}

function RsvpModal({
  t,
  published,
  name,
  setName,
  phone,
  setPhone,
  guestType,
  setGuestType,
  plus,
  setPlus,
  choices,
  setChoices,
  message,
  setMessage,
  submitting,
  canSubmit,
  error,
  onClose,
  onSubmit,
}: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl sm:max-w-lg sm:rounded-3xl ${t.modalBg} ${t.modalText} p-6 sm:p-8`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 grid size-9 place-items-center rounded-full border border-current/20 text-lg opacity-70 hover:opacity-100"
        >
          ×
        </button>

        <p className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-60">
          Répondre
        </p>
        <h4 className={`mt-2 text-2xl ${t.title}`}>Votre présence</h4>

        <div className="mt-6 space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Votre nom complet"
            className={`w-full rounded-full border px-4 py-3 text-sm focus:outline-none ${t.input}`}
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Téléphone WhatsApp (optionnel)"
            className={`w-full rounded-full border px-4 py-3 text-sm focus:outline-none ${t.input}`}
          />
        </div>

        <div className="mt-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-60">
            Vous êtes…
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {guestTypeOrder.map((g) => {
              const meta = guestTypeMeta[g];
              const active = guestType === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGuestType(g)}
                  className={
                    "rounded-full px-3 py-1.5 text-xs transition " +
                    (active ? t.active : t.inactive)
                  }
                >
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-60">
            Pour chaque étape
          </p>
          {published.map((c) => (
            <div key={c.id} className="rounded-2xl border border-current/10 p-4">
              <div className="flex items-center gap-3">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.name}</p>
                  <p className="font-mono text-[9px] uppercase tracking-wider opacity-60">
                    {c.timeStart} · {c.label}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                {(["confirmé", "décliné"] as const).map((s) => {
                  const active = choices[c.id] === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() =>
                        setChoices((prev) => ({ ...prev, [c.id]: s }))
                      }
                      className={
                        "flex-1 rounded-full px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition " +
                        (active ? t.active : t.inactive)
                      }
                    >
                      {s === "confirmé" ? "Je viens" : "Je décline"}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between rounded-full border border-current/15 px-4 py-2">
          <span className="font-mono text-[10px] uppercase tracking-widest opacity-60">
            Accompagnants
          </span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setPlus((v) => Math.max(0, v - 1))}
              className="grid size-8 place-items-center rounded-full border border-current/30 text-lg"
            >
              −
            </button>
            <span className="font-mono text-lg">
              {plus.toString().padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => setPlus((v) => Math.min(9, v + 1))}
              className="grid size-8 place-items-center rounded-full border border-current/30 text-lg"
            >
              +
            </button>
          </div>
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Un mot pour les mariés (optionnel)"
          rows={3}
          className={`mt-4 w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none ${t.input}`}
        />

        {error ? (
          <p className="mt-3 text-center text-xs text-red-500">{error}</p>
        ) : null}

        <button
          disabled={!canSubmit}
          onClick={onSubmit}
          className={
            "mt-6 w-full rounded-full py-4 font-mono text-[11px] uppercase tracking-[0.25em] transition " +
            t.button +
            " disabled:cursor-not-allowed " +
            t.disabled
          }
        >
          {submitting ? "Envoi…" : "Envoyer ma réponse"}
        </button>
      </div>
    </div>
  );
}
