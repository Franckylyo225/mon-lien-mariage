import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IconMailCheck,
  IconMailX,
  IconClock,
  IconPlayerPlay,
  IconSend,
  IconPencil,
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
  listEmailLog,
  listEmailAutomations,
  updateEmailAutomation,
  sendAutomationTest,
  runEmailAutomationsNow,
  type EmailAutomationRow,
} from "@/lib/admin.functions";
import { DataTable, type Column } from "@/components/admin/DataTable";

export const Route = createFileRoute("/admin/emails")({
  component: AdminEmails,
});

type Row = Awaited<ReturnType<typeof listEmailLog>>["logs"][number];

const PHASES: Record<string, string> = {
  onboarding: "Onboarding",
  activation: "Activation",
  conversion: "Conversion",
  retention: "Rétention",
};

function AdminEmails() {
  const [tab, setTab] = useState<"automations" | "log">("automations");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl">Emails</h1>
        <p className="text-sm text-muted-foreground">
          Relances automatiques selon l'avancement des couples, et journal de livraison.
        </p>
      </div>

      <div className="flex gap-1 rounded-full border border-border/60 bg-white p-1 text-sm w-fit">
        {(
          [
            ["automations", "Automatisations"],
            ["log", "Journal"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-full px-4 py-1.5 ${
              tab === key ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "automations" ? <AutomationsTab /> : <LogTab />}
    </div>
  );
}

/* --------------------------------------------------------- automations --- */

function AutomationsTab() {
  const qc = useQueryClient();
  const list = useServerFn(listEmailAutomations);
  const update = useServerFn(updateEmailAutomation);
  const test = useServerFn(sendAutomationTest);
  const runNow = useServerFn(runEmailAutomationsNow);
  const [editing, setEditing] = useState<EmailAutomationRow | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "email-automations"],
    queryFn: () => list(),
  });

  const saveMutation = useMutation({
    mutationFn: (input: Parameters<typeof updateEmailAutomation>[0]["data"]) =>
      update({ data: input }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "email-automations"] });
    },
  });

  const runMutation = useMutation({
    mutationFn: () => runNow(),
    onSuccess: (r: any) => {
      toast.success(`Moteur exécuté · ${r.sent} envoyé(s), ${r.skipped} ignoré(s)`);
      qc.invalidateQueries({ queryKey: ["admin", "email-automations"] });
    },
    onError: () => toast.error("Échec de l'exécution du moteur"),
  });

  const groups = (data ?? []).reduce<Record<string, EmailAutomationRow[]>>((acc, a) => {
    (acc[a.phase] ??= []).push(a);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button
          onClick={() => runMutation.mutate()}
          disabled={runMutation.isPending}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-white px-3 py-1.5 text-[12px] hover:bg-secondary disabled:opacity-50"
        >
          <IconPlayerPlay size={13} />
          {runMutation.isPending ? "Exécution…" : "Exécuter maintenant"}
        </button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Chargement…</p>}

      {Object.entries(groups).map(([phase, items]) => (
        <div key={phase} className="space-y-2">
          <h2 className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            {PHASES[phase] ?? phase}
          </h2>
          <div className="grid gap-2">
            {items.map((a) => (
              <div
                key={a.id}
                className="rounded-2xl border border-border/60 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)]"
              >
                <div className="flex flex-wrap items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{a.name}</span>
                      <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {a.trigger_key}
                      </code>
                    </div>
                    {a.description && (
                      <p className="mt-0.5 text-[12px] text-muted-foreground">{a.description}</p>
                    )}
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      Délai : {a.delay_value} {a.delay_unit} · {a.sent_count} envoi(s)
                      {a.last_sent_at
                        ? ` · dernier ${new Date(a.last_sent_at).toLocaleDateString("fr-FR")}`
                        : ""}
                    </p>
                    <p className="mt-1 truncate text-[12px]">
                      <span className="text-muted-foreground">Objet :</span> {a.subject}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        test({ data: { id: a.id } })
                          .then((r: any) => toast.success(`Test envoyé à ${r.recipient}`))
                          .catch(() => toast.error("Échec de l'envoi de test"))
                      }
                      className="inline-flex items-center gap-1 rounded-full border border-border/60 px-3 py-1.5 text-[12px] hover:bg-secondary"
                    >
                      <IconSend size={13} /> Test
                    </button>
                    <button
                      onClick={() => setEditing(a)}
                      className="inline-flex items-center gap-1 rounded-full border border-border/60 px-3 py-1.5 text-[12px] hover:bg-secondary"
                    >
                      <IconPencil size={13} /> Modifier
                    </button>
                    <label className="inline-flex cursor-pointer items-center gap-2 text-[12px]">
                      <input
                        type="checkbox"
                        checked={a.is_active}
                        onChange={(e) =>
                          saveMutation.mutate({ id: a.id, is_active: e.target.checked })
                        }
                      />
                      Actif
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {editing && (
        <EditDialog
          automation={editing}
          onClose={() => setEditing(null)}
          onSave={(patch) => {
            saveMutation.mutate(
              { id: editing.id, ...patch },
              {
                onSuccess: () => {
                  toast.success("Automatisation mise à jour");
                  setEditing(null);
                },
                onError: () => toast.error("Enregistrement impossible"),
              },
            );
          }}
          saving={saveMutation.isPending}
        />
      )}
    </div>
  );
}

function EditDialog({
  automation,
  onClose,
  onSave,
  saving,
}: {
  automation: EmailAutomationRow;
  onClose: () => void;
  onSave: (patch: Record<string, unknown>) => void;
  saving: boolean;
}) {
  const [delayValue, setDelayValue] = useState(String(automation.delay_value));
  const [delayUnit, setDelayUnit] = useState(automation.delay_unit);
  const [subject, setSubject] = useState(automation.subject);
  const [bodyHtml, setBodyHtml] = useState(automation.body_html);
  const [ctaLabel, setCtaLabel] = useState(automation.cta_label ?? "");
  const [ctaUrl, setCtaUrl] = useState(automation.cta_url_pattern ?? "");

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-6">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl">
        <h3 className="font-serif text-xl">{automation.name}</h3>
        <p className="mb-4 text-[12px] text-muted-foreground">
          Variables disponibles : {"{first_name}"}, {"{bride_name}"}, {"{groom_name}"},
          {" {slug}"}, {"{cta}"} (bouton).
        </p>

        <div className="space-y-3 text-sm">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-[12px] text-muted-foreground">Délai</label>
              <input
                type="number"
                min={0}
                value={delayValue}
                onChange={(e) => setDelayValue(e.target.value)}
                className="w-full rounded-xl border border-border/60 px-3 py-2 text-base"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-[12px] text-muted-foreground">Unité</label>
              <select
                value={delayUnit}
                onChange={(e) => setDelayUnit(e.target.value as typeof delayUnit)}
                className="w-full rounded-xl border border-border/60 px-3 py-2 text-base"
              >
                <option value="minutes">minutes</option>
                <option value="hours">heures</option>
                <option value="days">jours</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[12px] text-muted-foreground">Objet</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-xl border border-border/60 px-3 py-2 text-base"
            />
          </div>

          <div>
            <label className="mb-1 block text-[12px] text-muted-foreground">Corps (HTML)</label>
            <textarea
              value={bodyHtml}
              onChange={(e) => setBodyHtml(e.target.value)}
              rows={12}
              className="w-full rounded-xl border border-border/60 px-3 py-2 font-mono text-[13px]"
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-[12px] text-muted-foreground">Libellé bouton</label>
              <input
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                className="w-full rounded-xl border border-border/60 px-3 py-2 text-base"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-[12px] text-muted-foreground">Lien bouton</label>
              <input
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="/publish"
                className="w-full rounded-xl border border-border/60 px-3 py-2 text-base"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-full border border-border/60 px-4 py-2 text-sm hover:bg-secondary"
          >
            Annuler
          </button>
          <button
            disabled={saving}
            onClick={() =>
              onSave({
                delay_value: Math.max(0, Number(delayValue) || 0),
                delay_unit: delayUnit,
                subject,
                body_html: bodyHtml,
                cta_label: ctaLabel || null,
                cta_url_pattern: ctaUrl || null,
              })
            }
            className="rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground disabled:opacity-50"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- journal --- */

function LogTab() {
  const fetch = useServerFn(listEmailLog);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "emails"],
    queryFn: () => fetch(),
  });

  const totals = data?.totals ?? { sent: 0, failed: 0, last24: 0 };

  const columns: Column<Row>[] = [
    {
      key: "date",
      label: "Date",
      sortValue: (r) => r.created_at,
      render: (r) => (
        <span className="text-[12px] text-muted-foreground">
          {new Date(r.created_at).toLocaleString("fr-FR")}
        </span>
      ),
    },
    {
      key: "template",
      label: "Template",
      sortValue: (r) => r.template_name ?? "",
      render: (r) => <span className="text-[12px]">{r.template_name ?? "—"}</span>,
    },
    {
      key: "recipient",
      label: "Destinataire",
      sortValue: (r) => r.recipient_email ?? "",
      render: (r) => <span className="text-[12px]">{r.recipient_email ?? "—"}</span>,
    },
    {
      key: "status",
      label: "Statut",
      sortValue: (r) => r.status ?? "",
      render: (r) => {
        const s = r.status ?? "";
        const cls =
          s === "sent"
            ? "bg-emerald-50 text-emerald-700"
            : s === "failed"
              ? "bg-rose-50 text-rose-700"
              : "bg-amber-50 text-amber-700";
        return <span className={`rounded-full px-2 py-0.5 text-[11px] ${cls}`}>{s || "—"}</span>;
      },
    },
    {
      key: "error",
      label: "Erreur",
      render: (r) =>
        r.error_message ? (
          <span className="line-clamp-2 max-w-xs text-[11px] text-rose-700">{r.error_message}</span>
        ) : (
          <span className="text-[11px] text-muted-foreground">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      {data?.historyStartsAt && (
        <p className="text-[12px] text-muted-foreground">
          Historique visible depuis le{" "}
          {new Date(data.historyStartsAt).toLocaleDateString("fr-FR")}.
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
          <div className="mb-1 inline-grid size-8 place-items-center rounded-full bg-emerald-50 text-emerald-700">
            <IconMailCheck size={16} />
          </div>
          <div className="text-xl font-semibold">{totals.sent.toLocaleString("fr-FR")}</div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Envoyés</div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
          <div className="mb-1 inline-grid size-8 place-items-center rounded-full bg-rose-50 text-rose-700">
            <IconMailX size={16} />
          </div>
          <div className="text-xl font-semibold">{totals.failed.toLocaleString("fr-FR")}</div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Échecs</div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
          <div className="mb-1 inline-grid size-8 place-items-center rounded-full bg-blue-50 text-blue-700">
            <IconClock size={16} />
          </div>
          <div className="text-xl font-semibold">{totals.last24.toLocaleString("fr-FR")}</div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Dernières 24h
          </div>
        </div>
      </div>

      <DataTable
        data={data?.logs}
        columns={columns}
        isLoading={isLoading}
        searchable={(r) => `${r.recipient_email ?? ""} ${r.template_name ?? ""} ${r.status ?? ""}`}
        rowKey={(r) => r.id}
        filename="emails.csv"
      />
    </div>
  );
}
