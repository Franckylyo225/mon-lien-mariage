import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useWedding, guestStats } from "@/lib/wedding-store";

export const Route = createFileRoute("/dashboard/landing")({
  component: LandingEditor,
});

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
          Modifiez le contenu de votre page publique, partagez le lien ou le QR
          code à vos invités.
        </p>
      </div>

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
                className="flex-1 rounded-full border border-input bg-background px-4 py-3 text-xs focus:outline-none"
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
                  setSlug(
                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                  )
                }
                className="flex-1 bg-transparent px-1 focus:outline-none"
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
          <img
            src={qrUrl}
            alt={`QR code pour ${publicUrl}`}
            className="size-40 rounded-lg"
          />
          <p className="mt-2 font-mono text-[9px] uppercase tracking-widest opacity-60">
            Scannez-moi
          </p>
        </div>
      </section>

      {/* Live stats mini */}
      <section className="grid grid-cols-3 gap-3">
        <MiniStat label="Confirmés" value={stats.confirmés} tone="primary" />
        <MiniStat label="En attente" value={stats.en_attente} />
        <MiniStat label="Cérémonies publiées" value={publishedCount} />
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
        <div className="mt-4">
          <Field
            label="URL photo héro (optionnel)"
            value={couple.heroImageUrl ?? ""}
            onChange={(v) => updateCouple({ heroImageUrl: v })}
            placeholder="https://…"
          />
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
      <p className="font-mono text-[9px] uppercase tracking-widest opacity-50">
        {label}
      </p>
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
