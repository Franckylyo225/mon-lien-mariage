import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { useWedding, slugify } from "@/lib/wedding-store";
import { checkSlugAvailability } from "@/lib/public-wedding.functions";
import { supabase } from "@/integrations/supabase/client";

const SIGNED_URL_EXPIRY = 60 * 60 * 24 * 365 * 10;

export const Route = createFileRoute("/dashboard/share")({
  head: () => ({
    meta: [
      { title: "Liens & Partages — MonMariage.ci" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SharePage,
});

function SharePage() {
  const { couple, weddingId, updateCouple } = useWedding();

  // Paywall ---------------------------------------------------------
  if (!couple.isPublished) {
    return (
      <div className="space-y-6 py-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-50">
            Verrouillé
          </p>
          <h1 className="mt-1 font-serif text-3xl italic">Liens & Partages</h1>
        </div>
        <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-primary/10 text-2xl">
            🔒
          </div>
          <p className="mt-5 font-serif text-xl italic">
            Publiez votre invitation pour débloquer le partage
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm opacity-70">
            Une fois publiée, vous obtiendrez un lien public, un QR code, le
            partage WhatsApp et surtout un aperçu personnalisable de votre
            lien de partage.
          </p>
          <Link
            to="/publish"
            className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-primary-foreground transition hover:opacity-90"
          >
            Publier mon invitation
          </Link>
        </div>
      </div>
    );
  }

  return <ShareUnlocked weddingId={weddingId} couple={couple} updateCouple={updateCouple} />;
}

type UpdateCouple = ReturnType<typeof useWedding>["updateCouple"];
type Couple = ReturnType<typeof useWedding>["couple"];

function ShareUnlocked({
  weddingId,
  couple,
  updateCouple,
}: {
  weddingId: string | null;
  couple: Couple;
  updateCouple: UpdateCouple;
}) {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://monmariage.ci";
  const host = useMemo(() => origin.replace(/^https?:\/\//, ""), [origin]);

  const publicUrl = `${origin}/e/${couple.slug ?? ""}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=8&data=${encodeURIComponent(
    publicUrl,
  )}`;

  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* noop */
    }
  };

  // ---- Aperçu de partage (OG) -------------------------------------
  const defaultShareTitle = `${couple.brideName} & ${couple.groomName} — Vous êtes convié·e`;
  const defaultShareDesc =
    couple.introMessage?.slice(0, 160) ||
    `Rejoignez-nous le ${couple.weddingDate || "jour J"}${couple.city ? " à " + couple.city : ""}.`;

  const [shareTitle, setShareTitle] = useState(couple.shareTitle ?? "");
  const [shareDesc, setShareDesc] = useState(couple.shareDescription ?? "");
  const [shareImage, setShareImage] = useState(
    couple.shareImageUrl ?? couple.heroImageUrl ?? "",
  );

  const effectiveTitle = shareTitle || defaultShareTitle;
  const effectiveDesc = shareDesc || defaultShareDesc;
  const effectiveImage = shareImage || couple.heroImageUrl || "";

  const saveShare = () => {
    void updateCouple({
      shareTitle: shareTitle || undefined,
      shareDescription: shareDesc || undefined,
      shareImageUrl: shareImage || undefined,
    });
  };

  // ---- Upload image de partage -----------------------------------
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageFile = async (file: File) => {
    if (!weddingId) return;
    setUploading(true);
    setUploadError(null);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1.2,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        fileType: "image/webp",
      });
      const path = `${weddingId}/share/${crypto.randomUUID()}.webp`;
      const { error: upErr } = await supabase.storage
        .from("wedding-photos")
        .upload(path, compressed, { contentType: "image/webp", upsert: false });
      if (upErr) throw upErr;
      const { data: signed, error: sErr } = await supabase.storage
        .from("wedding-photos")
        .createSignedUrl(path, SIGNED_URL_EXPIRY);
      if (sErr || !signed?.signedUrl) throw sErr ?? new Error("URL introuvable");
      setShareImage(signed.signedUrl);
      await updateCouple({ shareImageUrl: signed.signedUrl });
    } catch (err) {
      console.error("[share upload]", err);
      setUploadError(
        err instanceof Error ? err.message : "Erreur pendant l'envoi. Réessayez.",
      );
    } finally {
      setUploading(false);
    }
  };

  // ---- Adresse personnalisée --------------------------------------
  const [slugInput, setSlugInput] = useState(couple.slug ?? "");
  const [status, setStatus] = useState<"idle" | "checking" | "ok" | "taken" | "invalid">(
    "idle",
  );
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    const v = slugInput.trim().toLowerCase();
    if (!v || v === (couple.slug ?? "")) {
      setStatus("idle");
      setSuggestions([]);
      return;
    }
    if (!/^[a-z0-9][a-z0-9-]{1,59}$/.test(v)) {
      setStatus("invalid");
      return;
    }
    setStatus("checking");
    debounceRef.current = window.setTimeout(async () => {
      try {
        const res = await checkSlugAvailability({
          data: { slug: v, excludeId: weddingId ?? undefined },
        });
        if (res.available) {
          setStatus("ok");
          setSuggestions([]);
        } else {
          setStatus("taken");
          void suggestShorterSlugs(v, weddingId).then(setSuggestions);
        }
      } catch {
        setStatus("idle");
      }
    }, 400);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [slugInput, couple.slug, weddingId]);

  async function suggestShorterSlugs(
    base: string,
    excludeId: string | null,
  ): Promise<string[]> {
    const b = couple.brideName || "";
    const g = couple.groomName || "";
    const year = (couple.weddingDate ?? "").slice(2, 4);
    const bi = slugify(b).slice(0, 1);
    const gi = slugify(g).slice(0, 1);
    const bs = slugify(b);
    const gs = slugify(g);
    const candidates = Array.from(
      new Set([
        `${bi}${gi}`,
        `${bi}${gi}${year}`,
        `${bi}-${gi}`,
        `${bs}-${gi}`,
        `${gs}-${bi}`,
        `${bs}${year}`,
        `${gs}${year}`,
        `${base}-${Math.floor(Math.random() * 90 + 10)}`,
      ].filter((s) => /^[a-z0-9][a-z0-9-]{1,59}$/.test(s))),
    ).sort((a, b) => a.length - b.length);

    const results: string[] = [];
    for (const c of candidates) {
      if (results.length >= 4) break;
      try {
        const r = await checkSlugAvailability({
          data: { slug: c, excludeId: excludeId ?? undefined },
        });
        if (r.available) results.push(c);
      } catch {
        /* skip */
      }
    }
    return results;
  }

  const canSaveSlug = status === "ok" && slugInput !== couple.slug;
  const saveSlug = () => {
    if (!canSaveSlug) return;
    void updateCouple({ slug: slugInput });
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `${effectiveTitle}\n${publicUrl}`,
  )}`;

  return (
    <div className="space-y-8 pb-8">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-50">
          En ligne
        </p>
        <h1 className="mt-1 font-serif text-3xl italic">Liens & Partages</h1>
        <p className="mt-2 max-w-lg text-sm opacity-70">
          Personnalisez l'aperçu qui s'affiche quand vos invités reçoivent le
          lien, choisissez une adresse courte et partagez.
        </p>
      </div>

      {/* 1. Aperçu du lien de partage --------------------------------- */}
      <section className="rounded-3xl border border-border bg-card p-6">
        <div className="mb-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
            À la une
          </p>
          <h2 className="mt-1 font-serif text-xl italic">Aperçu du lien de partage</h2>
          <p className="mt-1 text-xs opacity-70">
            C'est ce que verront vos invités sur WhatsApp, iMessage, Facebook…
          </p>
        </div>

        {/* Carte OG preview */}
        <div className="overflow-hidden rounded-2xl border border-border bg-background">
          {effectiveImage ? (
            <div
              className="aspect-[1.91/1] w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${effectiveImage})` }}
            />
          ) : (
            <div className="grid aspect-[1.91/1] w-full place-items-center bg-gradient-to-br from-primary/20 to-primary/5 text-3xl opacity-60">
              💌
            </div>
          )}
          <div className="space-y-1 p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest opacity-50">
              {host}
            </p>
            <p className="line-clamp-2 text-sm font-semibold">{effectiveTitle}</p>
            <p className="line-clamp-2 text-xs opacity-70">{effectiveDesc}</p>
          </div>
        </div>

        {/* Editor */}
        <div className="mt-5 space-y-4">
          <Field
            label="Titre du partage"
            value={shareTitle}
            onChange={setShareTitle}
            placeholder={defaultShareTitle}
            hint={`${shareTitle.length}/90`}
          />
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest opacity-60">
              Description du partage
            </label>
            <textarea
              value={shareDesc}
              onChange={(e) => setShareDesc(e.target.value.slice(0, 200))}
              rows={3}
              placeholder={defaultShareDesc}
              className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
            />
            <p className="mt-1 text-[10px] opacity-50">{shareDesc.length}/200</p>
          </div>
          <Field
            label="Image du partage (URL)"
            value={shareImage}
            onChange={setShareImage}
            placeholder="https://…"
            hint="Idéalement 1200×630 px"
          />
          <button
            onClick={saveShare}
            className="w-full rounded-full bg-primary py-3 font-mono text-[10px] uppercase tracking-widest text-primary-foreground transition hover:opacity-90"
          >
            Enregistrer l'aperçu
          </button>
          <p className="text-[10px] italic opacity-60">
            Note : WhatsApp, Facebook &amp; iMessage gardent l'aperçu en cache.
            Les changements peuvent mettre quelques minutes à s'afficher.
          </p>
        </div>
      </section>

      {/* 2. Lien public ---------------------------------------------- */}
      <section className="rounded-3xl border border-border bg-card p-6">
        <h2 className="font-serif text-lg italic">Lien public</h2>
        <div className="mt-3 flex gap-2">
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
      </section>

      {/* 3. Adresse personnalisée ------------------------------------ */}
      <section className="rounded-3xl border border-border bg-card p-6">
        <h2 className="font-serif text-lg italic">Adresse personnalisée</h2>
        <p className="mt-1 text-xs opacity-70">
          Choisissez un lien court et facile à mémoriser.
        </p>

        <div className="mt-4 flex items-center rounded-full border border-input bg-background px-4 py-2 text-sm">
          <span className="opacity-50">{host}/e/</span>
          <input
            value={slugInput}
            onChange={(e) =>
              setSlugInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
            }
            className="min-w-0 flex-1 bg-transparent px-1 focus:outline-none"
          />
          <SlugBadge status={status} />
        </div>

        {suggestions.length > 0 ? (
          <div className="mt-3">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest opacity-60">
              Suggestions courtes disponibles
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setSlugInput(s)}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs transition hover:border-primary/50 hover:bg-primary/5"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <button
          onClick={saveSlug}
          disabled={!canSaveSlug}
          className="mt-4 w-full rounded-full bg-primary py-3 font-mono text-[10px] uppercase tracking-widest text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
        >
          Enregistrer l'adresse
        </button>
      </section>

      {/* 4. WhatsApp -------------------------------------------------- */}
      <section className="rounded-3xl border border-border bg-card p-6">
        <h2 className="font-serif text-lg italic">Partager sur WhatsApp</h2>
        <p className="mt-1 text-xs opacity-70">
          Envoi rapide à un contact ou un groupe, avec le titre personnalisé.
        </p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[#25D366] py-3 font-mono text-[10px] uppercase tracking-widest text-white transition hover:opacity-90"
        >
          Ouvrir WhatsApp
        </a>
      </section>

      {/* 5. QR Code -------------------------------------------------- */}
      <section className="rounded-3xl border border-border bg-card p-6 text-center">
        <h2 className="font-serif text-lg italic">QR Code</h2>
        <p className="mt-1 text-xs opacity-70">
          À imprimer sur vos faire-part physiques ou à projeter le jour J.
        </p>
        <img
          src={qrUrl}
          alt={`QR code pour ${publicUrl}`}
          className="mx-auto mt-4 size-48 rounded-lg ring-1 ring-border"
        />
        <a
          href={qrUrl}
          download={`qr-${couple.slug ?? "invitation"}.png`}
          className="mt-4 inline-block rounded-full border border-border px-5 py-2.5 font-mono text-[10px] uppercase tracking-widest transition hover:bg-accent/20"
        >
          Télécharger le QR
        </a>
      </section>
    </div>
  );
}

function SlugBadge({ status }: { status: "idle" | "checking" | "ok" | "taken" | "invalid" }) {
  if (status === "idle") return null;
  const map: Record<string, { text: string; cls: string }> = {
    checking: { text: "…", cls: "text-muted-foreground" },
    ok: { text: "✓ Disponible", cls: "text-emerald-600" },
    taken: { text: "✗ Déjà pris", cls: "text-destructive" },
    invalid: { text: "Format invalide", cls: "text-destructive" },
  };
  const { text, cls } = map[status];
  return <span className={`ml-2 shrink-0 font-mono text-[10px] uppercase ${cls}`}>{text}</span>;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest opacity-60">
        {label}
      </label>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-full border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
      />
      {hint ? <p className="mt-1 text-[10px] opacity-50">{hint}</p> : null}
    </div>
  );
}
