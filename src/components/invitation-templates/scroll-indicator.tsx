import { ChevronDown } from "lucide-react";

export function ScrollIndicator({ accent }: { accent?: string }) {
  return (
    <div className="mt-6 flex flex-col items-center gap-1">
      <span
        className="font-mono text-[9px] uppercase tracking-[0.3em] opacity-50"
        style={{ color: accent }}
      >
        Scrollez vers le bas
      </span>
      <ChevronDown
        className="size-4 animate-[scrollBounce_1.8s_ease-in-out_infinite]"
        style={{ color: accent, opacity: 0.5 }}
      />
    </div>
  );
}
