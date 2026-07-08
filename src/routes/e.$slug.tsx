import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useWedding } from "@/lib/wedding-store";
import { templateComponents, templateRsvpTone } from "@/components/invitation-templates";
import { TemplateRsvpForm } from "@/components/invitation-templates/rsvp-form";
import { EnvelopeAnimation } from "@/components/envelope-animation";

export const Route = createFileRoute("/e/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Invitation — ${params.slug}` },
      {
        name: "description",
        content:
          "Vous êtes convié·e à célébrer un mariage. Découvrez les cérémonies et confirmez votre présence.",
      },
      { property: "og:title", content: "Vous êtes convié·e" },
      {
        property: "og:description",
        content: "Une invitation MonMariage.ci — cliquez pour découvrir.",
      },
    ],
  }),
  component: PublicInvitationPage,
  notFoundComponent: NotFound,
});

function PublicInvitationPage() {
  const { slug } = Route.useParams();
  const { couple, ceremonies } = useWedding();
  const [hydrated, setHydrated] = useState(false);
  const [animPlayed, setAnimPlayed] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Attend l'hydratation localStorage avant de juger l'accessibilité
  if (!hydrated) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-40">
          Chargement…
        </p>
      </div>
    );
  }

  const accessible = couple.isPublished && couple.slug === slug;
  if (!accessible) {
    throw notFound();
  }

  const Template = templateComponents[couple.templateId];

  return (
    <div className="relative">
      {couple.hasEnvelopeAnimation && !animPlayed ? (
        <EnvelopeAnimation
          brideName={couple.brideName}
          groomName={couple.groomName}
          onDone={() => setAnimPlayed(true)}
        />
      ) : null}
      <Template
        couple={couple}
        ceremonies={ceremonies}
        rsvpSlot={<TemplateRsvpForm tone={templateRsvpTone[couple.templateId]} />}
      />
    </div>
  );
}

function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-6 text-center">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
          404
        </p>
        <h1 className="mt-3 font-serif text-4xl italic">Invitation introuvable</h1>
        <p className="mt-3 max-w-sm text-sm opacity-70">
          Cette invitation n'existe pas ou n'a pas encore été publiée. Vérifiez
          le lien reçu de la part des mariés.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block font-mono text-[10px] uppercase tracking-widest opacity-60 hover:opacity-100"
        >
          ← Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
