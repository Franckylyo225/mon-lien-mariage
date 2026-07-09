import { Link, useRouterState } from "@tanstack/react-router";
import {
  IconHome,
  IconHomeFilled,
  IconCalendarEvent,
  IconCalendarFilled,
  IconUsers,
  IconUsersGroup,
  IconEye,
  IconEyeFilled,
  IconShare,
  IconShare3,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";

interface Tab {
  to: string;
  label: string;
  Icon: Icon;
  IconActive: Icon;
  exact?: boolean;
}

interface BottomNavProps {
  isPublished?: boolean;
}

export function BottomNav({ isPublished }: BottomNavProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const tabs: Tab[] = [
    { to: "/dashboard", label: "Accueil", Icon: IconHome, IconActive: IconHomeFilled, exact: true },
    { to: "/dashboard/ceremonies", label: "Étapes", Icon: IconCalendarEvent, IconActive: IconCalendarFilled },
    { to: "/dashboard/guests", label: "Invités", Icon: IconUsers, IconActive: IconUsersGroup },
    isPublished
      ? { to: "/dashboard/share", label: "Partager", Icon: IconShare, IconActive: IconShare3 }
      : { to: "/dashboard/preview", label: "Aperçu", Icon: IconEye, IconActive: IconEyeFilled },
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
                  size={22}
                  strokeWidth={active ? 2 : 1.6}
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
