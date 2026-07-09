import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getPublicWedding } from "@/lib/public-wedding.functions";
import { templateComponents, templateRsvpTone } from "@/components/invitation-templates";
import { TemplateRsvpForm } from "@/components/invitation-templates/rsvp-form";
import { EnvelopeAnimation } from "@/components/envelope-animation";
import type { Ceremony, Couple, EventType, TemplateId, ThemeId } from "@/lib/wedding-store";

const publicWeddingQuery = (slug: string) =>
  queryOptions({
    queryKey: ["public-wedding", slug],
    queryFn: () => getPublicWedding({ data: { slug } }),
    staleTime: 30_000,
  });

export const Route = createFileRoute("/e/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Invitation — ${params.slug}` },
      {
        name: "description",
        content:
          "Vous êtes convié·e à célébrer un mariage. Découvrez les étapes et confirmez votre présence.",
      },
      { property: "og:title", content: "Vous êtes convié·e" },
      {
        property: "og:description",
        content: "Une invitation MonMariage.ci — cliquez pour découvrir.",
      },
    ],
  }),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(publicWeddingQuery(params.slug)),
  component: PublicInvitationPage,
  notFoundComponent: NotFound,
  errorComponent: () => <NotFound />,
});

function PublicInvitationPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(publicWeddingQuery(slug));
  const [animPlayed, setAnimPlayed] = useState(false);

  if (!data.wedding) throw notFound();

  const w = data.wedding;
  const couple: Couple = {
    brideName: w.bride_name,
    groomName: w.groom_name,
    weddingDate: w.wedding_date ?? "",
    city: w.city ?? "Abidjan",
    introMessage: w.intro_message ?? "",
    coupleStory: w.couple_story ?? undefined,
    heroImageUrl: w.hero_image_url ?? undefined,
    templateId: (w.template_id as TemplateId) ?? "terracotta",
    theme: (w.theme as ThemeId) ?? "rose-elegance",
    accent: w.accent ?? undefined,
    hashtag: w.hashtag ?? undefined,
    slug: w.slug ?? undefined,
    isPublished: true,
    isLocked: true,
    hasEnvelopeAnimation: !!w.has_envelope_animation,
  };

  const ceremonies: Ceremony[] = (data.ceremonies ?? []).map((c) => ({
    id: c.id,
    type: (c.type as Ceremony["type"]) ?? "autre",
    label: c.label ?? "",
    name: c.name ?? "",
    date: c.date ?? "",
    timeStart: c.time_start ?? "",
    timeEnd: c.time_end ?? undefined,
    venue: c.venue ?? "",
    mapsUrl: c.maps_url ?? undefined,
    dressCode: c.dress_code ?? undefined,
    color: c.color ?? "#993556",
    capacity: c.capacity ?? undefined,
    notes: c.notes ?? undefined,
    program: Array.isArray(c.program) ? (c.program as unknown as Ceremony["program"]) : [],
    status: (c.status as Ceremony["status"]) ?? "publiée",
    publicSlug: c.public_slug ?? "",
  }));

  const Template = templateComponents[couple.templateId];

  return (
    <div className="relative" data-theme={couple.theme}>
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
        rsvpSlot={
          <TemplateRsvpForm
            tone={templateRsvpTone[couple.templateId]}
            weddingId={w.id}
            ceremonies={ceremonies}
          />
        }
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
