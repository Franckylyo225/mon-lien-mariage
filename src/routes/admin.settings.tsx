import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  IconTicket,
  IconInfoCircle,
  IconMail,
  IconPlus,
  IconPencil,
  IconTrash,
  IconLoader2,
} from "@tabler/icons-react";
import {
  listPromoCodes,
  upsertPromoCode,
  deletePromoCode,
} from "@/lib/admin.functions";

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
    : new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(d);
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

      {/* ---------- Codes promo ---------- */}
      <section className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-full bg-amber-50 text-amber-700">
              <IconTicket size={16} />
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
              className="inline-flex items-center gap-1.5 rounded-full bg-[#4B1528] px-3 py-2 text-[12px] font-medium text-white transition hover:opacity-90"
            >
              <IconPlus size={14} />
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
            <IconLoader2 className="animate-spin" size={18} />
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
                  const expired = row.valid_until && new Date(row.valid_until).getTime() < Date.now();
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
                            <IconPencil size={15} />
                          </button>
                          <button
                            onClick={() => del(row)}
                            className="grid size-8 place-items-center rounded-full text-red-600 transition hover:bg-red-50"
                            title="Supprimer"
                          >
                            <IconTrash size={15} />
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
            <IconMail size={16} />
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
            <IconInfoCircle size={16} />
          </span>
          <h2 className="font-serif text-lg">Tarification</h2>
        </div>
        <ul className="space-y-1.5 text-sm">
          <li>
            <span className="text-muted-foreground">Prix par publication :</span>{" "}
            <span className="font-mono">24 900 XOF</span>
          </li>
          <li>
            <span className="text-muted-foreground">Devise :</span>{" "}
            <span>Franc CFA (XOF)</span>
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
          className="inline-flex items-center gap-1.5 rounded-full bg-[#4B1528] px-4 py-2 text-[12px] font-medium text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {busy ? <IconLoader2 className="animate-spin" size={14} /> : null}
          {form.id ? "Enregistrer" : "Créer"}
        </button>
      </div>
    </div>
  );
}
