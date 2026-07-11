import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  IconUser,
  IconShare,
  IconChartBar,
  IconCreditCard,
  IconHelpCircle,
  IconMessageCircle,
  IconLogout,
  IconX,
  IconCalendarHeart,
  IconChevronRight,
} from "@tabler/icons-react";

interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
  coupleLabel: string;
  email: string | null;
  initials: string;
  onSignOut: () => void;
  showEventsLink?: boolean;
}

const items = [
  { label: "Profil du couple", Icon: IconUser, to: "/dashboard" as const },
  { label: "Statistiques RSVP", Icon: IconChartBar, to: "/dashboard/stats" as const },
  { label: "Liens & partages", Icon: IconShare, to: "/dashboard/share" as const },
  { label: "Paiement & facture", Icon: IconCreditCard, to: "/publish" as const },
  { label: "Aide & FAQ", Icon: IconHelpCircle, to: "/dashboard" as const },
  { label: "Contacter le support", Icon: IconMessageCircle, to: "/dashboard" as const },
];


export function SideDrawer({
  open,
  onClose,
  coupleLabel,
  email,
  initials,
  onSignOut,
  showEventsLink = false,

}: SideDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        className={
          "fixed inset-0 z-40 bg-black/35 transition-opacity duration-200 " +
          (open ? "opacity-100" : "pointer-events-none opacity-0")
        }
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        className={
          "fixed inset-y-0 left-0 z-50 flex w-[78%] max-w-sm flex-col bg-background shadow-2xl transition-transform duration-250 ease-out " +
          (open ? "translate-x-0" : "-translate-x-full")
        }
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary font-serif text-sm italic text-primary">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate font-serif text-[13px] italic">{coupleLabel}</p>
              {email ? (
                <p className="truncate text-[9px] text-muted-foreground">{email}</p>
              ) : null}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer le menu"
            className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground transition active:scale-95"
          >
            <IconX size={18} />
          </button>
        </div>

        <div className="mx-5 border-t border-border" />

        <ul className="flex-1 overflow-y-auto px-2 py-3">
          {showEventsLink ? (
            <li>
              <Link
                to="/dashboard/events"
                onClick={onClose}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-foreground transition active:bg-secondary"
              >
                <IconCalendarHeart size={18} strokeWidth={1.75} className="text-primary" />
                <span className="flex-1">Mes événements</span>
                <IconChevronRight size={14} className="text-muted-foreground" />
              </Link>
            </li>
          ) : null}
          {items.map((item) => (
            <li key={item.label}>
              <Link
                to={item.to}
                onClick={onClose}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-foreground/85 transition active:bg-secondary"
              >
                <item.Icon size={18} strokeWidth={1.75} className="text-muted-foreground" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>


        <div className="px-5 pb-6 pt-4">
          <button
            onClick={() => {
              onClose();
              onSignOut();
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-destructive transition active:bg-destructive/10"
          >
            <IconLogout size={18} strokeWidth={1.75} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
}
