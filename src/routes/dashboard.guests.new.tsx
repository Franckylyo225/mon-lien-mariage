import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useWedding } from "@/lib/wedding-store";
import { guestTypeMeta, guestTypeOrder, type GuestType } from "@/lib/guest-meta";
import { Field } from "./signup";
import { PhoneField, isValidPhoneNumber } from "@/components/ui/PhoneField";

export const Route = createFileRoute("/dashboard/guests/new")({
  head: () => ({ meta: [{ title: "Nouvel invité — MonInvit.com" }] }),
  component: NewGuestPage,
});

function NewGuestPage() {
  const { ceremonies, addGuest } = useWedding();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState<string | undefined>(undefined);
  const [email, setEmail] = useState("");
  const [type, setType] = useState<GuestType>("ami_mariee");
  const [ids, setIds] = useState<string[]>(ceremonies[0] ? [ceremonies[0].id] : []);
  const [companions, setCompanions] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="space-y-6 pb-24">
      <header className="flex items-center gap-3">
        <Link
          to="/dashboard/guests"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Retour
        </Link>
      </header>
      <div>
        <h1 className="font-serif text-3xl italic">Nouvel invité</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ajoutez à la main ou (bientôt) partagez un QR code pour laisser vos invités
          s'inscrire seuls.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="font-serif text-lg italic">Identité</h2>
        <Field label="Nom complet *">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Prénom et nom"
            className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </Field>
        <Field label="Téléphone WhatsApp *">
          <PhoneField
            value={phone}
            onChange={setPhone}
            placeholder="Numéro de téléphone"
            showError
          />
        </Field>
        <Field label="Email (facultatif)">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contact@exemple.ci"
            className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </Field>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg italic">Type d'invité</h2>
        <div className="flex flex-wrap gap-2">
          {guestTypeOrder.map((t) => {
            const active = type === t;
            return (
              <button
                key={t}
                onClick={() => setType(t)}
                className={
                  "rounded-full border px-3 py-2 text-xs transition " +
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
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg italic">Étapes *</h2>
        <div className="space-y-2">
          {ceremonies.map((c) => {
            const checked = ids.includes(c.id);
            return (
              <label
                key={c.id}
                className={
                  "flex items-center gap-3 rounded-lg border p-3 text-sm transition " +
                  (checked ? "border-primary bg-secondary/40" : "border-border bg-card")
                }
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) =>
                    setIds((prev) =>
                      e.target.checked ? [...prev, c.id] : prev.filter((x) => x !== c.id),
                    )
                  }
                />
                <span className="flex-1">{c.name || c.label}</span>
              </label>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg italic">Accompagnants autorisés</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCompanions((n) => Math.max(0, n - 1))}
            className="grid size-11 place-items-center rounded-full border border-border text-lg hover:bg-secondary/40"
          >
            −
          </button>
          <span className="min-w-8 text-center font-serif text-3xl italic">{companions}</span>
          <button
            onClick={() => setCompanions((n) => Math.min(5, n + 1))}
            className="grid size-11 place-items-center rounded-full border border-border text-lg hover:bg-secondary/40"
          >
            +
          </button>
        </div>
      </section>

      {err ? <p className="text-sm text-destructive">{err}</p> : null}

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background p-4 sm:static sm:border-0 sm:p-0">
        <button
          onClick={() => {
            if (!name.trim()) return setErr("Le nom est obligatoire.");
            if (!phone || !isValidPhoneNumber(phone))
              return setErr("Numéro de téléphone invalide.");
            if (ids.length === 0) return setErr("Sélectionnez au moins une étape.");
            addGuest({
              name: name.trim(),
              phone,
              email: email.trim() || undefined,
              group: guestTypeMeta[type].short,
              guestType: type,
              allowedPlusOnes: companions,
              source: "manuel",
              ceremonyIds: ids,
            });
            navigate({ to: "/dashboard/guests" });
          }}
          className="mx-auto block w-full max-w-xl rounded-lg bg-primary px-4 py-3.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Enregistrer l'invité
        </button>
      </div>
    </div>
  );
}
