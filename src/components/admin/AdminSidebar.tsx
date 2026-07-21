import { Link, useRouterState } from "@tanstack/react-router";
import {
  IconLayoutDashboard,
  IconUsers,
  IconCalendarHeart,
  IconCash,
  IconMail,
  IconActivity,
  IconSettings,
  IconArrowLeft,
} from "@tabler/icons-react";
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

type Item = { to: string; label: string; Icon: typeof IconUsers; exact?: boolean };

const analytics: Item[] = [
  { to: "/admin", label: "Vue d'ensemble", Icon: IconLayoutDashboard, exact: true },
  { to: "/admin/activity", label: "Activité", Icon: IconActivity },
];
const growth: Item[] = [
  { to: "/admin/users", label: "Utilisateurs", Icon: IconUsers },
  { to: "/admin/weddings", label: "Événements", Icon: IconCalendarHeart },
];
const finance: Item[] = [{ to: "/admin/payments", label: "Paiements", Icon: IconCash }];
const system: Item[] = [
  { to: "/admin/emails", label: "Emails", Icon: IconMail },
  { to: "/admin/settings", label: "Paramètres", Icon: IconSettings },
];

function Section({ label, items, pathname }: { label: string; items: Item[]; pathname: string }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((it) => {
            const active = it.exact ? pathname === it.to : pathname === it.to || pathname.startsWith(it.to + "/");
            return (
              <SidebarMenuItem key={it.to}>
                <SidebarMenuButton asChild isActive={active}>
                  <Link to={it.to as "/admin"} className="flex items-center gap-2">
                    <it.Icon size={16} />
                    <span>{it.label}</span>
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
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <span className="grid size-7 place-items-center rounded-full bg-primary/10 font-serif text-sm italic text-primary">
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
        <Section label="Système" items={system} pathname={pathname} />
      </SidebarContent>
      <SidebarFooter>
        <div className="space-y-2 px-2 pb-2 text-[11px] text-muted-foreground group-data-[collapsible=icon]:hidden">
          {email && <p className="truncate">{email}</p>}
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-secondary"
          >
            <IconArrowLeft size={12} /> Retour à l'app
          </Link>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
