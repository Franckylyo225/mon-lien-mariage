import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useWedding, type TemplateId } from "@/lib/wedding-store";
import { templateComponents, templateRsvpTone } from "@/components/invitation-templates";
import { TemplateRsvpForm } from "@/components/invitation-templates/rsvp-form";
import { templateMeta, templateOrder } from "@/lib/ceremony-meta";

export const Route = createFileRoute("/invitation")({
  head: () => ({
    meta: [
      { title: "Invitation — MonMariage.ci" },
      {
        name: "description",
        content:
          "Aperçu d'une invitation MonMariage.ci. Basculez entre les modèles pour choisir votre style.",
      },
    ],
  }),
  component: InvitationPage,
});

function InvitationPage() {
  const { couple, ceremonies } = useWedding();
  const [preview, setPreview] = useState<TemplateId>(couple.templateId);
  const Template = templateComponents[preview];

  return (
    <div className="relative">
      {/* Top bar */}
      <div className="sticky top-0 z-30 border-b border-black/5 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/"
              className="shrink-0 font-serif text-sm italic text-foreground"
            >
              ← MonMariage<span className="text-primary">.ci</span>
            </Link>
            <span className="hidden text-xs opacity-40 sm:inline">·</span>
            <p className="hidden truncate font-mono text-[10px] uppercase tracking-widest opacity-60 sm:block">
              Aperçu du modèle — {templateMeta[preview].label}
            </p>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {templateOrder.map((t) => {
              const active = t === preview;
              return (
                <button
                  key={t}
                  onClick={() => setPreview(t)}
                  className={
                    "shrink-0 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition " +
                    (active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-foreground/70 hover:bg-accent/20")
                  }
                >
                  {templateMeta[t].label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <Template
        couple={couple}
        ceremonies={ceremonies}
        rsvpSlot={<TemplateRsvpForm tone={templateRsvpTone[preview]} ceremonies={ceremonies} />}
      />
    </div>
  );
}
