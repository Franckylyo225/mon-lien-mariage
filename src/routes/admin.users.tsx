import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { IconShieldCheck, IconShield, IconMail, IconKey } from "@tabler/icons-react";
import { toast } from "sonner";
import {
  listAllUsers,
  setUserRole,
  sendPasswordResetEmail,
  adminSetUserPassword,
} from "@/lib/admin.functions";
import { DataTable, type Column } from "@/components/admin/DataTable";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

type Row = Awaited<ReturnType<typeof listAllUsers>>[number];

function AdminUsers() {
  const fetchUsers = useServerFn(listAllUsers);
  const toggleRole = useServerFn(setUserRole);
  const sendReset = useServerFn(sendPasswordResetEmail);
  const setPassword = useServerFn(adminSetUserPassword);
  const qc = useQueryClient();

  const [pwTarget, setPwTarget] = useState<Row | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => fetchUsers(),
  });

  async function handleToggleAdmin(userId: string, isAdmin: boolean) {
    if (!confirm(isAdmin ? "Retirer les droits admin ?" : "Accorder les droits admin ?")) return;
    await toggleRole({ data: { userId, role: "admin", grant: !isAdmin } });
    qc.invalidateQueries({ queryKey: ["admin", "users"] });
  }

  async function handleSendReset(u: Row) {
    if (!u.email) return;
    if (!confirm(`Envoyer un email de réinitialisation à ${u.email} ?`)) return;
    try {
      await sendReset({ data: { email: u.email } });
      toast.success("Email de réinitialisation envoyé.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Envoi impossible");
    }
  }

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!pwTarget) return;
    setSaving(true);
    try {
      await setPassword({ data: { userId: pwTarget.id, password: newPassword } });
      toast.success("Mot de passe mis à jour.");
      setPwTarget(null);
      setNewPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec de la mise à jour");
    } finally {
      setSaving(false);
    }
  }


  const columns: Column<Row>[] = [
    {
      key: "user",
      label: "Utilisateur",
      sortValue: (u) => u.user_first_name || u.display_name || u.email || "",
      csvValue: (u) => u.user_first_name || u.display_name || "",
      render: (u) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{u.user_first_name || u.display_name || "—"}</p>
          <p className="truncate text-[11px] text-muted-foreground">{u.email}</p>
        </div>
      ),
    },
    { key: "email", label: "Email", sortValue: (u) => u.email ?? "", csvValue: (u) => u.email ?? "", render: (u) => <span className="text-[12px] text-muted-foreground">{u.email}</span> },
    { key: "total", label: "Événements", sortValue: (u) => u.weddings_total, render: (u) => u.weddings_total, align: "right" },
    {
      key: "published",
      label: "Publiés",
      sortValue: (u) => u.weddings_published,
      align: "right",
      render: (u) => (
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">
          {u.weddings_published}
        </span>
      ),
    },
    {
      key: "created",
      label: "Inscription",
      sortValue: (u) => u.created_at,
      csvValue: (u) => u.created_at,
      render: (u) => (
        <span className="text-[12px] text-muted-foreground">
          {new Date(u.created_at).toLocaleDateString("fr-FR")}
        </span>
      ),
    },
    {
      key: "roles",
      label: "Rôles",
      sortValue: (u) => u.roles.join(","),
      csvValue: (u) => u.roles.join("|"),
      render: (u) =>
        u.roles.length ? (
          <div className="flex flex-wrap gap-1">
            {u.roles.map((r) => (
              <span
                key={r}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary"
              >
                <IconShieldCheck size={11} /> {r}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-[11px] text-muted-foreground">—</span>
        ),
    },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (u) => {
        const isAdmin = u.roles.includes("admin");
        return (
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <button
              onClick={() => handleSendReset(u)}
              title="Envoyer un email de réinitialisation"
              className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-white px-2.5 py-1 text-[11px] hover:bg-secondary"
            >
              <IconMail size={12} /> Lien reset
            </button>
            <button
              onClick={() => {
                setPwTarget(u);
                setNewPassword("");
              }}
              title="Définir un nouveau mot de passe"
              className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-white px-2.5 py-1 text-[11px] hover:bg-secondary"
            >
              <IconKey size={12} /> Mot de passe
            </button>
            <button
              onClick={() => handleToggleAdmin(u.id, isAdmin)}
              className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-white px-2.5 py-1 text-[11px] hover:bg-secondary"
            >
              <IconShield size={12} />
              {isAdmin ? "Retirer admin" : "Promouvoir"}
            </button>
          </div>
        );
      },
    },

  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl">Utilisateurs</h1>
        <p className="text-sm text-muted-foreground">{data?.length ?? 0} comptes au total</p>
      </div>
      <DataTable
        data={data}
        columns={columns}
        isLoading={isLoading}
        searchable={(u) =>
          `${u.email ?? ""} ${u.user_first_name ?? ""} ${u.display_name ?? ""}`
        }
        rowKey={(u) => u.id}
        filename="utilisateurs.csv"
      />

      {pwTarget ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setPwTarget(null)}
        >
          <form
            onSubmit={handleSetPassword}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-5 shadow-xl"
          >
            <div>
              <h2 className="font-serif text-lg">Nouveau mot de passe</h2>
              <p className="text-xs text-muted-foreground">{pwTarget.email}</p>
            </div>
            <input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              maxLength={128}
              autoComplete="off"
              placeholder="8 car. min, 1 majuscule, 1 minuscule, 1 chiffre"
              className="w-full rounded-xl border border-border/60 px-3 py-2 text-sm"
            />
            <p className="text-[11px] text-muted-foreground">
              Communiquez ce mot de passe à l'utilisateur et invitez-le à le changer
              depuis son profil.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPwTarget(null)}
                className="rounded-full border border-border/60 px-3 py-1.5 text-xs"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-primary px-3 py-1.5 text-xs text-primary-foreground disabled:opacity-50"
              >
                {saving ? "Enregistrement…" : "Mettre à jour"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>

  );
}
