import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useWedding, guestStats, type TemplateId, type EventType } from "@/lib/wedding-store";
import { templateMeta, templateOrder, eventTypeMeta, eventTypeOrder } from "@/lib/ceremony-meta";


export const Route = createFileRoute("/dashboard/landing")({
  head: () => ({
    meta: [
      { title: "Ma page d'invitation — MonMariage.ci" },
      {
        name: "description",
        content:
          "Personnalisez le modèle, les prénoms, la date et l'accent de votre page d'invitation, puis partagez le lien ou le QR code.",
      },
    ],
  }),
  component: LandingEditor,
});

const accentChoices = ["#d97757", "#c17c74", "#8b6f5e", "#4a6741", "#c9a84c", "#4c0519"];

function LandingEditor() {
  const { couple, updateCouple, ceremonies, guests } = useWedding();
  const [slug, setSlug] = useState(
    (couple.brideName + "-et-" + couple.groomName)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, ""),
  );
  const [copied, setCopied] = useState(false);

  const publicUrl = useMemo(() => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "https://monmariage.ci";
    return `${origin}/invitation?c=${slug}`;
  }, [slug]);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=8&data=${encodeURIComponent(
    publicUrl,
  )}`;

  const stats = guestStats(guests);
  const publishedCount = ceremonies.filter((c) => c.status === "publiée").length;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-50">
          Personnalisation
        </p>
        <h1 className="mt-1 font-serif text-3xl italic">Ma page d'invitation</h1>
        <p className="mt-2 max-w-lg text-sm opacity-70">
          Choisissez un modèle, personnalisez le contenu, puis partagez le lien
          ou le QR code à vos invités.
        </p>
      </div>

      {/* Template picker */}
      <section className="rounded-3xl border border-border bg-card p-6">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="font-serif text-lg italic">Modèle d'invitation</h2>
          <a
            href="/invitation"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary hover:underline"
          >
            Voir en grand ↗
          </a>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {templateOrder.map((t) => {
            const meta = templateMeta[t];
            const active = couple.templateId === t;
            return (
              <button
                key={t}
                onClick={() => updateCouple({ templateId: t as TemplateId })}
                className={
                  "group flex flex-col items-stretch overflow-hidden rounded-2xl border text-left transition " +
                  (active
                    ? "border-primary shadow-md shadow-primary/20"
                    : "border-border hover:border-primary/40")
                }
              >
                <div
                  className="aspect-[3/4] w-full"
                  style={{
                    background: `linear-gradient(160deg, ${meta.swatch[0]}, ${meta.swatch[1]} 40%, ${meta.swatch[2]} 75%, ${meta.swatch[3]})`,
                  }}
                />
                <div className="p-3">
                  <p className="text-sm font-medium">{meta.label}</p>
                  <p className="font-mono text-[9px] uppercase tracking-widest opacity-60">
                    {meta.tagline}
                  </p>
                  {active ? (
                    <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-primary">
                      ✓ Sélectionné
                    </p>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Public link + QR */}
      <section className="grid gap-4 rounded-3xl border border-border bg-card p-6 md:grid-cols-[1fr_auto]">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest opacity-60">
              Lien public
            </label>
            <div className="flex gap-2">
              <input
                readOnly
                value={publicUrl}
                className="min-w-0 flex-1 rounded-full border border-input bg-background px-4 py-3 text-xs focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="shrink-0 rounded-full bg-foreground px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-background transition hover:opacity-90"
              >
                {copied ? "Copié ✓" : "Copier"}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest opacity-60">
              Adresse personnalisée
            </label>
            <div className="flex items-center rounded-full border border-input bg-background px-4 py-2 text-sm">
              <span className="opacity-50">monmariage.ci/</span>
              <input
                value={slug}
                onChange={(e) =>
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                }
                className="min-w-0 flex-1 bg-transparent px-1 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Vous êtes convié·e au mariage de ${couple.brideName} & ${couple.groomName} — voir l'invitation : ${publicUrl}`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-primary px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-primary-foreground transition hover:opacity-90"
            >
              Partager WhatsApp
            </a>
            <a
              href={qrUrl}
              download={`qr-${slug}.png`}
              className="rounded-full border border-border px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest transition hover:bg-accent/20"
            >
              Télécharger le QR
            </a>
            <a
              href="/invitation"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest transition hover:bg-accent/20"
            >
              Aperçu ↗
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl bg-background p-4 ring-1 ring-border">
          <img src={qrUrl} alt={`QR code pour ${publicUrl}`} className="size-40 rounded-lg" />
          <p className="mt-2 font-mono text-[9px] uppercase tracking-widest opacity-60">
            Scannez-moi
          </p>
        </div>
      </section>

      {/* Live stats mini */}
      <section className="grid grid-cols-3 gap-3">
        <MiniStat label="Confirmés" value={stats.confirmés} tone="primary" />
        <MiniStat label="En attente" value={stats.en_attente} />
        <MiniStat label="Étapes publiées" value={publishedCount} />
      </section>

      {/* Content editor */}
      <section className="rounded-3xl border border-border bg-card p-6">
        <h2 className="font-serif text-lg italic">Contenu de la page</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field
            label="Prénom mariée"
            value={couple.brideName}
            onChange={(v) => updateCouple({ brideName: v })}
          />
          <Field
            label="Prénom marié"
            value={couple.groomName}
            onChange={(v) => updateCouple({ groomName: v })}
          />
          <Field
            label="Date du mariage"
            type="date"
            value={couple.weddingDate}
            onChange={(v) => updateCouple({ weddingDate: v })}
          />
          <Field
            label="Ville"
            value={couple.city}
            onChange={(v) => updateCouple({ city: v })}
          />
          <Field
            label="Hashtag"
            value={couple.hashtag ?? ""}
            placeholder="#AichaEtStephane2027"
            onChange={(v) => updateCouple({ hashtag: v })}
          />
          <Field
            label="URL photo de couverture"
            value={couple.heroImageUrl ?? ""}
            onChange={(v) => updateCouple({ heroImageUrl: v })}
            placeholder="https://…"
          />
        </div>
        <div className="mt-4">
          <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest opacity-60">
            Mot pour vos invités
          </label>
          <textarea
            value={couple.introMessage}
            onChange={(e) => updateCouple({ introMessage: e.target.value })}
            rows={4}
            className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest opacity-60">
            Contact pour plus d'informations
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field
              label="Nom de la personne"
              value={couple.contactName ?? ""}
              placeholder="Ex. Mariam Diabaté"
              onChange={(v) => updateCouple({ contactName: v })}
            />
            <Field
              label="Téléphone"
              value={couple.contactPhone ?? ""}
              placeholder="+225 07 08 09 10 11"
              onChange={(v) => updateCouple({ contactPhone: v })}
            />
            <Field
              label="Email"
              value={couple.contactEmail ?? ""}
              placeholder="contact@example.com"
              onChange={(v) => updateCouple({ contactEmail: v })}
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest opacity-60">
            Note dress code
          </label>
          <textarea
            value={couple.dressCodeNote ?? ""}
            onChange={(e) => updateCouple({ dressCodeNote: e.target.value })}
            rows={2}
            placeholder="Ex. Élégance chic — accents dorés bienvenus."
            className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3">
          <Field
            label="Titre de l'info personnalisée"
            value={couple.customInfoTitle ?? ""}
            placeholder="Ex. Bon à savoir"
            onChange={(v) => updateCouple({ customInfoTitle: v })}
          />
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest opacity-60">
              Contenu
            </label>
            <textarea
              value={couple.customInfoBody ?? ""}
              onChange={(e) => updateCouple({ customInfoBody: e.target.value })}
              rows={3}
              placeholder="Ex. Une navette est prévue depuis l'hôtel Ivoire à partir de 18h30."
              className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest opacity-60">
            Couleur d'accent
          </p>
          <div className="flex flex-wrap gap-2">
            {accentChoices.map((c) => (
              <button
                key={c}
                onClick={() => updateCouple({ accent: c })}
                className={
                  "size-9 rounded-full transition " +
                  ((couple.accent ?? "") === c
                    ? "ring-2 ring-offset-2 ring-foreground"
                    : "")
                }
                style={{ backgroundColor: c }}
                aria-label={c}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest opacity-60">
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-full border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
      />
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "primary";
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="font-mono text-[9px] uppercase tracking-widest opacity-50">{label}</p>
      <p
        className={
          "mt-1 font-mono text-2xl " +
          (tone === "primary" ? "text-primary" : "text-foreground")
        }
      >
        {value}
      </p>
    </div>
  );
}
