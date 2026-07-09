import { createFileRoute, Link } from "@tanstack/react-router";
import { useWedding } from "@/lib/wedding-store";
import { templateComponents, templateRsvpTone } from "@/components/invitation-templates";
import { TemplateRsvpForm } from "@/components/invitation-templates/rsvp-form";

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

  return (
    <div className="relative -mx-4 -my-8 sm:-mx-8">
      {/* Bandeau sticky "Aperçu privé" */}
      <div className="sticky top-0 z-20 mx-auto -mt-4 flex max-w-2xl items-center justify-between gap-2 rounded-b-xl border-x border-b border-primary/20 bg-primary/10 px-3 py-1.5 backdrop-blur sm:top-[72px] sm:mt-0 sm:gap-3 sm:rounded-full sm:border sm:px-4 sm:py-2 sm:shadow-sm">
        <div className="flex items-center gap-2">
          <span className="grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground sm:size-6">
            👁
          </span>
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
              Aperçu privé
            </p>
            <p className="hidden truncate text-[11px] opacity-70 sm:block">
              Cette page n'est pas encore visible par vos invités.
            </p>
          </div>
        </div>
        <Link
          to="/publish"
          className="shrink-0 rounded-full bg-primary px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-primary-foreground transition hover:opacity-90 sm:px-3 sm:py-1.5"
        >
          Publier
        </Link>
      </div>

      <div className="mt-4">
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
    </div>
  );
}
