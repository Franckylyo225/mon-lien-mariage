import { Link, useRouterState } from "@tanstack/react-router";
import { House, Calendar, Users, UsersRound, Eye, type LucideIcon } from "lucide-react";

interface Tab {
  to: string;
  label: string;
  Icon: LucideIcon;
  IconActive: LucideIcon;
  exact?: boolean;
}

interface BottomNavProps {
  isPublished?: boolean;
}

export function BottomNav({ isPublished }: BottomNavProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const tabs: Tab[] = [
    { to: "/dashboard", label: "Accueil", Icon: House, IconActive: House, exact: true },
    { to: "/dashboard/ceremonies", label: "Programme", Icon: Calendar, IconActive: Calendar },
    { to: "/dashboard/guests", label: "Invités", Icon: Users, IconActive: UsersRound },
    { to: "/dashboard/preview", label: "Ma page", Icon: Eye, IconActive: Eye },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex h-16 max-w-xl items-stretch justify-around px-1">
        {tabs.map((t) => {
          const active = t.exact ? pathname === t.to : pathname === t.to || pathname.startsWith(t.to + "/");
          const I = active ? t.IconActive : t.Icon;
          return (
            <li key={t.to} className="flex-1">
              <Link
                to={t.to}
                className="flex h-full min-h-11 flex-col items-center justify-center gap-1 rounded-lg transition active:scale-95"
              >
                <I
                  size={t.label === "Programme" ? 26 : 22}
                  strokeWidth={active ? 2 : 1.6}
                  fill={active ? "currentColor" : "none"}
                  className={active ? "text-primary" : "text-muted-foreground"}
                />
                <span
                  className={
                    "text-[10px] leading-none " +
                    (active ? "font-medium text-primary" : "text-muted-foreground")
                  }
                >
                  {t.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
