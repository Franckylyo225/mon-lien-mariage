import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { IconShieldCheck, IconShield } from "@tabler/icons-react";
import { listAllUsers, setUserRole } from "@/lib/admin.functions";
import { DataTable, type Column } from "@/components/admin/DataTable";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

type Row = Awaited<ReturnType<typeof listAllUsers>>[number];

function AdminUsers() {
  const fetchUsers = useServerFn(listAllUsers);
  const toggleRole = useServerFn(setUserRole);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => fetchUsers(),
  });

  async function handleToggleAdmin(userId: string, isAdmin: boolean) {
    if (!confirm(isAdmin ? "Retirer les droits admin ?" : "Accorder les droits admin ?")) return;
    await toggleRole({ data: { userId, role: "admin", grant: !isAdmin } });
    qc.invalidateQueries({ queryKey: ["admin", "users"] });
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
          <button
            onClick={() => handleToggleAdmin(u.id, isAdmin)}
            className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-white px-2.5 py-1 text-[11px] hover:bg-secondary"
          >
            <IconShield size={12} />
            {isAdmin ? "Retirer admin" : "Promouvoir"}
          </button>
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
    </div>
  );
}
