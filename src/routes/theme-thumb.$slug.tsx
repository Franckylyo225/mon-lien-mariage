import { createFileRoute, notFound } from "@tanstack/react-router";
import { useMemo } from "react";
import { componentForTheme } from "@/components/invitation-templates";
import { THEMES, resolveTheme } from "@/lib/wedding-theme";
import { ThemeRoot } from "@/components/theme/ThemeRoot";
import type { Ceremony, Couple, ThemeId } from "@/lib/wedding-store";

/**
 * Internal route used ONLY to generate PNG thumbnails of themes via a
 * screenshot tool. Renders a template with fixture data and no chrome.
 * Not intended to be linked from the app.
 */
export const Route = createFileRoute("/theme-thumb/$slug")({
  head: () => ({ meta: [{ title: "Theme thumbnail" }] }),
  component: ThemeThumbRoute,
});

function ThemeThumbRoute() {
  const { slug } = Route.useParams();
  if (!THEMES[slug as ThemeId]) throw notFound();
  const themeSlug = slug as ThemeId;

  const couple = useMemo<Couple>(
    () => ({
      brideName: "Aïcha",
      groomName: "Kouamé",
      weddingDate: "2027-02-14",
      rsvpDeadline: undefined,
      city: "Abidjan",
      introMessage:
        "Sous le soleil, nous scellons notre promesse. Nous vous invitons à célébrer cette union.",
      templateId: "terracotta",
      theme: themeSlug,
      caption: "Nous vous invitons à célébrer",
      isPublished: false,
      isLocked: false,
      countdownEnabled: true,
      countdownUnits: ["days", "hours", "minutes", "seconds"],
    }),
    [themeSlug],
  );

  const resolved = useMemo(() => resolveTheme(couple), [couple]);
  const themedCouple = { ...couple, accent: resolved.accent };
  const Template = componentForTheme(themeSlug);
  const ceremonies: Ceremony[] = [];

  return (
    <ThemeRoot couple={couple}>
      <Template couple={themedCouple} ceremonies={ceremonies} rsvpSlot={null} />
    </ThemeRoot>
  );
}

