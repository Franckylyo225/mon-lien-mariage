import { Drawer } from "vaul";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  actionLabel = "Terminer",
  onAction,
}: BottomSheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Drawer.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[85vh] w-full max-w-xl flex-col rounded-t-3xl border border-b-0 border-border bg-background outline-none",
          )}
        >
          <Drawer.Title className="sr-only">{title}</Drawer.Title>
          {description ? (
            <Drawer.Description className="sr-only">{description}</Drawer.Description>
          ) : null}

          <div className="flex items-center justify-center pt-3">
            <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
          </div>

          <header className="flex items-center justify-between px-5 pb-3 pt-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-50">
                Modifier
              </p>
              <h2 className="font-serif text-xl">{title}</h2>
            </div>
            <button
              type="button"
              onClick={() => {
                onAction?.();
                onOpenChange(false);
              }}
              className="rounded-full bg-foreground px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-background transition hover:opacity-90"
            >
              {actionLabel}
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-5 pb-8 pt-2">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
