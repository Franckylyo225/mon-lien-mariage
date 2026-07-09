import { Check, Loader2, AlertCircle } from "lucide-react";
import type { SaveStatus } from "@/hooks/use-autosave";

export function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;

  const config = {
    saving: {
      icon: <Loader2 className="size-3.5 animate-spin" />,
      label: "Enregistrement…",
      cls: "bg-foreground text-background",
    },
    saved: {
      icon: <Check className="size-3.5" />,
      label: "Enregistré",
      cls: "bg-emerald-600 text-white",
    },
    error: {
      icon: <AlertCircle className="size-3.5" />,
      label: "Erreur — réessayez",
      cls: "bg-destructive text-destructive-foreground",
    },
  }[status];

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-40 flex justify-center px-4">
      <div
        className={`animate-fade-in inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] shadow-lg ${config.cls}`}
      >
        {config.icon}
        {config.label}
      </div>
    </div>
  );
}
