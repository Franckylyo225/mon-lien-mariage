import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useWedding } from "@/lib/wedding-store";
import { componentForTheme } from "@/components/invitation-templates";
import { TemplateRsvpForm } from "@/components/invitation-templates/rsvp-form";
import { PreviewEditor } from "@/components/editor/PreviewEditor";
import { useEditMode } from "@/lib/edit-mode";
import { usePageChrome } from "@/lib/page-chrome";
import { useAutosaveContext } from "@/lib/autosave-context";
import { cn } from "@/lib/utils";
import { applyThemeVars, resolveTheme } from "@/lib/wedding-theme";
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
  const { setCenterNode, setActionBarNode } = usePageChrome();
  const { status: saveStatus } = useAutosaveContext();
  const navigate = useNavigate();
  const { sheet: initialSheetParam } = Route.useSearch();

  // Auto-enter edit mode when a sheet is requested via URL.
  useEffect(() => {
    if (initialSheetParam) setMode("edit");
  }, [initialSheetParam, setMode]);

  const [isPublishing, setIsPublishing] = useState(false);

  const resolved = useMemo(
    () => resolveTheme(couple),
    [couple.theme, couple.accentColor, couple.backgroundBase, couple.accent],
  );
  useEffect(() => {
    if (typeof document === "undefined") return;
    applyThemeVars(document.documentElement, resolved);
  }, [resolved]);

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
    setCenterNode(<PageStatusPill status={status} />);
    setActionBarNode(
      <PageActionBar
        mode={mode}
        isPublished={couple.isPublished}
        isPublishing={isPublishing}
        saveStatus={saveStatus}
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
    saveStatus,
    toggle,
    navigate,
    setCenterNode,
    setActionBarNode,
  ]);

  const coupleTheme = { ...couple, accent: resolved.accent };
  const Template = componentForTheme(coupleTheme.theme);

  return (
    <div className="relative -mx-4 -my-8 sm:-mx-8">
      <div
        className={cn(
          "mt-4 transition-all",
          mode === "edit" && "pb-40 [&_[data-editable]]:preview-editable",
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
    </div>
  );
}
