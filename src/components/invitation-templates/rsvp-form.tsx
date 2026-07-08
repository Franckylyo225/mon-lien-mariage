import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Ceremony } from "@/lib/wedding-store";

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
  },
};

export function TemplateRsvpForm({ tone, weddingId, ceremonies = [] }: Props) {
  const t = toneClasses[tone];
  const published = ceremonies.filter((c) => c.status === "publiée");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [plus, setPlus] = useState(0);
  const [choices, setChoices] = useState<Record<string, Choice>>({});
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => name.trim().length > 1 && Object.keys(choices).length === published.length && !submitting,
    [name, choices, published.length, submitting],
  );

  const submit = async () => {
    setError(null);
    if (!weddingId) {
      // Aperçu (pas de publication) — pas d'enregistrement
      setDone(true);
      return;
    }
    setSubmitting(true);
    try {
      const rows = published.map((c) => ({
        wedding_id: weddingId,
        ceremony_id: c.id,
        guest_name: name.trim(),
        guest_phone: phone.trim() || null,
        attending: choices[c.id] === "confirmé",
        companions: choices[c.id] === "confirmé" ? plus : 0,
        message: message.trim() || null,
      }));
      const { error: err } = await supabase.from("rsvps").insert(rows as never);
      if (err) throw err;
      setDone(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Une erreur s'est produite.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <section className={`mt-12 rounded-3xl p-8 text-center ${t.successBg}`}>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-70">
          Merci {name.split(" ")[0]}
        </p>
        <h3 className={`mt-3 text-2xl ${t.title}`}>Votre réponse est enregistrée</h3>
        <p className="mx-auto mt-3 max-w-sm text-sm opacity-70">
          {weddingId
            ? "Un rappel vous sera envoyé quelques jours avant la cérémonie."
            : "Mode aperçu — cette réponse n'a pas été enregistrée."}
        </p>
        <button
          onClick={() => {
            setDone(false);
            setName("");
            setChoices({});
            setMessage("");
          }}
          className="mt-6 rounded-full border border-current/30 px-5 py-2 font-mono text-[10px] uppercase tracking-[0.2em]"
        >
          Modifier ma réponse
        </button>
      </section>
    );
  }

  if (!published.length) {
    return (
      <section className={`mt-12 rounded-3xl p-8 text-center ${t.wrapper}`}>
        <p className="text-sm opacity-70">
          Les cérémonies seront ajoutées bientôt. Repassez ici pour confirmer votre présence.
        </p>
      </section>
    );
  }

  return (
    <section className={`mt-12 rounded-3xl p-6 sm:p-8 ${t.wrapper}`}>
      <h4 className={`text-center text-xl ${t.title}`}>Votre présence</h4>
      <p className="mt-1 text-center text-xs opacity-60">
        Répondez pour chaque cérémonie à laquelle vous êtes convié·e.
      </p>

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

      <div className="mt-6 space-y-3">
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
                    onClick={() => setChoices((prev) => ({ ...prev, [c.id]: s }))}
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
          <span className="font-mono text-lg">{plus.toString().padStart(2, "0")}</span>
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

      {error ? <p className="mt-3 text-center text-xs text-red-500">{error}</p> : null}

      <button
        disabled={!canSubmit}
        onClick={submit}
        className={
          "mt-6 w-full rounded-full py-4 font-mono text-[11px] uppercase tracking-[0.25em] transition " +
          t.button +
          " disabled:cursor-not-allowed " +
          t.disabled
        }
      >
        {submitting ? "Envoi…" : "Envoyer ma réponse"}
      </button>
    </section>
  );
}
