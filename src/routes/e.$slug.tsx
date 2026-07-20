import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getPublicWedding } from "@/lib/public-wedding.functions";
import { componentForTheme } from "@/components/invitation-templates";
import { TemplateRsvpForm } from "@/components/invitation-templates/rsvp-form";
import { ParticleCanvas, RsvpBurstOverlay } from "@/components/particles/ParticleCanvas";
import { AmbientMusicPlayer } from "@/components/music/AmbientMusicPlayer";
import { RevealOnScroll } from "@/components/site/RevealOnScroll";
import type { BackgroundBase, Ceremony, Couple, EventType, TemplateId, ThemeId } from "@/lib/wedding-store";
import { resolveTheme } from "@/lib/wedding-theme";
import { ThemeRoot } from "@/components/theme/ThemeRoot";
import { normalizeEventType } from "@/lib/ceremony-meta";
import type {
  ParticleColorMode,
  ParticleIntensity,
  ParticleSize,
  ParticleSlug,
} from "@/lib/particles/types";

const publicWeddingQuery = (slug: string) =>
  queryOptions({
    queryKey: ["public-wedding", slug],
    queryFn: () => getPublicWedding({ data: { slug } }),
    staleTime: 30_000,
  });

export const Route = createFileRoute("/e/$slug")({
  head: ({ params, loaderData }) => {
    const w = (loaderData as { wedding?: Record<string, unknown> | null } | undefined)?.wedding;
    const bride = (w?.bride_name as string | undefined) ?? "";
    const groom = (w?.groom_name as string | undefined) ?? "";
    const names = bride && groom ? `${bride} & ${groom}` : "";
    const shareTitle =
      (w?.share_title as string | undefined) ||
      (names ? `${names} — Vous êtes convié·e` : `Invitation — ${params.slug}`);
    const shareDesc =
      (w?.share_description as string | undefined) ||
      (w?.intro_message as string | undefined) ||
      "Vous êtes convié·e à célébrer un mariage. Découvrez les étapes et confirmez votre présence.";
    const shareImage =
      (w?.share_image_url as string | undefined) ||
      (w?.hero_image_url as string | undefined) ||
      undefined;
    const url = `/e/${params.slug}`;
    const meta: Array<Record<string, string>> = [
      { title: shareTitle },
      { name: "description", content: shareDesc },
      { property: "og:title", content: shareTitle },
      { property: "og:description", content: shareDesc },
      { property: "og:type", content: "article" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: shareTitle },
      { name: "twitter:description", content: shareDesc },
    ];
    if (shareImage) {
      meta.push({ property: "og:image", content: shareImage });
      meta.push({ name: "twitter:image", content: shareImage });
    }
    return { meta, links: [{ rel: "canonical", href: url }] };
  },
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(publicWeddingQuery(params.slug)),
  component: PublicInvitationPage,
  notFoundComponent: NotFound,
  errorComponent: () => <NotFound />,
});

function PublicInvitationPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(publicWeddingQuery(slug));
  const [rsvpBurst, setRsvpBurst] = useState(false);

  if (!data.wedding) throw notFound();

  const w = data.wedding;
  const couple: Couple = {
    brideName: w.bride_name,
    groomName: w.groom_name,
    weddingDate: w.wedding_date ?? "",
    city: w.city ?? "Abidjan",
    introMessage: w.intro_message ?? "",
    coupleStory: w.couple_story ?? undefined,
    storyEnabled: (w as { story_enabled?: boolean | null }).story_enabled ?? true,
    storyTitle: (w as { story_title?: string | null }).story_title ?? undefined,
    storyBody: (w as { story_body?: string | null }).story_body ?? undefined,
    storyImages: ((w as { story_images?: string[] | null }).story_images as string[] | null) ?? [],
    storyStyle: ((w as { story_style?: Record<string, unknown> | null }).story_style as Couple["storyStyle"]) ?? {},
    galleryEnabled: (w as { gallery_enabled?: boolean | null }).gallery_enabled ?? false,
    galleryTitle: (w as { gallery_title?: string | null }).gallery_title ?? undefined,
    galleryImages: ((w as { gallery_images?: string[] | null }).gallery_images as string[] | null) ?? [],
    galleryDisplay:
      (((w as { gallery_display?: string | null }).gallery_display as Couple["galleryDisplay"]) ?? "grid"),
    heroImageUrl: w.hero_image_url ?? undefined,
    templateId: (w.template_id as TemplateId) ?? "terracotta",
    theme: (w.theme as ThemeId) ?? "rose-elegance",
    eventType: normalizeEventType((w as { event_type?: string | null }).event_type),
    accent: w.accent ?? undefined,
    accentColor: (w as { accent_color?: string | null }).accent_color ?? undefined,
    backgroundBase: ((w as { background_base?: string | null }).background_base as BackgroundBase | null) ?? undefined,
    textColor: ((w as { text_color?: string | null }).text_color as string | null) ?? undefined,

    hashtag: w.hashtag ?? undefined,
    slug: w.slug ?? undefined,
    isPublished: true,
    isLocked: true,
    contactName: (w as { contact_name?: string | null }).contact_name ?? undefined,
    contactPhone: (w as { contact_phone?: string | null }).contact_phone ?? undefined,
    contactEmail: (w as { contact_email?: string | null }).contact_email ?? undefined,
    dressCodeEnabled: (w as { dress_code_enabled?: boolean | null }).dress_code_enabled ?? false,
    dressCodeTitle: (w as { dress_code_title?: string | null }).dress_code_title ?? undefined,
    dressCodeNote: (w as { dress_code_note?: string | null }).dress_code_note ?? undefined,
    dressCodeColors:
      ((w as { dress_code_colors?: string[] | null }).dress_code_colors as string[] | null) ?? [],
    dressCodeImages:
      ((w as { dress_code_images?: string[] | null }).dress_code_images as string[] | null) ?? [],
    customInfoTitle: (w as { custom_info_title?: string | null }).custom_info_title ?? undefined,
    customInfoBody: (w as { custom_info_body?: string | null }).custom_info_body ?? undefined,
    caption: (w as { caption?: string | null }).caption ?? undefined,
    countdownEnabled:
      (w as { countdown_enabled?: boolean | null }).countdown_enabled ?? true,
    countdownUnits:
      ((w as { countdown_units?: string[] | null }).countdown_units as Couple["countdownUnits"]) ??
      ["days", "hours", "minutes", "seconds"],
    countdownStyle:
      ((w as { countdown_style?: Record<string, unknown> | null }).countdown_style as Couple["countdownStyle"]) ??
      {},
    practicalInfoEnabled:
      (w as { practical_info_enabled?: boolean | null }).practical_info_enabled ?? false,
    practicalParking:
      (w as { practical_parking?: string | null }).practical_parking ?? undefined,
    practicalAccommodation:
      (w as { practical_accommodation?: string | null }).practical_accommodation ?? undefined,
    practicalContactName:
      (w as { practical_contact_name?: string | null }).practical_contact_name ?? undefined,
    practicalContactPhone:
      (w as { practical_contact_phone?: string | null }).practical_contact_phone ?? undefined,
    registryEnabled:
      (w as { registry_enabled?: boolean | null }).registry_enabled ?? false,
    registryTitle:
      (w as { registry_title?: string | null }).registry_title ?? undefined,
    registryNote:
      (w as { registry_note?: string | null }).registry_note ?? undefined,
    registryStores:
      ((w as { registry_stores?: Array<{ name: string; url?: string }> | null }).registry_stores as Couple["registryStores"]) ??
      [],
    particleEffectSlug:
      ((w as { particle_effect_slug?: string | null }).particle_effect_slug as ParticleSlug | null) ?? null,
    particleIntensity:
      ((w as { particle_intensity?: string | null }).particle_intensity as ParticleIntensity) ?? "normal",
    particleSpeed: (w as { particle_speed?: number | null }).particle_speed ?? 1,
    particleSize:
      ((w as { particle_size?: string | null }).particle_size as ParticleSize) ?? "normal",
    particleColorMode:
      ((w as { particle_color_mode?: string | null }).particle_color_mode as ParticleColorMode) ?? "auto",
    particleTriggerOpen:
      (w as { particle_trigger_open?: boolean | null }).particle_trigger_open ?? true,
    particleTriggerLoop:
      (w as { particle_trigger_loop?: boolean | null }).particle_trigger_loop ?? false,
    particleTriggerRsvp:
      (w as { particle_trigger_rsvp?: boolean | null }).particle_trigger_rsvp ?? true,
    musicEnabled: (w as { music_enabled?: boolean | null }).music_enabled ?? false,
    musicSlug: ((w as { music_slug?: string | null }).music_slug as string | null) ?? null,
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

  const resolved = resolveTheme(couple);
  // Override couple.accent with resolved accent so templates that read couple.accent
  // reflect the user's chosen colour.
  const coupleTheme: Couple = { ...couple, accent: resolved.accent };
  const Template = componentForTheme(coupleTheme.theme);

  return (
    <ThemeRoot couple={coupleTheme} className="relative">
      {coupleTheme.particleEffectSlug ? (
        <ParticleCanvas
          config={{
            slug: coupleTheme.particleEffectSlug as ParticleSlug,
            intensity: (coupleTheme.particleIntensity ?? "normal") as ParticleIntensity,
            speed: coupleTheme.particleSpeed ?? 1,
            size: (coupleTheme.particleSize ?? "normal") as ParticleSize,
            colorMode: (coupleTheme.particleColorMode ?? "auto") as ParticleColorMode,
            accentColor: resolved.accent,
          }}
          burstOnMount={coupleTheme.particleTriggerOpen ? 24 : 0}
          loop={!!coupleTheme.particleTriggerLoop}
        />
      ) : null}

      {rsvpBurst ? (
        <RsvpBurstOverlay
          accentColor={resolved.accent}
          onDone={() => setRsvpBurst(false)}
        />
      ) : null}

      <RevealOnScroll>
        <Template
          couple={coupleTheme}
          ceremonies={ceremonies}
          rsvpSlot={
            <TemplateRsvpForm
              theme={coupleTheme.theme}
              weddingId={w.id}
              ceremonies={ceremonies}
              onConfirmed={() => {
                if (coupleTheme.particleTriggerRsvp !== false) setRsvpBurst(true);
              }}
            />
          }
        />
      </RevealOnScroll>
      <AmbientMusicPlayer slug={coupleTheme.musicSlug} enabled={coupleTheme.musicEnabled} />
    </ThemeRoot>
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
