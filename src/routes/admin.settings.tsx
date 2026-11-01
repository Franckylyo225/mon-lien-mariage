import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Ticket, Info, Mail, Megaphone, Plus, Pencil, Trash, LoaderCircle } from "lucide-react";
import {
  listPromoCodes,
  upsertPromoCode,
  deletePromoCode,
  listSiteBanners,
  upsertSiteBanner,
  deleteSiteBanner,
} from "@/lib/admin.functions";
import { BannerBar } from "@/components/site/SiteBanner";
import {
  resolveBannerHref,
  type SiteBannerAudience,
  type SiteBannerVariant,
} from "@/lib/site-banner";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

type PromoRow = {
  id: string;
  code: string;
  discount_percent: number;
  max_uses: number | null;
  uses: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type FormState = {
  id?: string;
  code: string;
  discount_percent: number;
  max_uses: string; // input as string
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  notes: string;
};

const EMPTY_FORM: FormState = {
  code: "",
  discount_percent: 100,
  max_uses: "",
  valid_from: "",
  valid_until: "",
  is_active: true,
  notes: "",
};

function toInputDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function fromInputDate(v: string): string | null {
  if (!v) return null;
  const d = new Date(`${v}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(
        d,
      );
}

function AdminSettings() {
  const list = useServerFn(listPromoCodes);
  const upsert = useServerFn(upsertPromoCode);
  const remove = useServerFn(deletePromoCode);
  const [rows, setRows] = useState<PromoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editing, setEditing] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = (await list()) as PromoRow[];
      setRows(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCreate = () => {
    setForm(EMPTY_FORM);
    setEditing(true);
  };

  const startEdit = (row: PromoRow) => {
    setForm({
      id: row.id,
      code: row.code,
      discount_percent: row.discount_percent,
      max_uses: row.max_uses === null ? "" : String(row.max_uses),
      valid_from: toInputDate(row.valid_from),
      valid_until: toInputDate(row.valid_until),
      is_active: row.is_active,
      notes: row.notes ?? "",
    });
    setEditing(true);
  };

  const cancel = () => {
    setEditing(false);
    setForm(EMPTY_FORM);
  };

  const submit = async () => {
    setBusy(true);
    try {
      await upsert({
        data: {
          id: form.id,
          code: form.code,
          discount_percent: form.discount_percent,
          max_uses: form.max_uses.trim() === "" ? null : Number(form.max_uses),
          valid_from: fromInputDate(form.valid_from),
          valid_until: fromInputDate(form.valid_until),
          is_active: form.is_active,
          notes: form.notes,
        },
      });
      toast.success(form.id ? "Code mis à jour." : "Code créé.");
      cancel();
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Enregistrement impossible.");
    } finally {
      setBusy(false);
    }
  };

  const del = async (row: PromoRow) => {
    if (!confirm(`Supprimer le code « ${row.code} » ?`)) return;
    try {
      await remove({ data: { id: row.id } });
      toast.success("Code supprimé.");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Suppression impossible.");
    }
  };

  const toggle = async (row: PromoRow) => {
    try {
      await upsert({
        data: {
          id: row.id,
          code: row.code,
          discount_percent: row.discount_percent,
          max_uses: row.max_uses,
          valid_from: row.valid_from,
          valid_until: row.valid_until,
          is_active: !row.is_active,
          notes: row.notes,
        },
      });
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Modification impossible.");
    }
  };

  const totals = useMemo(() => {
    const active = rows.filter((r) => r.is_active).length;
    const uses = rows.reduce((n, r) => n + r.uses, 0);
    return { active, uses, total: rows.length };
  }, [rows]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl">Paramètres</h1>
        <p className="text-sm text-muted-foreground">
          Configuration de la plateforme et informations générales.
        </p>
      </div>

      <BannerSection />

      {/* ---------- Codes promo ---------- */}
      <section className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-full bg-amber-50 text-amber-700">
              <Ticket size={16} />
            </span>
            <div>
              <h2 className="font-serif text-lg">Codes promo</h2>
              <p className="text-[12px] text-muted-foreground">
                {totals.total} code{totals.total > 1 ? "s" : ""} · {totals.active} actif
                {totals.active > 1 ? "s" : ""} · {totals.uses} utilisation
                {totals.uses > 1 ? "s" : ""}
              </p>
            </div>
          </div>
          {!editing ? (
            <button
              onClick={startCreate}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground transition hover:opacity-90"
            >
              <Plus size={14} />
              Nouveau code
            </button>
          ) : null}
        </div>

        {editing ? (
          <PromoForm
            form={form}
            setForm={setForm}
            onCancel={cancel}
            onSubmit={submit}
            busy={busy}
          />
        ) : null}

        {loading ? (
          <div className="grid place-items-center py-10 text-sm text-muted-foreground">
            <LoaderCircle className="animate-spin" size={18} />
          </div>
        ) : rows.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border/60 bg-neutral-50 px-4 py-6 text-center text-sm text-muted-foreground">
            Aucun code promo pour le moment.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 pr-3">Code</th>
                  <th className="py-2 pr-3">Remise</th>
                  <th className="py-2 pr-3">Utilisations</th>
                  <th className="py-2 pr-3">Validité</th>
                  <th className="py-2 pr-3">Statut</th>
                  <th className="py-2 pr-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const expired =
                    row.valid_until && new Date(row.valid_until).getTime() < Date.now();
                  const exhausted = row.max_uses !== null && row.uses >= row.max_uses;
                  const status = !row.is_active
                    ? { label: "Inactif", cls: "bg-neutral-100 text-neutral-600" }
                    : expired
                      ? { label: "Expiré", cls: "bg-red-50 text-red-700" }
                      : exhausted
                        ? { label: "Épuisé", cls: "bg-orange-50 text-orange-700" }
                        : { label: "Actif", cls: "bg-emerald-50 text-emerald-700" };
                  return (
                    <tr key={row.id} className="border-b border-border/40 last:border-0">
                      <td className="py-3 pr-3">
                        <p className="font-mono font-medium">{row.code}</p>
                        {row.notes ? (
                          <p className="text-[11px] text-muted-foreground">{row.notes}</p>
                        ) : null}
                      </td>
                      <td className="py-3 pr-3 font-mono">{row.discount_percent}%</td>
                      <td className="py-3 pr-3 font-mono">
                        {row.uses}
                        {row.max_uses !== null ? (
                          <span className="text-muted-foreground"> / {row.max_uses}</span>
                        ) : (
                          <span className="text-muted-foreground"> / ∞</span>
                        )}
                      </td>
                      <td className="py-3 pr-3 text-[12px]">
                        <div>Début : {formatDate(row.valid_from)}</div>
                        <div>Fin : {formatDate(row.valid_until)}</div>
                      </td>
                      <td className="py-3 pr-3">
                        <button
                          onClick={() => toggle(row)}
                          className={`rounded-full px-2 py-0.5 text-[11px] transition ${status.cls}`}
                          title="Activer / désactiver"
                        >
                          {status.label}
                        </button>
                      </td>
                      <td className="py-3 pr-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => startEdit(row)}
                            className="grid size-8 place-items-center rounded-full text-muted-foreground transition hover:bg-neutral-100 hover:text-foreground"
                            title="Modifier"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => del(row)}
                            className="grid size-8 place-items-center rounded-full text-red-600 transition hover:bg-red-50"
                            title="Supprimer"
                          >
                            <Trash size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ---------- Emails ---------- */}
      <section className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-blue-50 text-blue-700">
            <Mail size={16} />
          </span>
          <h2 className="font-serif text-lg">Emails transactionnels</h2>
        </div>
        <ul className="space-y-1.5 text-sm">
          <li>
            <span className="text-muted-foreground">Domaine d'envoi :</span>{" "}
            <span className="font-mono">notify.moninvit.com</span>
          </li>
          <li>
            <span className="text-muted-foreground">Adresse de contact :</span>{" "}
            <span className="font-mono">contact@moninvit.com</span>
          </li>
          <li>
            <span className="text-muted-foreground">Statut file :</span>{" "}
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">
              Opérationnelle
            </span>
          </li>
        </ul>
      </section>

      {/* ---------- Tarification ---------- */}
      <section className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-neutral-100 text-neutral-700">
            <Info size={16} />
          </span>
          <h2 className="font-serif text-lg">Tarification</h2>
        </div>
        <ul className="space-y-1.5 text-sm">
          <li>
            <span className="text-muted-foreground">Prix par publication :</span>{" "}
            <span className="font-mono">24 900 XOF</span>
          </li>
          <li>
            <span className="text-muted-foreground">Devise :</span> <span>Franc CFA (XOF)</span>
          </li>
          <li>
            <span className="text-muted-foreground">Paiement en ligne :</span>{" "}
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] text-amber-700">
              Temporairement désactivé
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}

function PromoForm({
  form,
  setForm,
  onCancel,
  onSubmit,
  busy,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  onCancel: () => void;
  onSubmit: () => void;
  busy: boolean;
}) {
  return (
    <div className="mb-4 rounded-xl border border-border/60 bg-neutral-50/50 p-4">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {form.id ? "Modifier le code" : "Nouveau code promo"}
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block text-[11px] text-muted-foreground">Code</span>
          <input
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="EX : NOEL50"
            spellCheck={false}
            autoCapitalize="characters"
            maxLength={32}
            className="w-full rounded-lg border border-border/60 bg-white px-3 py-2 font-mono uppercase tracking-wider outline-none focus:ring-2 focus:ring-primary/40"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-[11px] text-muted-foreground">Remise (%)</span>
          <input
            type="number"
            min={0}
            max={100}
            value={form.discount_percent}
            onChange={(e) => setForm({ ...form, discount_percent: Number(e.target.value) })}
            className="w-full rounded-lg border border-border/60 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-[11px] text-muted-foreground">
            Utilisations max (vide = illimité)
          </span>
          <input
            type="number"
            min={1}
            value={form.max_uses}
            onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
            placeholder="∞"
            className="w-full rounded-lg border border-border/60 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-[11px] text-muted-foreground">Statut</span>
          <select
            value={form.is_active ? "1" : "0"}
            onChange={(e) => setForm({ ...form, is_active: e.target.value === "1" })}
            className="w-full rounded-lg border border-border/60 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="1">Actif</option>
            <option value="0">Inactif</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-[11px] text-muted-foreground">Valide à partir du</span>
          <input
            type="date"
            value={form.valid_from}
            onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
            className="w-full rounded-lg border border-border/60 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-[11px] text-muted-foreground">Valide jusqu'au</span>
          <input
            type="date"
            value={form.valid_until}
            onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
            className="w-full rounded-lg border border-border/60 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40"
          />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block text-[11px] text-muted-foreground">Notes internes</span>
          <input
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Ex : Campagne partenaire XYZ"
            className="w-full rounded-lg border border-border/60 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40"
          />
        </label>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={onCancel}
          disabled={busy}
          className="rounded-full border border-border/60 bg-white px-4 py-2 text-[12px] font-medium transition hover:bg-neutral-50"
        >
          Annuler
        </button>
        <button
          onClick={onSubmit}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[12px] font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          {busy ? <LoaderCircle className="animate-spin" size={14} /> : null}
          {form.id ? "Enregistrer" : "Créer"}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/* Bandeau d'information                                                     */
/* ------------------------------------------------------------------------- */

type BannerRow = {
  id: string;
  message: string;
  link_label: string | null;
  link_href: string | null;
  variant: SiteBannerVariant;
  audience: SiteBannerAudience;
  is_dismissible: boolean;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type BannerFormState = {
  id?: string;
  message: string;
  link_label: string;
  link_href: string;
  variant: SiteBannerVariant;
  audience: SiteBannerAudience;
  is_dismissible: boolean;
  is_active: boolean;
  starts_at: string;
  ends_at: string;
  notes: string;
};

/**
 * Une fin saisie au jour couvre ce jour en entier. Sans cela, « jusqu'au
 * 30 novembre » retirerait le bandeau dès l'entrée dans le 30. La Côte
 * d'Ivoire étant à UTC+0, la fin de journée UTC est bien la fin de journée
 * locale.
 */
function endOfInputDate(v: string): string | null {
  if (!v) return null;
  const d = new Date(`${v}T23:59:59.999Z`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

const EMPTY_BANNER: BannerFormState = {
  message: "",
  link_label: "",
  link_href: "",
  variant: "promo",
  audience: "tous",
  is_dismissible: true,
  is_active: false,
  starts_at: "",
  ends_at: "",
  notes: "",
};

const VARIANT_LABELS: Record<SiteBannerVariant, string> = {
  promo: "Promotion",
  info: "Information",
  alerte: "Alerte",
};

const AUDIENCE_LABELS: Record<SiteBannerAudience, string> = {
  tous: "Tout le monde",
  visiteurs: "Vitrine seulement",
  connectes: "Espace connecté seulement",
};

/** Un seul bandeau s'affiche : le plus récemment modifié parmi les actifs. */
function isLive(row: BannerRow, rows: BannerRow[]): boolean {
  if (!row.is_active) return false;
  const now = Date.now();
  const started = !row.starts_at || Date.parse(row.starts_at) <= now;
  const ended = row.ends_at ? Date.parse(row.ends_at) <= now : false;
  if (!started || ended) return false;
  const winner = rows.find((r) => {
    if (!r.is_active) return false;
    const s = !r.starts_at || Date.parse(r.starts_at) <= now;
    const e = r.ends_at ? Date.parse(r.ends_at) <= now : false;
    return s && !e;
  });
  return winner?.id === row.id;
}

function BannerSection() {
  const list = useServerFn(listSiteBanners);
  const upsert = useServerFn(upsertSiteBanner);
  const remove = useServerFn(deleteSiteBanner);
  const [rows, setRows] = useState<BannerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<BannerFormState>(EMPTY_BANNER);
  const [editing, setEditing] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      setRows((await list()) as BannerRow[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancel = () => {
    setEditing(false);
    setForm(EMPTY_BANNER);
  };

  const startEdit = (row: BannerRow) => {
    setForm({
      id: row.id,
      message: row.message,
      link_label: row.link_label ?? "",
      link_href: row.link_href ?? "",
      variant: row.variant,
      audience: row.audience,
      is_dismissible: row.is_dismissible,
      is_active: row.is_active,
      starts_at: toInputDate(row.starts_at),
      ends_at: toInputDate(row.ends_at),
      notes: row.notes ?? "",
    });
    setEditing(true);
  };

  const payloadOf = (f: BannerFormState) => ({
    id: f.id,
    message: f.message,
    link_label: f.link_label.trim() || null,
    link_href: f.link_href.trim() || null,
    variant: f.variant,
    audience: f.audience,
    is_dismissible: f.is_dismissible,
    is_active: f.is_active,
    starts_at: fromInputDate(f.starts_at),
    ends_at: endOfInputDate(f.ends_at),
    notes: f.notes,
  });

  const submit = async () => {
    setBusy(true);
    try {
      await upsert({ data: payloadOf(form) });
      toast.success(form.id ? "Bandeau mis à jour." : "Bandeau créé.");
      cancel();
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Enregistrement impossible.");
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (row: BannerRow) => {
    try {
      await upsert({
        data: {
          id: row.id,
          message: row.message,
          link_label: row.link_label,
          link_href: row.link_href,
          variant: row.variant,
          audience: row.audience,
          is_dismissible: row.is_dismissible,
          is_active: !row.is_active,
          starts_at: row.starts_at,
          ends_at: row.ends_at,
          notes: row.notes,
        },
      });
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Modification impossible.");
    }
  };

  const del = async (row: BannerRow) => {
    if (!confirm("Supprimer ce bandeau ?")) return;
    try {
      await remove({ data: { id: row.id } });
      toast.success("Bandeau supprimé.");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Suppression impossible.");
    }
  };

  const live = rows.find((r) => isLive(r, rows)) ?? null;

  return (
    <section className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-rose-50 text-rose-700">
            <Megaphone size={16} />
          </span>
          <div>
            <h2 className="font-serif text-lg">Bandeau d'information</h2>
            <p className="text-[12px] text-muted-foreground">
              {live
                ? "Un bandeau est en ligne, en tête de la vitrine et de l'espace connecté."
                : "Aucun bandeau en ligne."}
            </p>
          </div>
        </div>
        {!editing ? (
          <button
            onClick={() => {
              setForm(EMPTY_BANNER);
              setEditing(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground transition hover:opacity-90"
          >
            <Plus size={14} />
            Nouveau bandeau
          </button>
        ) : null}
      </div>

      {editing ? (
        <BannerForm form={form} setForm={setForm} onCancel={cancel} onSubmit={submit} busy={busy} />
      ) : null}

      {loading ? (
        <div className="grid place-items-center py-10 text-sm text-muted-foreground">
          <LoaderCircle className="animate-spin" size={18} />
        </div>
      ) : rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/60 bg-neutral-50 px-4 py-6 text-center text-sm text-muted-foreground">
          Aucun bandeau pour le moment.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {rows.map((row) => {
            const onAir = isLive(row, rows);
            return (
              <li key={row.id} className="rounded-xl border border-border/60 p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{row.message}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {VARIANT_LABELS[row.variant]} · {AUDIENCE_LABELS[row.audience]}
                      {row.ends_at ? ` · jusqu'au ${formatDate(row.ends_at)}` : ""}
                      {row.is_dismissible ? " · masquable" : " · non masquable"}
                    </p>
                    {row.notes ? (
                      <p className="mt-0.5 text-[11px] text-muted-foreground/80">{row.notes}</p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => toggle(row)}
                      title="Activer / désactiver"
                      className={`rounded-full px-2 py-0.5 text-[11px] transition ${
                        onAir
                          ? "bg-emerald-50 text-emerald-700"
                          : row.is_active
                            ? "bg-amber-50 text-amber-700"
                            : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {onAir ? "En ligne" : row.is_active ? "Programmé" : "Inactif"}
                    </button>
                    <button
                      onClick={() => startEdit(row)}
                      className="grid size-8 place-items-center rounded-full text-muted-foreground transition hover:bg-neutral-100 hover:text-foreground"
                      title="Modifier"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => del(row)}
                      className="grid size-8 place-items-center rounded-full text-red-600 transition hover:bg-red-50"
                      title="Supprimer"
                    >
                      <Trash size={15} />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function BannerForm({
  form,
  setForm,
  onCancel,
  onSubmit,
  busy,
}: {
  form: BannerFormState;
  setForm: (f: BannerFormState) => void;
  onCancel: () => void;
  onSubmit: () => void;
  busy: boolean;
}) {
  const fieldClass =
    "w-full rounded-lg border border-border/60 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40";

  const previewBanner = {
    id: "apercu",
    message: form.message.trim() || "Votre message apparaîtra ici",
    linkLabel: form.link_label.trim() || null,
    linkHref: form.link_href.trim() || null,
    variant: form.variant,
    audience: form.audience,
    isDismissible: form.is_dismissible,
    updatedAt: "",
  };
  const appHref = resolveBannerHref(previewBanner, "connectes");

  return (
    <div className="mb-4 rounded-xl border border-border/60 bg-neutral-50/50 p-4">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {form.id ? "Modifier le bandeau" : "Nouveau bandeau"}
      </p>

      {/* Aperçu rendu par le composant du site : ce que voit l'administrateur
          est exactement ce que verront les visiteurs. */}
      <div className="mb-2 overflow-hidden rounded-lg border border-border/60">
        <BannerBar banner={previewBanner} />
      </div>

      {/* La traduction du lien pour l'espace connecté serait invisible sans
          cela : un lien vers l'inscription y mène ailleurs, exprès. */}
      {appHref && appHref !== previewBanner.linkHref ? (
        <p className="mb-4 text-[11px] text-muted-foreground">
          Dans l'espace connecté, ce lien mènera à <span className="font-mono">{appHref}</span> —
          l'inscription n'a pas de sens pour qui a déjà un compte.
        </p>
      ) : (
        <div className="mb-4" />
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block text-[11px] text-muted-foreground">
            Message ({form.message.trim().length}/180)
          </span>
          <input
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Ex : -40 % sur toutes les publications"
            maxLength={180}
            className={fieldClass}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-[11px] text-muted-foreground">
            Libellé du lien (optionnel)
          </span>
          <input
            value={form.link_label}
            onChange={(e) => setForm({ ...form, link_label: e.target.value })}
            placeholder="En profiter"
            maxLength={40}
            className={fieldClass}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-[11px] text-muted-foreground">
            Adresse du lien (/ ou https://)
          </span>
          <input
            value={form.link_href}
            onChange={(e) => setForm({ ...form, link_href: e.target.value })}
            placeholder="/signup"
            className={fieldClass}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-[11px] text-muted-foreground">Ton</span>
          <select
            value={form.variant}
            onChange={(e) => setForm({ ...form, variant: e.target.value as SiteBannerVariant })}
            className={fieldClass}
          >
            {(Object.keys(VARIANT_LABELS) as SiteBannerVariant[]).map((v) => (
              <option key={v} value={v}>
                {VARIANT_LABELS[v]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-[11px] text-muted-foreground">Audience</span>
          <select
            value={form.audience}
            onChange={(e) => setForm({ ...form, audience: e.target.value as SiteBannerAudience })}
            className={fieldClass}
          >
            {(Object.keys(AUDIENCE_LABELS) as SiteBannerAudience[]).map((a) => (
              <option key={a} value={a}>
                {AUDIENCE_LABELS[a]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-[11px] text-muted-foreground">
            Début (vide = tout de suite)
          </span>
          <input
            type="date"
            value={form.starts_at}
            onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
            className={fieldClass}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-[11px] text-muted-foreground">
            Fin (vide = sans limite)
          </span>
          <input
            type="date"
            value={form.ends_at}
            onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
            className={fieldClass}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-[11px] text-muted-foreground">Statut</span>
          <select
            value={form.is_active ? "1" : "0"}
            onChange={(e) => setForm({ ...form, is_active: e.target.value === "1" })}
            className={fieldClass}
          >
            <option value="1">Actif</option>
            <option value="0">Inactif</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-[11px] text-muted-foreground">
            Le visiteur peut le masquer
          </span>
          <select
            value={form.is_dismissible ? "1" : "0"}
            onChange={(e) => setForm({ ...form, is_dismissible: e.target.value === "1" })}
            className={fieldClass}
          >
            <option value="1">Oui</option>
            <option value="0">Non</option>
          </select>
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block text-[11px] text-muted-foreground">Notes internes</span>
          <input
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Ex : campagne de lancement novembre"
            className={fieldClass}
          />
        </label>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={onCancel}
          disabled={busy}
          className="rounded-full border border-border/60 bg-white px-4 py-2 text-[12px] font-medium transition hover:bg-neutral-50"
        >
          Annuler
        </button>
        <button
          onClick={onSubmit}
          disabled={busy || !form.message.trim()}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[12px] font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          {busy ? <LoaderCircle className="animate-spin" size={14} /> : null}
          {form.id ? "Enregistrer" : "Créer"}
        </button>
      </div>
    </div>
  );
}
