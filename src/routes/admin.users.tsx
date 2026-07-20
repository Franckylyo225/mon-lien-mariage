import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { IconSearch, IconShieldCheck, IconShield } from "@tabler/icons-react";
import { listAllUsers, setUserRole } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

function AdminUsers() {
  const fetchUsers = useServerFn(listAllUsers);
  const toggleRole = useServerFn(setUserRole);
  const qc = useQueryClient();
  const [q, setQ] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => fetchUsers(),
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    const s = q.trim().toLowerCase();
    if (!s) return data;
    return data.filter(
      (u) =>
        (u.email ?? "").toLowerCase().includes(s) ||
        (u.user_first_name ?? "").toLowerCase().includes(s) ||
        (u.display_name ?? "").toLowerCase().includes(s),
    );
  }, [data, q]);

  async function handleToggleAdmin(userId: string, isAdmin: boolean) {
    if (!confirm(isAdmin ? "Retirer les droits admin ?" : "Accorder les droits admin ?")) return;
    await toggleRole({ data: { userId, role: "admin", grant: !isAdmin } });
    qc.invalidateQueries({ queryKey: ["admin", "users"] });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl">Utilisateurs</h1>
          <p className="text-sm text-muted-foreground">
            {data?.length ?? 0} comptes au total
          </p>
        </div>
        <div className="relative">
          <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher…"
            className="rounded-full border border-border/60 bg-white py-1.5 pl-8 pr-3 text-sm"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Utilisateur</th>
              <th className="px-4 py-3">Événements</th>
              <th className="px-4 py-3">Publiés</th>
              <th className="px-4 py-3">Inscription</th>
              <th className="px-4 py-3">Rôles</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                  Chargement…
                </td>
              </tr>
            )}
            {filtered.map((u) => {
              const isAdmin = u.roles.includes("admin");
              return (
                <tr key={u.id} className="hover:bg-neutral-50/60">
                  <td className="px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {u.user_first_name || u.display_name || "—"}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">{u.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">{u.weddings_total}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">
                      {u.weddings_published}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3">
                    {isAdmin ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                        <IconShieldCheck size={12} /> Admin
                      </span>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleToggleAdmin(u.id, isAdmin)}
                      className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2.5 py-1 text-[11px] hover:bg-secondary"
                    >
                      <IconShield size={12} />
                      {isAdmin ? "Retirer admin" : "Promouvoir"}
                    </button>
                  </td>
                </tr>
              );
            })}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                  Aucun utilisateur.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
