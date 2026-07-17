import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useWedding, type CeremonyType } from "@/lib/wedding-store";
import { ceremonyMeta } from "@/lib/ceremony-meta";
import { Field } from "./signup";

export const Route = createFileRoute("/dashboard/ceremonies/$id")({
  head: () => ({ meta: [{ title: "Éditer une étape — MonInvit.com" }] }),
  component: EditCeremony,
});

const typeOptions: CeremonyType[] = [
  "dot", "civil", "religieux", "traditionnel", "diner", "anniversaire", "fiancailles", "autre",
];

function EditCeremony() {
  const { id } = Route.useParams();
  const { ceremonies, updateCeremony, removeCeremony, couple } = useWedding();
  const navigate = useNavigate();
  const c = ceremonies.find((x) => x.id === id);

  const [form, setForm] = useState(() => c ?? null);

  if (!c || !form) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Étape introuvable.</p>
        <Link to="/dashboard/ceremonies" className="mt-4 inline-block text-primary underline">
          Retour à la liste
        </Link>
      </div>
    );
  }

  const patch = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  return (
    <div className="space-y-6 pb-28">
      <Link
        to="/dashboard/ceremonies"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Mes étapes
      </Link>

      <h1 className="font-serif text-3xl italic">Éditer la étape</h1>

      <section className="space-y-4">
        <Field label="Type">
          <select
            value={form.type}
            onChange={(e) => patch("type", e.target.value as CeremonyType)}
            className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm"
          >
            {typeOptions.map((t) => (
              <option key={t} value={t}>{ceremonyMeta[t].label}</option>
            ))}
          </select>
        </Field>
        <Field label="Nom affiché">
          <input
            value={form.name}
            onChange={(e) => patch("name", e.target.value)}
            placeholder="Ex. Étape du voile"
            className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm"
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Date">
            <input
              type="date"
              value={form.date}
              onChange={(e) => patch("date", e.target.value)}
              className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm"
            />
          </Field>
          <Field label="Heure de début">
            <input
              type="time"
              value={form.timeStart}
              onChange={(e) => patch("timeStart", e.target.value)}
              className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm"
            />
          </Field>
          <Field label="Heure de fin">
            <input
              type="time"
              value={form.timeEnd ?? ""}
              onChange={(e) => patch("timeEnd", e.target.value)}
              className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm"
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-lg italic">Lieu</h2>
        <Field label="Nom du lieu">
          <input
            value={form.venue}
            onChange={(e) => patch("venue", e.target.value)}
            placeholder="Ex. Salle des fêtes Le Pacha"
            className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm"
          />
        </Field>
        <Field label="Adresse">
          <textarea
            value={form.notes ?? ""}
            onChange={(e) => patch("notes", e.target.value)}
            placeholder="Quartier, rue, point de repère…"
            rows={2}
            className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm"
          />
        </Field>
        <Field label="Lien Google Maps (facultatif)">
          <input
            type="url"
            value={form.mapsUrl ?? ""}
            onChange={(e) => patch("mapsUrl", e.target.value)}
            placeholder="https://maps.google.com/…"
            className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm"
          />
        </Field>
      </section>


      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background p-4 sm:static sm:border-0 sm:p-0">
        <div className="mx-auto flex max-w-xl gap-3">
          <button
            onClick={() => {
              updateCeremony(c.id, form);
              navigate({ to: "/dashboard/ceremonies" });
            }}
            className="flex-1 rounded-lg bg-primary py-3.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Enregistrer
          </button>
        </div>
        <button
          disabled={couple.isLocked}
          onClick={() => {
            if (confirm("Supprimer cette étape ?")) {
              removeCeremony(c.id);
              navigate({ to: "/dashboard/ceremonies" });
            }
          }}
          className="mx-auto mt-3 block text-xs text-destructive hover:underline disabled:opacity-40"
          title={couple.isLocked ? "Impossible après publication" : undefined}
        >
          Supprimer cette étape
        </button>
      </div>
    </div>
  );
}
