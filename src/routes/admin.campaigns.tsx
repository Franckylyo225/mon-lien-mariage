import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Eye, LoaderCircle, Megaphone, Send, Users } from "lucide-react";
import {
  getCampaignAudience,
  listCampaignHistory,
  previewCampaign,
  sendCampaignBatch,
  sendCampaignTest,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/campaigns")({
  head: () => ({ meta: [{ title: "Campagnes email — Administration" }] }),
  component: AdminCampaigns,
});

/* ------------------------------------------------------------------------- */

type Segment = "tous" | "sans_publication" | "avec_publication" | "sans_evenement";

const SEGMENTS: { id: Segment; label: string; hint: string }[] = [
  { id: "tous", label: "Tous les comptes", hint: "Tout le monde, publication ou non." },
  {
    id: "sans_publication",
    label: "Comptes sans publication",
    hint: "Ont un événement mais n'ont pas encore payé la publication.",
  },
  {
    id: "avec_publication",
    label: "Comptes ayant publié",
    hint: "Ont déjà au moins une invitation en ligne.",
  },
  {
    id: "sans_evenement",
    label: "Comptes sans aucun événement",
    hint: "Inscrits, mais n'ont rien commencé.",
  },
];

interface Draft {
  key: string;
  segment: Segment;
  subject: string;
  eyebrow: string;
  bodyHtml: string;
  ctaLabel: string;
  ctaUrl: string;
  testEmail: string;
}

/**
 * Le brouillon de départ est la promotion de novembre, prête à partir : le
 * premier usage de cet écran, autant qu'il n'oblige pas à tout retaper.
 * {first_name} et {cta} suivent la convention du moteur d'emails.
 */
const DEFAULT_DRAFT: Draft = {
  key: "promo-novembre-2026",
  segment: "sans_publication",
  subject: "-40 % sur votre publication, tout le mois de novembre",
  eyebrow: "Offre de novembre",
  bodyHtml: `<h1>-40 % sur la publication de votre invitation</h1>

<p>Bonjour {first_name},</p>

<p>Créer votre page d'invitation, l'ajuster, la montrer à vos proches : tout cela est gratuit et le reste. Ce qui se paie, c'est la publication — le moment où votre page reçoit son adresse et où vos invités peuvent confirmer leur présence.</p>

<p>Pendant tout le mois de novembre, cette publication est à <strong>-40 %</strong>.</p>

<div class="box">
  <p style="margin:0 0 8px">Publication de votre invitation</p>
  <p style="margin:0;font-size:22px;line-height:1.3">
    <span style="text-decoration:line-through;color:#6B6B6B">24 900 F</span>
    &nbsp;&nbsp;
    <strong style="color:#E82050">14 940 F</strong>
  </p>
  <p class="note" style="margin:12px 0 0">
    Code <strong style="font-family:'Courier New',Courier,monospace;letter-spacing:.08em">MONINVIT40</strong>,
    à saisir au moment de publier. Valable jusqu'au 30 novembre inclus.
  </p>
</div>

{cta}

<p>Votre page reste modifiable après la publication : les textes, les photos, le programme, la liste d'invités. Publier ne ferme rien.</p>

<p>Une question ? Répondez simplement à cet email, nous lisons tout.</p>

<p style="margin-bottom:26px">— L'équipe MonInvit.com</p>

<p class="note" style="margin-bottom:22px">
  Vous ne souhaitez plus recevoir nos actualités ?
  <a href="mailto:contact@moninvit.com?subject=D%C3%A9sabonnement">Écrivez-nous</a>
  et nous vous retirons de la liste.
</p>`,
  ctaLabel: "Publier mon invitation",
  // Le tableau de bord, pas /publish : cette page n'a pas de garde de session.
  ctaUrl: "https://moninvit.com/dashboard",
  testEmail: "",
};

const DRAFT_STORAGE_KEY = "moninvit.admin.campaign-draft";

type Audience = {
  eligible: number;
  alreadySent: number;
  pending: number;
  excluded: {
    sansEmail: number;
    suppressionDemandee: number;
    desabonnes: number;
    doublons: number;
    horsSegment: number;
  };
  sample: string[];
};

const fieldClass =
  "w-full rounded-lg border border-border/60 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40";

function AdminCampaigns() {
  const audienceFn = useServerFn(getCampaignAudience);
  const previewFn = useServerFn(previewCampaign);
  const testFn = useServerFn(sendCampaignTest);
  const batchFn = useServerFn(sendCampaignBatch);
  const historyFn = useServerFn(listCampaignHistory);

  const [draft, setDraft] = useState<Draft>(DEFAULT_DRAFT);
  const [audience, setAudience] = useState<Audience | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [history, setHistory] = useState<
    { key: string; sent: number; failed: number; last: string }[]
  >([]);
  const [busy, setBusy] = useState<null | "audience" | "preview" | "test" | "send">(null);
  const [progress, setProgress] = useState<{
    sent: number;
    failed: number;
    remaining: number;
  } | null>(null);
  /** Permet d'arrêter une campagne en cours entre deux lots. */
  const stopRef = useRef(false);

  // Le brouillon n'est pas persisté en base : il survit au rechargement de
  // l'onglet, pas à un changement de machine. Dit tel quel sous le formulaire.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) setDraft({ ...DEFAULT_DRAFT, ...(JSON.parse(raw) as Partial<Draft>) });
    } catch {
      // Stockage indisponible : on reste sur le brouillon par défaut.
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Sans persistance, l'écran fonctionne quand même.
    }
  }, [draft]);

  const refreshHistory = async () => {
    try {
      setHistory((await historyFn()) as typeof history);
    } catch {
      // L'historique est un confort : son échec ne bloque pas l'envoi.
    }
  };

  useEffect(() => {
    void refreshHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft({ ...draft, [k]: v });

  const contentOf = () => ({
    key: draft.key,
    subject: draft.subject,
    eyebrow: draft.eyebrow,
    bodyHtml: draft.bodyHtml,
    ctaLabel: draft.ctaLabel,
    ctaUrl: draft.ctaUrl,
  });

  const checkAudience = async () => {
    setBusy("audience");
    try {
      const res = (await audienceFn({
        data: { segment: draft.segment, key: draft.key },
      })) as Audience;
      setAudience(res);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Audience indisponible.");
    } finally {
      setBusy(null);
    }
  };

  const doPreview = async () => {
    setBusy("preview");
    try {
      const res = (await previewFn({ data: { ...contentOf(), firstName: "Aïcha" } })) as {
        html: string;
      };
      setPreview(res.html);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Aperçu impossible.");
    } finally {
      setBusy(null);
    }
  };

  const doTest = async () => {
    setBusy("test");
    try {
      const res = (await testFn({
        data: { ...contentOf(), email: draft.testEmail || undefined },
      })) as { recipient: string };
      toast.success(`Test envoyé à ${res.recipient}.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Envoi de test impossible.");
    } finally {
      setBusy(null);
    }
  };

  const doSend = async () => {
    if (!audience) {
      toast.error("Vérifiez l'audience avant d'envoyer.");
      return;
    }
    if (audience.pending === 0) {
      toast.info("Rien à envoyer : tous les destinataires ont déjà reçu cette campagne.");
      return;
    }
    const ok = confirm(
      `Envoyer « ${draft.subject} » à ${audience.pending} destinataire${
        audience.pending > 1 ? "s" : ""
      } ?\n\nCette action est irréversible : un email parti ne se rappelle pas.`,
    );
    if (!ok) return;

    stopRef.current = false;
    setBusy("send");
    let sent = 0;
    let failed = 0;
    setProgress({ sent: 0, failed: 0, remaining: audience.pending });

    try {
      // Boucle de lots : chaque requête reste courte, et le filtre par le
      // journal d'envoi fait office de curseur, donc une interruption reprend
      // au bon endroit sans renvoyer personne.
      for (;;) {
        if (stopRef.current) {
          toast.info(`Arrêté. ${sent} email${sent > 1 ? "s" : ""} envoyé${sent > 1 ? "s" : ""}.`);
          break;
        }
        const res = (await batchFn({
          data: { ...contentOf(), segment: draft.segment },
        })) as {
          sent: number;
          failed: number;
          remaining: number;
          failures: { email: string; error: string }[];
        };

        sent += res.sent;
        failed += res.failed;
        setProgress({ sent, failed, remaining: res.remaining });

        if (res.failures.length) {
          for (const f of res.failures.slice(0, 3)) {
            toast.error(`${f.email} : ${f.error}`);
          }
        }
        // Un lot sans aucun envoi ne progressera pas au suivant : s'arrêter
        // plutôt que de tourner en boucle sur les mêmes échecs.
        if (res.sent === 0) {
          if (res.remaining > 0) {
            toast.error(`Arrêt : ${res.remaining} destinataire(s) en échec répété.`);
          }
          break;
        }
        if (res.remaining <= 0) break;
      }
      if (!stopRef.current && failed === 0) {
        toast.success(`Campagne envoyée : ${sent} email${sent > 1 ? "s" : ""}.`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Envoi interrompu.");
    } finally {
      setBusy(null);
      await refreshHistory();
      await checkAudience();
    }
  };

  const segmentMeta = SEGMENTS.find((s) => s.id === draft.segment)!;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl">Campagnes email</h1>
        <p className="text-sm text-muted-foreground">
          Un message unique, envoyé à un segment d'utilisateurs. Distinct des emails automatiques,
          qui suivent l'avancement de chacun.
        </p>
      </div>

      {/* ---------- Rédaction ---------- */}
      <section className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-rose-50 text-rose-700">
            <Megaphone size={16} />
          </span>
          <h2 className="font-serif text-lg">Message</h2>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-[11px] text-muted-foreground">
              Identifiant de campagne
            </span>
            <input
              value={draft.key}
              onChange={(e) => set("key", e.target.value.toLowerCase())}
              placeholder="promo-novembre-2026"
              className={`${fieldClass} font-mono`}
            />
            <span className="mt-1 block text-[11px] text-muted-foreground">
              Sert de garde anti-doublon : un destinataire déjà servi sous cet identifiant ne sera
              pas rappelé.
            </span>
          </label>

          <label className="text-sm">
            <span className="mb-1 block text-[11px] text-muted-foreground">
              Sur-titre (petite ligne dorée)
            </span>
            <input
              value={draft.eyebrow}
              onChange={(e) => set("eyebrow", e.target.value)}
              placeholder="Offre de novembre"
              maxLength={40}
              className={fieldClass}
            />
          </label>

          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block text-[11px] text-muted-foreground">
              Objet ({draft.subject.trim().length}/150)
            </span>
            <input
              value={draft.subject}
              onChange={(e) => set("subject", e.target.value)}
              maxLength={150}
              className={fieldClass}
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block text-[11px] text-muted-foreground">Libellé du bouton</span>
            <input
              value={draft.ctaLabel}
              onChange={(e) => set("ctaLabel", e.target.value)}
              className={fieldClass}
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block text-[11px] text-muted-foreground">
              Adresse du bouton (https://)
            </span>
            <input
              value={draft.ctaUrl}
              onChange={(e) => set("ctaUrl", e.target.value)}
              className={fieldClass}
            />
          </label>

          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block text-[11px] text-muted-foreground">
              Corps du message (HTML) — <span className="font-mono">{"{first_name}"}</span> pour le
              prénom, <span className="font-mono">{"{cta}"}</span> pour le bouton
            </span>
            <textarea
              value={draft.bodyHtml}
              onChange={(e) => set("bodyHtml", e.target.value)}
              rows={16}
              spellCheck={false}
              className={`${fieldClass} font-mono text-[12px] leading-relaxed`}
            />
          </label>
        </div>

        <p className="mt-2 text-[11px] text-muted-foreground">
          Le brouillon est conservé dans ce navigateur uniquement — il survit à un rechargement, pas
          à un changement de poste.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={doPreview}
            disabled={busy !== null}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-white px-4 py-2 text-[12px] font-medium transition hover:bg-neutral-50 disabled:opacity-60"
          >
            {busy === "preview" ? (
              <LoaderCircle className="animate-spin" size={14} />
            ) : (
              <Eye size={14} />
            )}
            Aperçu
          </button>
          <div className="flex items-center gap-2">
            <input
              value={draft.testEmail}
              onChange={(e) => set("testEmail", e.target.value)}
              placeholder="adresse de test (vide = la vôtre)"
              className="w-60 rounded-full border border-border/60 bg-white px-3.5 py-2 text-[12px] outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              onClick={doTest}
              disabled={busy !== null}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-white px-4 py-2 text-[12px] font-medium transition hover:bg-neutral-50 disabled:opacity-60"
            >
              {busy === "test" ? (
                <LoaderCircle className="animate-spin" size={14} />
              ) : (
                <Send size={14} />
              )}
              Envoyer un test
            </button>
          </div>
        </div>

        {preview ? (
          <div className="mt-4">
            <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Aperçu — rendu par le serveur, identique à l'envoi
            </p>
            <iframe
              title="Aperçu de la campagne"
              srcDoc={preview}
              sandbox=""
              className="h-[520px] w-full rounded-xl border border-border/60 bg-white"
            />
          </div>
        ) : null}
      </section>

      {/* ---------- Audience ---------- */}
      <section className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-blue-50 text-blue-700">
            <Users size={16} />
          </span>
          <h2 className="font-serif text-lg">Destinataires</h2>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-[11px] text-muted-foreground">Segment</span>
            <select
              value={draft.segment}
              onChange={(e) => {
                set("segment", e.target.value as Segment);
                setAudience(null);
              }}
              className={fieldClass}
            >
              {SEGMENTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-[11px] text-muted-foreground">{segmentMeta.hint}</span>
          </label>

          <div className="flex items-end">
            <button
              onClick={checkAudience}
              disabled={busy !== null}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-white px-4 py-2 text-[12px] font-medium transition hover:bg-neutral-50 disabled:opacity-60"
            >
              {busy === "audience" ? (
                <LoaderCircle className="animate-spin" size={14} />
              ) : (
                <Users size={14} />
              )}
              Vérifier l'audience
            </button>
          </div>
        </div>

        {audience ? (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Dans le segment" value={audience.eligible} />
              <Stat label="Déjà servis" value={audience.alreadySent} />
              <Stat label="Reste à envoyer" value={audience.pending} accent />
            </div>

            <div className="rounded-xl border border-border/60 bg-neutral-50/60 px-4 py-3 text-[12px] text-muted-foreground">
              <p className="mb-1 font-medium text-foreground">Écartés</p>
              <ul className="space-y-0.5">
                <li>Sans adresse valable : {audience.excluded.sansEmail}</li>
                <li>Suppression de compte demandée : {audience.excluded.suppressionDemandee}</li>
                <li>Désabonnés (liste de suppression) : {audience.excluded.desabonnes}</li>
                <li>Adresses en doublon : {audience.excluded.doublons}</li>
                <li>Hors du segment : {audience.excluded.horsSegment}</li>
              </ul>
            </div>

            {audience.sample.length ? (
              <p className="text-[11px] text-muted-foreground">
                Prochains destinataires :{" "}
                <span className="font-mono">{audience.sample.join(", ")}</span>
                {audience.pending > audience.sample.length ? " …" : ""}
              </p>
            ) : null}

            {progress ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-[12px] text-emerald-900">
                Envoyés : {progress.sent} · Échecs : {progress.failed} · Restants :{" "}
                {Math.max(0, progress.remaining)}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={doSend}
                disabled={busy !== null || audience.pending === 0}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-[12px] font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
              >
                {busy === "send" ? (
                  <LoaderCircle className="animate-spin" size={14} />
                ) : (
                  <Send size={14} />
                )}
                Envoyer à {audience.pending} destinataire{audience.pending > 1 ? "s" : ""}
              </button>
              {busy === "send" ? (
                <button
                  onClick={() => {
                    stopRef.current = true;
                  }}
                  className="rounded-full border border-border/60 bg-white px-4 py-2 text-[12px] font-medium transition hover:bg-neutral-50"
                >
                  Arrêter après ce lot
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-border/60 bg-neutral-50 px-4 py-6 text-center text-sm text-muted-foreground">
            Vérifiez l'audience pour voir combien de personnes seraient servies.
          </p>
        )}
      </section>

      {/* ---------- Historique ---------- */}
      <section className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-serif text-lg">Campagnes envoyées</h2>
        {history.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border/60 bg-neutral-50 px-4 py-6 text-center text-sm text-muted-foreground">
            Aucune campagne envoyée pour le moment.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-3">Campagne</th>
                <th className="py-2 pr-3">Envoyés</th>
                <th className="py-2 pr-3">Échecs</th>
                <th className="py-2 pr-3">Dernier envoi</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.key} className="border-b border-border/40 last:border-0">
                  <td className="py-2.5 pr-3 font-mono text-[12px]">{h.key}</td>
                  <td className="py-2.5 pr-3 font-mono">{h.sent}</td>
                  <td className="py-2.5 pr-3 font-mono">
                    {h.failed > 0 ? <span className="text-red-600">{h.failed}</span> : "0"}
                  </td>
                  <td className="py-2.5 pr-3 text-[12px] text-muted-foreground">
                    {new Intl.DateTimeFormat("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(h.last))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border/60 px-4 py-3">
      <p className={`font-mono text-2xl ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
