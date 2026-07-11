import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useWedding } from "@/lib/wedding-store";

export const Route = createFileRoute("/publish/success")({
  head: () => ({
    meta: [
      { title: "Publication réussie — MonInvit.com" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SuccessPage,
});

function SuccessPage() {
  const { couple } = useWedding();
  const [copied, setCopied] = useState(false);

  const publicUrl = useMemo(() => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "https://moninvit.com";
    return `${origin}/e/${couple.slug ?? ""}`;
  }, [couple.slug]);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=8&data=${encodeURIComponent(publicUrl)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

  if (!couple.isPublished) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <p className="font-serif text-2xl italic">Aucune publication en cours.</p>
        <Link
          to="/publish"
          className="mt-6 inline-block rounded-full bg-primary px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-primary-foreground"
        >
          Aller à la publication
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <main className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-8">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-primary/15 text-2xl">
          🎉
        </div>
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
          C'est publié
        </p>
        <h1 className="mt-3 font-serif text-4xl italic">
          {couple.brideName} & {couple.groomName}
        </h1>
        <p className="mt-3 text-sm opacity-70">
          Votre page est en ligne. Partagez le lien ou le QR à vos invités.
        </p>

        <section className="mt-10 rounded-3xl border border-border bg-card p-6 text-left">
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
              onClick={copy}
              className="shrink-0 rounded-full bg-foreground px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-background transition hover:opacity-90"
            >
              {copied ? "Copié ✓" : "Copier"}
            </button>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3">
            <img src={qrUrl} alt={`QR code pour ${publicUrl}`} className="size-44 rounded-lg ring-1 ring-border" />
            <a
              href={qrUrl}
              download={`qr-${couple.slug}.png`}
              className="font-mono text-[10px] uppercase tracking-widest text-primary hover:underline"
            >
              Télécharger le QR
            </a>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Vous êtes convié·e au mariage de ${couple.brideName} & ${couple.groomName} — voir l'invitation : ${publicUrl}`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-primary px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-primary-foreground transition hover:opacity-90"
            >
              Partager sur WhatsApp
            </a>
            <Link
              to="/e/$slug"
              params={{ slug: couple.slug ?? "" }}
              className="rounded-full border border-border px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest transition hover:bg-accent/20"
            >
              Ouvrir la page publique
            </Link>
          </div>
        </section>

        <div className="mt-8 rounded-2xl border border-dashed border-border bg-secondary/30 p-4 text-left text-xs opacity-70">
          <p className="font-mono text-[10px] uppercase tracking-widest opacity-70">
            Verrouillé
          </p>
          <p className="mt-1">
            Les prénoms et la formule sont désormais verrouillés. Vous pouvez
            toujours ajuster les étapes et gérer vos invités depuis le
            tableau de bord.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="mt-8 inline-block font-mono text-[10px] uppercase tracking-widest opacity-60 hover:opacity-100"
        >
          ← Retour au tableau de bord
        </Link>
      </main>
    </div>
  );
}
