import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useWedding } from "@/lib/wedding-store";
import { Field } from "./signup";

export const Route = createFileRoute("/onboarding/dates")({
  head: () => ({ meta: [{ title: "Étape 3 / 4 — Les dates clés" }] }),
  component: StepDates,
});

function addDays(iso: string, days: number): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function StepDates() {
  const { couple, updateCouple, setOnboardingStep } = useWedding();
  const navigate = useNavigate();
  const [weddingDate, setWeddingDate] = useState(couple.weddingDate ?? "");
  const [rsvpDeadline, setRsvpDeadline] = useState(
    couple.rsvpDeadline ?? (couple.weddingDate ? addDays(couple.weddingDate, -30) : ""),
  );
  const [rsvpTouched, setRsvpTouched] = useState(!!couple.rsvpDeadline);
  const [city, setCity] = useState(couple.city && couple.city !== "Abidjan" ? couple.city : "");

  const onWeddingChange = (v: string) => {
    setWeddingDate(v);
    if (!rsvpTouched && v) {
      setRsvpDeadline(addDays(v, -30));
    }
  };

  const goNext = async (skipDates = false) => {
    if (!skipDates) {
      await updateCouple({
        weddingDate: weddingDate || "",
        rsvpDeadline: rsvpDeadline || undefined,
        city: city.trim() || "Abidjan",
      });
    }
    await setOnboardingStep(3);
    navigate({ to: "/onboarding/theme" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-4xl italic">Les dates clés</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Ces deux dates guident toute la planification.
        </p>
      </div>

      <div className="space-y-4">
        <Field label="Date du mariage">
          <input
            type="date"
            value={weddingDate}
            onChange={(e) => onWeddingChange(e.target.value)}
            className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </Field>
        <div>
          <Field label="Date limite des confirmations (RSVP)">
            <input
              type="date"
              value={rsvpDeadline}
              onChange={(e) => {
                setRsvpDeadline(e.target.value);
                setRsvpTouched(true);
              }}
              className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </Field>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            30 jours avant le mariage · vous pouvez ajuster.
          </p>
        </div>
        <Field label="Ville du mariage (optionnel)">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Abidjan"
            className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </Field>
      </div>

      <div>
        <button
          onClick={() => goNext(false)}
          className="w-full rounded-lg bg-primary px-4 py-3.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Continuer
        </button>
        <button
          type="button"
          onClick={() => goNext(true)}
          className="mt-3 block w-full text-center text-xs text-muted-foreground hover:text-foreground"
        >
          Je ne connais pas encore la date
        </button>
      </div>
    </div>
  );
}
