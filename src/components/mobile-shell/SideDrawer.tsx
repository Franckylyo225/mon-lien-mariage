import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  IconHome,
  IconCalendarEvent,
  IconUsers,
  IconEye,
  IconBook2,
  IconUser,
  IconCalendarHeart,
  IconReceipt,
  IconHelpCircle,
  IconMessageCircle,
  IconLogout,
  IconX,
  IconChevronRight,
} from "@tabler/icons-react";
import { supabase } from "@/integrations/supabase/client";
import { useWedding } from "@/lib/wedding-store";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
  onOpen?: () => void;
  coupleLabel: string;
  email: string | null;
  initials: string;
  onSignOut: () => void;
  userId?: string | null;
}

const SUPPORT_WHATSAPP = "https://wa.me/2250700000000";

type Item = {
  label: string;
  Icon: typeof IconUser;
  to?: string;
  href?: string;
  badge?: number;
  exact?: boolean;
};

function DrawerItem({
  item,
  active,
  onClose,
}: {
  item: Item;
  active: boolean;
  onClose: () => void;
}) {
  const inner = (
    <>
      <span className="drawer-item-icon">
        <item.Icon size={16} strokeWidth={1.75} />
      </span>
      <span className="drawer-item-label">{item.label}</span>
      {item.badge && item.badge > 0 ? (
        <span className="drawer-item-badge">{item.badge > 99 ? "99+" : item.badge}</span>
      ) : null}
      <IconChevronRight size={14} className="drawer-item-chevron" />
    </>
  );

  if (item.href) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClose}
        className="drawer-item"
      >
        {inner}
      </a>
    );
  }
  return (
    <Link
      to={item.to as "/dashboard"}
      onClick={onClose}
      className={"drawer-item" + (active ? " active" : "")}
    >
      {inner}
    </Link>
  );
}

export function SideDrawer({
  open,
  onClose,
  onOpen,
  coupleLabel,
  email,
  initials,
  onSignOut,
  userId,
}: SideDrawerProps) {
  const { couple, guests, weddings, weddingId } = useWedding();
  const [guestbookCount, setGuestbookCount] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [confirmOut, setConfirmOut] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Google avatar (fallback = initial)
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      const m = data.user?.user_metadata as { avatar_url?: string; picture?: string } | undefined;
      setAvatarUrl(m?.avatar_url ?? m?.picture ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Approved guestbook messages count
  useEffect(() => {
    if (!weddingId || !couple.hasGuestbook) {
      setGuestbookCount(0);
      return;
    }
    let cancelled = false;
    supabase
      .from("guestbook_messages")
      .select("id", { count: "exact", head: true })
      .eq("wedding_id", weddingId)
      .eq("is_approved", true)
      .then(({ count }) => {
        if (!cancelled) setGuestbookCount(count ?? 0);
      });
    return () => {
      cancelled = true;
    };
  }, [weddingId, couple.hasGuestbook, open]);

  // Esc + scroll lock
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

  // Swipe from the left edge to open, swipe left to close
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let tracking = false;
    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      startX = t.clientX;
      startY = t.clientY;
      tracking = open ? startX < 320 : startX < 24;
    };
    const onEnd = (e: TouchEvent) => {
      if (!tracking) return;
      tracking = false;
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - startX;
      const dy = Math.abs(t.clientY - startY);
      if (dy > 60) return;
      if (!open && dx > 60) onOpen?.();
      if (open && dx < -60) onClose();
    };
    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchend", onEnd);
    };
  }, [open, onOpen, onClose]);

  const weddingItems: Item[] = [
    { label: "Tableau de bord", Icon: IconHome, to: "/dashboard", exact: true },
    { label: "Programme", Icon: IconCalendarEvent, to: "/dashboard/ceremonies" },
    { label: "Invités", Icon: IconUsers, to: "/dashboard/guests", badge: guests.length },
    { label: "Ma page d'invitation", Icon: IconEye, to: "/dashboard/preview" },
    ...(couple.hasGuestbook
      ? [
          {
            label: "Livre d'or",
            Icon: IconBook2,
            to: "/app/guestbook",
            badge: guestbookCount,
          } as Item,
        ]
      : []),
  ];

  const accountItems: Item[] = [
    { label: "Mon profil", Icon: IconUser, to: "/app/profile" },
    {
      label: "Mes événements",
      Icon: IconCalendarHeart,
      to: "/dashboard/events",
      badge: weddings.length > 1 ? weddings.length : 0,
    },
    { label: "Paiement & facture", Icon: IconReceipt, to: "/dashboard/billing" },
  ];

  const helpItems: Item[] = [
    { label: "FAQ", Icon: IconHelpCircle, to: "/app/help" },
    { label: "Support", Icon: IconMessageCircle, to: "/app/support" },
  ];

  const isActive = (it: Item) =>
    !!it.to && (it.exact ? pathname === it.to : pathname === it.to || pathname.startsWith(it.to + "/"));

  const renderSection = (label: string, items: Item[], first?: boolean) => (
    <div style={{ paddingTop: first ? 0 : 16 }}>
      <p className="drawer-section-label">{label}</p>
      {items.map((it) => (
        <DrawerItem key={it.label} item={it} active={isActive(it)} onClose={onClose} />
      ))}
    </div>
  );

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        className={"drawer-backdrop" + (open ? " open" : "")}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        className={"drawer-panel" + (open ? " open" : "")}
      >
        <div className="drawer-profile">
          <button
            onClick={onClose}
            aria-label="Fermer le menu"
            className="absolute right-3 top-11 grid size-8 place-items-center rounded-full text-muted-foreground transition active:scale-95"
          >
            <IconX size={18} />
          </button>
          <span className="drawer-avatar">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="size-full rounded-full object-cover" />
            ) : (
              initials.slice(0, 1)
            )}
          </span>
          <p className="drawer-couple">{coupleLabel}</p>
          {email ? <p className="drawer-email">{email}</p> : null}
        </div>

        <div className="drawer-body">
          {renderSection("Mon mariage", weddingItems, true)}
          {renderSection("Mon compte", accountItems)}
          {renderSection("Aide", helpItems)}
        </div>

        <div className="drawer-footer">
          <button onClick={() => setConfirmOut(true)} className="drawer-signout">
            <IconLogout size={16} />
            <span>Se déconnecter</span>
          </button>
        </div>
      </aside>

      <AlertDialog open={confirmOut} onOpenChange={setConfirmOut}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Voulez-vous vous déconnecter ?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous devrez vous reconnecter pour accéder à votre espace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmOut(false);
                onClose();
                onSignOut();
              }}
            >
              Se déconnecter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
