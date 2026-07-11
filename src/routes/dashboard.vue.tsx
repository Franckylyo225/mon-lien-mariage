import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { IconX } from "@tabler/icons-react";
import { useWedding } from "@/lib/wedding-store";
import { componentForTheme } from "@/components/invitation-templates";
import { TemplateRsvpForm } from "@/components/invitation-templates/rsvp-form";
import { OpeningEffect, type OpeningEffectSlug } from "@/components/opening-effects";
import { ParticleCanvas, RsvpBurstOverlay } from "@/components/particles/ParticleCanvas";
import { applyThemeVars, resolveTheme, themeCssString } from "@/lib/wedding-theme";
import type {
  ParticleColorMode,
  ParticleIntensity,
  ParticleSize,
  ParticleSlug,
} from "@/lib/particles/types";

export const Route = createFileRoute("/dashboard/vue")({
  head: () => ({
    meta: [
      { title: "Vue visiteur — MonInvit.com" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FullscreenPreview,
});

function FullscreenPreview() {
  const { couple, ceremonies, weddingId } = useWedding();
  const navigate = useNavigate();
  const [animPlayed, setAnimPlayed] = useState(false);
  const [rsvpBurst, setRsvpBurst] = useState(false);

  const resolved = useMemo(
    () => resolveTheme(couple),
    [couple.theme, couple.accentColor, couple.backgroundBase, couple.accent],
  );

  useEffect(() => {
    if (typeof document === "undefined") return;
    applyThemeVars(document.documentElement, resolved);
  }, [resolved]);

  const coupleTheme = { ...couple, accent: resolved.accent };
  const Template = componentForTheme(coupleTheme.theme);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      data-theme={coupleTheme.theme}
      style={{ backgroundColor: resolved.bg }}
    >
      <style dangerouslySetInnerHTML={{ __html: `:root{${themeCssString(resolved)}}` }} />

      {!animPlayed && coupleTheme.hasOpeningEffect && coupleTheme.openingEffectSlug ? (
        <OpeningEffect
          slug={coupleTheme.openingEffectSlug as OpeningEffectSlug}
          couple={coupleTheme}
          onDone={() => setAnimPlayed(true)}
        />
      ) : !animPlayed && coupleTheme.hasEnvelopeAnimation ? (
        <OpeningEffect
          slug="envelope-royal"
          couple={coupleTheme}
          onDone={() => setAnimPlayed(true)}
        />
      ) : null}

      {animPlayed && coupleTheme.particleEffectSlug ? (
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

      <Template
        couple={coupleTheme}
        ceremonies={ceremonies}
        rsvpSlot={
          <TemplateRsvpForm
            theme={coupleTheme.theme}
            weddingId={coupleTheme.isPublished && weddingId ? weddingId : undefined}
            ceremonies={ceremonies}
            onConfirmed={() => {
              if (coupleTheme.particleTriggerRsvp !== false) setRsvpBurst(true);
            }}
          />
        }
      />

      <button
        type="button"
        onClick={() => navigate({ to: "/dashboard/preview" })}
        aria-label="Fermer la vue visiteur"
        className="fixed right-4 top-4 z-[70] inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-black/55 px-3 py-2 text-[11px] font-medium text-white backdrop-blur transition hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-[12px]"
        style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}
      >
        <IconX size={14} strokeWidth={2.5} />
        <span>Fermer</span>
      </button>
    </div>
  );
}
