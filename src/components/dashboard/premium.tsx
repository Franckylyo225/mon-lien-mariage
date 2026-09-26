import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Page heading shared by the organizer screens: gold kicker, product title, optional subtitle and actions. */
export function PageHeader({
  title,
  subtitle,
  kicker = "Espace organisateurs",
  actions,
}: {
  title: string;
  subtitle?: ReactNode;
  kicker?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="page-kicker">{kicker}</p>
        <h1 className="page-title mt-2">{title}</h1>
        {subtitle ? <p className="mt-2 text-[13px] text-muted-foreground">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

/** Round badge holding an icon (pale accent background, accent icon). */
export function IconBadge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-primary",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** "À faire" (accent) or "Prêt" (gold): the state of a setting at a glance. */
export function StatusPill({
  ready,
  todoLabel = "À faire",
  readyLabel = "Prêt",
  className,
}: {
  ready: boolean;
  todoLabel?: string;
  readyLabel?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
        ready ? "bg-champagne-light text-champagne-deep" : "bg-secondary text-primary",
        className,
      )}
    >
      {ready ? readyLabel : todoLabel}
    </span>
  );
}

/** Bordered card row: icon badge, title and description, optional trailing content (status pill, chevron…). */
export function SettingRow({
  icon,
  title,
  description,
  trailing,
}: {
  icon: ReactNode;
  title: string;
  description?: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5">
      <IconBadge>{icon}</IconBadge>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold">{title}</p>
        {description ? (
          <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {trailing}
    </div>
  );
}
