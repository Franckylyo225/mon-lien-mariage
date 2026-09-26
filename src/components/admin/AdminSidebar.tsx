import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Users, CalendarHeart, Banknote, Mail, Activity, Settings, ArrowLeft, LifeBuoy, Newspaper } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSupportUnread } from "@/hooks/use-support-unread";

type Item = { to: string; label: string; Icon: typeof Users; exact?: boolean; badge?: number };

const analytics: Item[] = [
  { to: "/admin", label: "Vue d'ensemble", Icon: LayoutDashboard, exact: true },
  { to: "/admin/activity", label: "Activité", Icon: Activity },
];
const growth: Item[] = [
  { to: "/admin/users", label: "Utilisateurs", Icon: Users },
  { to: "/admin/weddings", label: "Événements", Icon: CalendarHeart },
];
const finance: Item[] = [{ to: "/admin/payments", label: "Paiements", Icon: Banknote }];
const content: Item[] = [{ to: "/admin/blog", label: "Blog", Icon: Newspaper }];
const systemItems = (supportBadge: number): Item[] => [
  { to: "/admin/support", label: "Support", Icon: LifeBuoy, badge: supportBadge },
  { to: "/admin/emails", label: "Emails", Icon: Mail },
  { to: "/admin/settings", label: "Paramètres", Icon: Settings },
];

function Section({ label, items, pathname }: { label: string; items: Item[]; pathname: string }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((it) => {
            const active = it.exact ? pathname === it.to : pathname === it.to || pathname.startsWith(it.to + "/");
            return (
              <SidebarMenuItem key={it.to}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  className="rounded-lg data-[active=true]:bg-primary/10 data-[active=true]:font-medium data-[active=true]:text-primary"
                >
                  <Link to={it.to as "/admin"} className="flex items-center gap-2.5">
                    <span
                      className={
                        "grid size-6 shrink-0 place-items-center rounded-md transition " +
                        (active ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground")
                      }
                    >
                      <it.Icon size={14} />
                    </span>
                    <span className="text-[13px]">{it.label}</span>
                    {it.badge ? (
                      <span className="ml-auto grid min-w-[18px] place-items-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground group-data-[collapsible=icon]:hidden">
                        {it.badge > 99 ? "99+" : it.badge}
                      </span>
                    ) : null}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AdminSidebar({ email }: { email?: string | null }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { count: supportUnread } = useSupportUnread("admin");
  const system = systemItems(supportUnread);
  return (
    <Sidebar collapsible="icon" className="border-r border-border/60">
      <SidebarHeader className="border-b border-border/50">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <span className="grid size-8 place-items-center rounded-xl bg-primary/10 font-serif text-sm italic text-primary">
            M
          </span>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate font-serif text-sm">MonInvit Admin</p>
            <p className="truncate text-[10px] uppercase tracking-widest text-muted-foreground">
              Console SaaS
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <Section label="Analytique" items={analytics} pathname={pathname} />
        <Section label="Croissance" items={growth} pathname={pathname} />
        <Section label="Finance" items={finance} pathname={pathname} />
        <Section label="Contenu" items={content} pathname={pathname} />
        <Section label="Système" items={system} pathname={pathname} />
      </SidebarContent>

      <SidebarFooter>
        <div className="space-y-2 px-2 pb-2 text-[11px] text-muted-foreground group-data-[collapsible=icon]:hidden">
          {email && <p className="truncate">{email}</p>}
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-secondary"
          >
            <ArrowLeft size={12} /> Retour à l'app
          </Link>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
