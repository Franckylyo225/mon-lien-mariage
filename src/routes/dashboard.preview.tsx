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
      <div className="sticky top-[110px] z-20 mx-auto flex max-w-2xl items-center justify-between gap-3 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 shadow-sm backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="grid size-6 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            👁
          </span>
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
              Aperçu privé
            </p>
            <p className="truncate text-[11px] opacity-70">
              Cette page n'est pas encore visible par vos invités.
            </p>
          </div>
        </div>
        <Link
          to="/publish"
          className="shrink-0 rounded-full bg-primary px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-primary-foreground transition hover:opacity-90"
        >
          Publier
        </Link>
      </div>

      <div className="mt-4">
        <Template
          couple={couple}
          ceremonies={ceremonies}
          rsvpSlot={<TemplateRsvpForm tone={templateRsvpTone[couple.templateId]} />}
        />
      </div>
    </div>
  );
}
