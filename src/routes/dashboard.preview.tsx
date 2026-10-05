import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useWedding } from "@/lib/wedding-store";
import { componentForTheme } from "@/components/invitation-templates";
import { TemplateRsvpForm } from "@/components/invitation-templates/rsvp-form";
import { PreviewEditor } from "@/components/editor/PreviewEditor";
import { useEditMode } from "@/lib/edit-mode";
import { usePageChrome } from "@/lib/page-chrome";
import { cn } from "@/lib/utils";
import { ThemeRoot, useResolvedTheme } from "@/components/theme/ThemeRoot";
import { ParticleCanvas } from "@/components/particles/ParticleCanvas";
import type {
  ParticleColorMode,
  ParticleIntensity,
  ParticleSize,
  ParticleSlug,
} from "@/lib/particles/types";
import {
  PageStatusPill,
  type PageStatus,
} from "@/components/dashboard/PageStatusPill";
import { PageActionBar } from "@/components/dashboard/PageActionBar";
import { PageEditDoneButton } from "@/components/dashboard/PageEditDoneButton";

export const Route = createFileRoute("/dashboard/preview")({
  validateSearch: (search: Record<string, unknown>) => ({
    sheet: typeof search.sheet === "string" ? (search.sheet as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Aperçu privé — MonInvit.com" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PreviewPage,
});

function PreviewPage() {
  const { couple, ceremonies, weddingId } = useWedding();
  const { mode, toggle, setMode } = useEditMode();
  const { setCenterNode, setActionBarNode, setOptions } = usePageChrome();
  const navigate = useNavigate();
  const { sheet: initialSheetParam } = Route.useSearch();

  // Auto-enter edit mode when a sheet is requested via URL.
  useEffect(() => {
    if (initialSheetParam) setMode("edit");
  }, [initialSheetParam, setMode]);

  // Immersive chrome: no tab bar, and the header avatar becomes a way out.
  // Edit mode lives on the dashboard layout, so leaving without clearing it
  // would strip the tab bar off whatever route comes next.
  useEffect(() => {
    setOptions({
      hideBottomNav: true,
      backTo: "/dashboard",
      backLabel: "Retour au tableau de bord",
    });
    return () => {
      setOptions({});
      setMode("preview");
    };
  }, [setOptions, setMode]);

  const [isPublishing, setIsPublishing] = useState(false);

  const resolved = useResolvedTheme(couple);

  // Derive the status pill from mode + publish state.
  const status: PageStatus = isPublishing
    ? "publishing"
    : mode === "edit"
      ? "edit"
      : couple.isPublished
        ? "live"
        : "draft";

  // Inject header center + sticky action bar into the dashboard chrome.
  useEffect(() => {
    setCenterNode(
      <span key={status} className="animate-dock-swap inline-flex min-w-0">
        {status === "edit" ? (
          <PageEditDoneButton onDone={toggle} />
        ) : (
          <PageStatusPill status={status} />
        )}
      </span>,
    );
    setActionBarNode(
      <PageActionBar
        mode={mode}
        isPublished={couple.isPublished}
        isPublishing={isPublishing}
        onEditToggle={toggle}
        onPublish={() => {
          setIsPublishing(true);
          // Transitional visual, then hand off to the publish flow.
          setTimeout(() => {
            setIsPublishing(false);
            navigate({ to: "/publish" });
          }, 600);
        }}
        onShare={() => {
          navigate({ to: "/dashboard/share" });
        }}
        onView={() => {
          navigate({ to: "/dashboard/vue" });
        }}
      />,
    );
    return () => {
      setCenterNode(null);
      setActionBarNode(null);
    };
  }, [
    status,
    mode,
    couple.isPublished,
    isPublishing,
    toggle,
    navigate,
    setCenterNode,
    setActionBarNode,
  ]);

  const coupleTheme = { ...couple, accent: resolved.accent };
  const Template = componentForTheme(coupleTheme.theme);

  return (
    <ThemeRoot couple={couple} className="relative -mx-4 -my-8 sm:-mx-8">
      <div
        className={cn(
          // Clears whichever bottom bar is showing — they never stack.
          "mt-4 pb-[calc(var(--page-dock-h,0px)+1.5rem)] transition-all",
          mode === "edit" && "[&_[data-editable]]:preview-editable",
        )}
      >
        <Template
          couple={coupleTheme}
          ceremonies={ceremonies}
          rsvpSlot={
            <TemplateRsvpForm
              theme={coupleTheme.theme}
              weddingId={coupleTheme.isPublished && weddingId ? weddingId : undefined}
              ceremonies={ceremonies}
            />
          }
        />
      </div>

      <PreviewEditor mode={mode} onToggle={toggle} initialSheet={initialSheetParam} />

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
    </ThemeRoot>
  );
}
