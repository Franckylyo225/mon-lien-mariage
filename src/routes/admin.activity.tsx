import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  IconUserPlus,
  IconCalendarPlus,
  IconWorldWww,
  IconUserCheck,
} from "@tabler/icons-react";
import { listActivity } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/activity")({
  component: AdminActivity,
});

const KIND = {
  signup: { Icon: IconUserPlus, tint: "bg-blue-50 text-blue-700", label: "Inscription" },
  wedding_created: { Icon: IconCalendarPlus, tint: "bg-rose-50 text-rose-700", label: "Événement" },
  wedding_published: { Icon: IconWorldWww, tint: "bg-emerald-50 text-emerald-700", label: "Publication" },
  rsvp: { Icon: IconUserCheck, tint: "bg-violet-50 text-violet-700", label: "RSVP" },
} as const;

function AdminActivity() {
  const fetch = useServerFn(listActivity);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "activity"],
    queryFn: () => fetch(),
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl">Activité</h1>
        <p className="text-sm text-muted-foreground">
          Flux temps réel des événements de la plateforme.
        </p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-white p-2 shadow-sm">
        {isLoading && <p className="p-4 text-sm text-muted-foreground">Chargement…</p>}
        {!isLoading && (data?.length ?? 0) === 0 && (
          <p className="p-4 text-sm text-muted-foreground">Aucune activité récente.</p>
        )}
        <ul className="divide-y divide-border/60">
          {(data ?? []).map((item) => {
            const meta = KIND[item.kind];
            return (
              <li key={item.id} className="flex items-start gap-3 px-3 py-2.5">
                <div className={`mt-0.5 grid size-7 place-items-center rounded-full ${meta.tint}`}>
                  <meta.Icon size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{item.label}</p>
                  {item.subtitle && (
                    <p className="truncate text-[11px] text-muted-foreground">{item.subtitle}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{meta.label}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(item.created_at).toLocaleString("fr-FR")}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
