import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useWedding } from "@/lib/wedding-store";
import { guestTypeMeta, guestTypeOrder, type GuestType } from "@/lib/guest-meta";
import { Field } from "./signup";

export const Route = createFileRoute("/onboarding/guests")({
  head: () => ({ meta: [{ title: "Étape 4 / 4 — Vos premiers invités" }] }),
  component: Step4,
});

function Step4() {
  const { addGuest, setOnboardingStep, ceremonies } = useWedding();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-4xl italic">Ajoutez quelques invités</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Optionnel — vous pourrez tout faire depuis votre tableau de bord.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg border-2 border-dashed border-primary/30 bg-secondary/30 p-6 text-left transition hover:border-primary hover:bg-secondary/50"
        >
          <p className="font-serif text-xl italic text-primary">+</p>
          <p className="mt-2 font-medium">Ajouter à la main</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Nom, téléphone, type d'invité.
          </p>
        </button>
        <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-6 text-left opacity-60">
          <p className="font-serif text-xl italic">↑</p>
          <p className="mt-2 font-medium">Importer un CSV</p>
          <p className="mt-1 text-xs text-muted-foreground">Bientôt disponible.</p>
        </div>
      </div>

      <div className="pt-4">
        <button
          onClick={() => {
            setOnboardingStep(4);
            navigate({ to: "/dashboard" });
          }}
          className="w-full rounded-lg bg-primary px-4 py-3.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Voir mon tableau de bord
        </button>
        <Link
          to="/dashboard"
          onClick={() => setOnboardingStep(4)}
          className="mt-3 block text-center text-xs text-muted-foreground hover:text-foreground"
        >
          Passer cette étape
        </Link>
      </div>

      {open ? (
        <QuickGuestModal
          onClose={() => setOpen(false)}
          onSave={(g) => {
            addGuest({
              ...g,
              group: guestTypeMeta[g.guestType].short,
              source: "manuel",
              ceremonyIds: ceremonies.map((c) => c.id),
            });
            setOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}

function QuickGuestModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (g: { name: string; phone: string; guestType: GuestType; allowedPlusOnes: number }) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState<GuestType>("ami_mariee");

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40 sm:items-center sm:justify-center">
      <div className="w-full rounded-t-2xl bg-card p-6 sm:max-w-md sm:rounded-2xl">
        <h2 className="font-serif text-2xl italic">Nouvel invité</h2>
        <div className="mt-5 space-y-4">
          <Field label="Nom complet">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Prénom et nom"
              className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </Field>
          <Field label="Téléphone WhatsApp">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+225 XX XX XX XX XX"
              className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </Field>
          <Field label="Type d'invité">
            <div className="flex flex-wrap gap-2">
              {guestTypeOrder.map((t) => {
                const active = type === t;
                return (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={
                      "rounded-full border px-3 py-1.5 text-xs transition " +
                      (active
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-card hover:bg-secondary/40")
                    }
                  >
                    {guestTypeMeta[t].label}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>
        <div className="mt-6 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-border py-3 text-sm hover:bg-secondary/40"
          >
            Annuler
          </button>
          <button
            disabled={!name.trim()}
            onClick={() => onSave({ name: name.trim(), phone: phone.trim(), guestType: type, allowedPlusOnes: 0 })}
            className="flex-1 rounded-lg bg-primary py-3 text-sm text-primary-foreground disabled:opacity-40"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
