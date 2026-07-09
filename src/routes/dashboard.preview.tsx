import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useWedding } from "@/lib/wedding-store";
import { templateComponents, templateRsvpTone } from "@/components/invitation-templates";
import { TemplateRsvpForm } from "@/components/invitation-templates/rsvp-form";
import { PreviewEditor } from "@/components/editor/PreviewEditor";
import { useEditMode } from "@/lib/edit-mode";
import { cn } from "@/lib/utils";
import { applyThemeVars, resolveTheme } from "@/lib/wedding-theme";

export const Route = createFileRoute("/dashboard/preview")({
  head: () => ({
    meta: [
      { title: "Aperçu privé — MonMariage.ci" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PreviewPage,
});

function PreviewPage() {
  const { couple, ceremonies, weddingId } = useWedding();
  const Template = templateComponents[couple.templateId];
  const { mode, toggle } = useEditMode();

  return (
    <div className="relative -mx-4 -my-8 sm:-mx-8">
      {/* Sticky banner */}
      <div
        className={cn(
          "sticky top-14 z-20 mx-auto flex max-w-2xl items-center justify-between gap-2 rounded-b-xl border-x border-b px-3 py-1.5 backdrop-blur sm:top-[72px] sm:-mt-4 sm:gap-3 sm:rounded-full sm:border sm:px-4 sm:py-2 sm:shadow-sm transition-colors",
          mode === "edit"
            ? "border-muted bg-muted/80"
            : "border-primary/20 bg-primary/10",
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "grid size-5 place-items-center rounded-full text-[10px] font-bold sm:size-6",
              mode === "edit"
                ? "bg-foreground text-background"
                : "bg-primary text-primary-foreground",
            )}
          >
            {mode === "edit" ? "✎" : "👁"}
          </span>
          <div className="min-w-0">
            <p
              className={cn(
                "font-mono text-[10px] uppercase tracking-widest",
                mode === "edit" ? "text-foreground" : "text-primary",
              )}
            >
              {mode === "edit" ? "Mode édition" : "Aperçu privé"}
            </p>
            <p className="hidden truncate text-[11px] opacity-70 sm:block">
              {mode === "edit"
                ? "Vos modifications sont enregistrées automatiquement."
                : "Cette page n'est pas encore visible par vos invités."}
            </p>
          </div>
        </div>
        {mode === "preview" && (
          <Link
            to="/publish"
            className="shrink-0 rounded-full bg-primary px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-primary-foreground transition hover:opacity-90 sm:px-3 sm:py-1.5"
          >
            Publier
          </Link>
        )}
      </div>

      <div
        className={cn(
          "mt-4 transition-all",
          mode === "edit" && "pb-40 [&_[data-editable]]:outline-dashed",
        )}
      >
        <Template
          couple={couple}
          ceremonies={ceremonies}
          rsvpSlot={
            <TemplateRsvpForm
              tone={templateRsvpTone[couple.templateId]}
              weddingId={couple.isPublished && weddingId ? weddingId : undefined}
              ceremonies={ceremonies}
            />
          }
        />
      </div>

      <PreviewEditor
        mode={mode}
        onToggle={toggle}
      />
    </div>
  );
}
