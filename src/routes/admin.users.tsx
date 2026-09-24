import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  IconBan,
  IconCheck,
  IconDotsVertical,
  IconKey,
  IconMail,
  IconShield,
  IconShieldCheck,
  IconTrash,
} from "@tabler/icons-react";

const WHATSAPP_BUSINESS_NUMBER = "2250718525502";

function whatsappBusinessUrl(userEmail?: string | null) {
  const message = userEmail
    ? `Bonjour, je souhaite échanger au sujet du compte MonInvit : ${userEmail}`
    : "Bonjour, je souhaite échanger avec l'équipe MonInvit.";
  return `https://wa.me/${WHATSAPP_BUSINESS_NUMBER}?text=${encodeURIComponent(message)}`;
}
import { toast } from "sonner";
import {
  listAllUsers,
  setUserRole,
  sendPasswordResetEmail,
  adminSetUserPassword,
  adminSetUserDisabled,
  adminDeleteUser,
} from "@/lib/admin.functions";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

type Row = Awaited<ReturnType<typeof listAllUsers>>[number];

function AdminUsers() {
  const fetchUsers = useServerFn(listAllUsers);
  const toggleRole = useServerFn(setUserRole);
  const sendReset = useServerFn(sendPasswordResetEmail);
  const setPassword = useServerFn(adminSetUserPassword);
  const setDisabled = useServerFn(adminSetUserDisabled);
  const deleteUser = useServerFn(adminDeleteUser);
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

  async function handleDisabled(u: Row) {
    const action = u.is_disabled ? "réactiver" : "désactiver";
    if (!confirm(`Voulez-vous ${action} le compte ${u.email ?? "de cet utilisateur"} ?`)) return;
    try {
      await setDisabled({ data: { userId: u.id, disabled: !u.is_disabled } });
      toast.success(u.is_disabled ? "Compte réactivé." : "Compte désactivé.");
      await qc.invalidateQueries({ queryKey: ["admin", "users"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action impossible");
    }
  }

  async function handleDelete(u: Row) {
    if (!confirm(`Supprimer définitivement le compte ${u.email ?? "de cet utilisateur"} et ses données ?`)) return;
    if (!confirm("Cette action est irréversible. Confirmer la suppression définitive ?")) return;
    try {
      await deleteUser({ data: { userId: u.id } });
      toast.success("Compte supprimé.");
      await qc.invalidateQueries({ queryKey: ["admin", "users"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Suppression impossible");
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
      key: "status",
      label: "Statut",
      sortValue: (u) => (u.is_disabled ? "0" : u.email_confirmed_at ? "2" : "1"),
      csvValue: (u) =>
        u.is_disabled
          ? "Désactivé"
          : !u.auth_status_available
            ? "Indisponible"
            : u.email_confirmed_at
              ? "Confirmé"
              : "Non confirmé",
      render: (u) => {
        if (u.is_disabled) {
          return <span className="rounded-full bg-destructive/10 px-2 py-1 text-[11px] text-destructive">Désactivé</span>;
        }
        if (!u.auth_status_available) {
          return <span className="rounded-full bg-muted px-2 py-1 text-[11px] text-muted-foreground">Indisponible</span>;
        }
        return u.email_confirmed_at ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] text-emerald-700">
            <IconCheck size={12} /> Confirmé
          </span>
        ) : (
          <span className="rounded-full bg-amber-50 px-2 py-1 text-[11px] text-amber-700">Non confirmé</span>
        );
      },
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`Actions pour ${u.email ?? "cet utilisateur"}`}>
                <IconDotsVertical size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onSelect={() => void handleSendReset(u)}>
                <IconMail /> Envoyer un lien reset
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => window.open(whatsappBusinessUrl(u.email), "_blank", "noopener,noreferrer")}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-4"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
                Contacter via WhatsApp
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  setPwTarget(u);
                  setNewPassword("");
                }}
              >
                <IconKey /> Définir le mot de passe
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => void handleToggleAdmin(u.id, isAdmin)}>
                <IconShield /> {isAdmin ? "Retirer le rôle admin" : "Promouvoir admin"}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => void handleDisabled(u)}>
                <IconBan /> {u.is_disabled ? "Réactiver le compte" : "Désactiver le compte"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => void handleDelete(u)}
                className="text-destructive focus:text-destructive"
              >
                <IconTrash /> Supprimer définitivement
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
