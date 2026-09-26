import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import imageCompression from "browser-image-compression";
import { useWedding, slugify } from "@/lib/wedding-store";
import { checkSlugAvailability } from "@/lib/public-wedding.functions";
import { supabase } from "@/integrations/supabase/client";
import {
  AtSign,
  Check,
  ChevronDown,
  Copy,
  Eye,
  Lock,
  MessageCircle,
  QrCode,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { IconBadge, PageHeader, StatusPill } from "@/components/dashboard/premium";

const SIGNED_URL_EXPIRY = 60 * 60 * 24 * 365 * 10;

export const Route = createFileRoute("/dashboard/share")({
  head: () => ({
    meta: [{ title: "Liens & Partages — MonInvit.com" }, { name: "robots", content: "noindex" }],
  }),
  component: SharePage,
});

function SharePage() {
  const { couple, weddingId, updateCouple } = useWedding();

  // Paywall ---------------------------------------------------------
  if (!couple.isPublished) {
    return (
      <div className="space-y-6 pt-2">
        <PageHeader
          kicker="Verrouillé"
          title="Liens & Partages"
          subtitle="Un lien public, un QR code et le partage WhatsApp, une fois votre page publiée."
        />
        <div className="rounded-2xl border border-border bg-card px-6 py-12 text-center">
          <IconBadge className="mx-auto size-14">
            <Lock className="size-6" strokeWidth={1.75} />
          </IconBadge>
          <p className="mt-5 font-produit text-xl font-bold">
            Publiez votre invitation pour débloquer le partage
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Une fois publiée, vous obtiendrez un lien public, un QR code, le partage WhatsApp et
            surtout un aperçu personnalisable de votre lien de partage.
          </p>
          <Link
            to="/publish"
            className="btn-accent-gradient mt-6 inline-block rounded-xl px-6 py-3 text-sm font-semibold"
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
  const origin = typeof window !== "undefined" ? window.location.origin : "https://moninvit.com";
  const host = useMemo(() => origin.replace(/^https?:\/\//, ""), [origin]);

  const publicUrl = `${origin}/e/${couple.slug ?? ""}`;
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    void import("qrcode").then(({ default: QRCode }) =>
      QRCode.toDataURL(publicUrl, { width: 640, margin: 2 }).then((url) => {
        if (!cancelled) setQrUrl(url);
      }),
    );
    return () => {
      cancelled = true;
    };
  }, [publicUrl]);

  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success("Lien copié.");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Copie impossible : sélectionnez le lien et copiez-le à la main.");
    }
  };

  // ---- Aperçu de partage (OG) -------------------------------------
  const defaultShareTitle = `${couple.brideName} & ${couple.groomName} — Vous êtes convié·e`;
  const defaultShareDesc =
    couple.introMessage?.slice(0, 160) ||
    `Rejoignez-nous le ${couple.weddingDate || "jour J"}${couple.city ? " à " + couple.city : ""}.`;

  const [shareTitle, setShareTitle] = useState(couple.shareTitle ?? "");
  const [shareDesc, setShareDesc] = useState(couple.shareDescription ?? "");
  const [shareImage, setShareImage] = useState(couple.shareImageUrl ?? couple.heroImageUrl ?? "");

  const effectiveTitle = shareTitle || defaultShareTitle;
  const effectiveDesc = shareDesc || defaultShareDesc;
  const effectiveImage = shareImage || couple.heroImageUrl || "";

  const saveShare = () => {
    void updateCouple({
      shareTitle: shareTitle || undefined,
      shareDescription: shareDesc || undefined,
      shareImageUrl: shareImage || undefined,
    });
    toast.success("Aperçu enregistré.");
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
      setUploadError(err instanceof Error ? err.message : "Erreur pendant l'envoi. Réessayez.");
    } finally {
      setUploading(false);
    }
  };

  // ---- Adresse personnalisée --------------------------------------
  const [slugInput, setSlugInput] = useState(couple.slug ?? "");
  const [status, setStatus] = useState<"idle" | "checking" | "ok" | "taken" | "invalid">("idle");
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

  async function suggestShorterSlugs(base: string, excludeId: string | null): Promise<string[]> {
    const b = couple.brideName || "";
    const g = couple.groomName || "";
    const year = (couple.weddingDate ?? "").slice(2, 4);
    const bi = slugify(b).slice(0, 1);
    const gi = slugify(g).slice(0, 1);
    const bs = slugify(b);
    const gs = slugify(g);
    const candidates = Array.from(
      new Set(
        [
          `${bi}${gi}`,
          `${bi}${gi}${year}`,
          `${bi}-${gi}`,
          `${bs}-${gi}`,
          `${gs}-${bi}`,
          `${bs}${year}`,
          `${gs}${year}`,
          `${base}-${Math.floor(Math.random() * 90 + 10)}`,
        ].filter((s) => /^[a-z0-9][a-z0-9-]{1,59}$/.test(s)),
      ),
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
  const [confirmSlug, setConfirmSlug] = useState(false);
  const saveSlug = () => {
    void updateCouple({ slug: slugInput });
    toast.success("Adresse mise à jour.");
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `${effectiveTitle}\n${publicUrl}`,
  )}`;

  const [open, setOpen] = useState<"preview" | "slug" | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const toggle = (id: "preview" | "slug") => setOpen((o) => (o === id ? null : id));
  const previewCustomized = !!(
    couple.shareTitle ||
    couple.shareDescription ||
    couple.shareImageUrl
  );

  const share = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: effectiveTitle, url: publicUrl });
      } catch {
        // dismissed by the user
      }
    } else {
      await handleCopy();
    }
  };

  return (
    <div className="space-y-6 pb-8 pt-2">
      <PageHeader
        title="Liens & Partages"
        subtitle="Partagez votre invitation en un tap. Personnalisez l'aperçu et l'adresse si vous le souhaitez."
      />

      {/* 1. Votre lien ---------------------------------------------- */}
      <section className="rounded-2xl border border-border bg-gradient-to-b from-secondary/50 to-card p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] font-semibold">Votre lien</p>
          <StatusPill ready readyLabel="En ligne" />
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-input bg-background py-1.5 pl-4 pr-1.5">
          <span className="min-w-0 flex-1 truncate text-[13px]">
            <span className="text-muted-foreground">{host}/e/</span>
            <span className="font-semibold">{couple.slug ?? ""}</span>
          </span>
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="btn-accent-gradient inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-semibold"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "Copié" : "Copier"}
          </button>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <ActionTile
            icon={<Share2 className="size-5" />}
            label="Partager"
            onClick={() => void share()}
          />
          <ActionTile
            icon={<MessageCircle className="size-5 text-whatsapp" />}
            label="WhatsApp"
            href={whatsappUrl}
          />
          <ActionTile
            icon={<QrCode className="size-5" />}
            label="QR code"
            onClick={() => setQrOpen(true)}
          />
        </div>
      </section>

      {/* 2. Personnaliser -------------------------------------------- */}
      <section className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        <SectionRow
          icon={<Eye className="size-5" />}
          title="Aperçu du lien"
          description="Titre, description et image vus sur WhatsApp, iMessage, Facebook…"
          pill={
            <StatusPill
              ready={previewCustomized}
              todoLabel="Par défaut"
              readyLabel="Personnalisé"
            />
          }
          open={open === "preview"}
          onToggle={() => toggle("preview")}
        >
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
              <p className="font-mono text-[10px] uppercase tracking-widest opacity-50">{host}</p>
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
              <label className="mb-1.5 block text-[12px] font-medium text-muted-foreground">
                Description du partage
              </label>
              <textarea
                value={shareDesc}
                onChange={(e) => setShareDesc(e.target.value.slice(0, 200))}
                rows={3}
                placeholder={defaultShareDesc}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
              />
              <p className="mt-1 text-[10px] opacity-50">{shareDesc.length}/200</p>
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-muted-foreground">
                Image du partage
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleImageFile(f);
                  e.target.value = "";
                }}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="rounded-xl border border-border bg-background px-4 py-2.5 text-xs transition hover:border-primary/50 hover:bg-primary/5 disabled:opacity-40"
                >
                  {uploading
                    ? "Envoi en cours…"
                    : shareImage
                      ? "Changer l'image"
                      : "Choisir une image"}
                </button>
                {shareImage ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShareImage("");
                      void updateCouple({ shareImageUrl: undefined });
                    }}
                    disabled={uploading}
                    className="rounded-xl border border-border bg-background px-4 py-2.5 text-xs opacity-70 transition hover:opacity-100 disabled:opacity-30"
                  >
                    Retirer
                  </button>
                ) : null}
              </div>
              <p className="mt-1 text-[10px] opacity-50">
                Idéalement 1200×630 px. Sinon, l'image de couverture est utilisée.
              </p>
              {uploadError ? (
                <p className="mt-1 text-[10px] text-destructive">{uploadError}</p>
              ) : null}
            </div>
            <button
              onClick={saveShare}
              className="btn-accent-gradient w-full rounded-xl py-3 text-sm font-semibold"
            >
              Enregistrer l'aperçu
            </button>
            <p className="text-[10px] italic opacity-60">
              Note : WhatsApp, Facebook &amp; iMessage gardent l'aperçu en cache. Les changements
              peuvent mettre quelques minutes à s'afficher.
            </p>
          </div>
        </SectionRow>
        <SectionRow
          icon={<AtSign className="size-5" />}
          title="Adresse personnalisée"
          description={`${host}/e/${couple.slug ?? ""}`}
          open={open === "slug"}
          onToggle={() => toggle("slug")}
        >
          <div className="flex items-center rounded-xl border border-input bg-background px-4 py-2 text-sm">
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
              <p className="mb-2 text-[12px] font-medium text-muted-foreground">
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
            onClick={() => setConfirmSlug(true)}
            disabled={!canSaveSlug}
            className="btn-accent-gradient mt-4 w-full rounded-xl py-3 text-sm font-semibold"
          >
            Enregistrer l'adresse
          </button>
        </SectionRow>
      </section>

      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="max-w-xs text-center">
          <DialogHeader>
            <DialogTitle>QR code</DialogTitle>
            <DialogDescription>
              À imprimer sur vos faire-part physiques ou à projeter le jour J.
            </DialogDescription>
          </DialogHeader>
          {qrUrl ? (
            <img
              src={qrUrl}
              alt={`QR code pour ${publicUrl}`}
              className="mx-auto size-56 rounded-lg ring-1 ring-border"
            />
          ) : (
            <Skeleton className="mx-auto size-56 rounded-lg" />
          )}
          {qrUrl ? (
            <a
              href={qrUrl}
              download={`qr-${couple.slug ?? "invitation"}.png`}
              className="btn-accent-gradient mx-auto inline-block rounded-xl px-5 py-2.5 text-sm font-semibold"
            >
              Télécharger le QR
            </a>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmSlug}
        onOpenChange={setConfirmSlug}
        title="Changer l'adresse de votre page ?"
        description="Les liens et QR codes déjà envoyés à l'ancienne adresse ne fonctionneront plus. Vos invités devront recevoir le nouveau lien."
        confirmLabel="Changer l'adresse"
        cancelLabel="Garder l'ancienne"
        onConfirm={saveSlug}
      />
    </div>
  );
}

function ActionTile({
  icon,
  label,
  onClick,
  href,
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  href?: string;
}) {
  const cls =
    "flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card py-3 text-[12px] font-medium transition hover:bg-secondary/40 active:scale-[0.98]";
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {icon}
      {label}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={cls}>
      {icon}
      {label}
    </button>
  );
}

function SectionRow({
  icon,
  title,
  description,
  pill,
  open,
  onToggle,
  children,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  pill?: ReactNode;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-secondary/30"
      >
        <IconBadge>{icon}</IconBadge>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-semibold">{title}</span>
          {description ? (
            <span className="mt-0.5 block truncate text-[12px] text-muted-foreground">
              {description}
            </span>
          ) : null}
        </span>
        {pill}
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <div className="space-y-4 border-t border-border bg-background/40 p-4">{children}</div>
      ) : null}
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
      <label className="mb-1.5 block text-[12px] font-medium text-muted-foreground">{label}</label>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
      />
      {hint ? <p className="mt-1 text-[10px] opacity-50">{hint}</p> : null}
    </div>
  );
}
