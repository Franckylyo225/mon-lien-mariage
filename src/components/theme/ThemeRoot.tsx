import React, { useMemo } from "react";
import type { Couple } from "@/lib/wedding-store";
import { resolveTheme, themeCssVars, type ResolvedTheme } from "@/lib/wedding-theme";

type ThemeCouple = Pick<
  Couple,
  "theme" | "accentColor" | "backgroundBase" | "accent" | "textColor"
>;

interface Props {
  couple: ThemeCouple;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  /**
   * Extra data-* attributes forwarded to the wrapper (e.g. data-bg-override
   * is set automatically). Use for scoping selectors from the editor.
   */
  dataAttrs?: Record<string, string | undefined>;
}

/**
 * Single source of truth for applying wedding theme CSS variables.
 *
 * Emits `--wedding-*` custom properties as an inline style on the wrapper so
 * every descendant (templates, RSVP form, particles overlay…) inherits the
 * exact same values in the inline editor, the "Vue visiteur" and the public
 * `/e/$slug` page. Avoids drifting between routes that used to inject
 * `<style>:root{…}</style>` versus mutate `document.documentElement`.
 */
export function ThemeRoot({
  couple,
  className,
  style,
  children,
  dataAttrs,
}: Props) {
  const resolved = useResolvedTheme(couple);
  const vars = useMemo(
    () => themeCssVars(resolved) as unknown as React.CSSProperties,
    [resolved],
  );
  return (
    <div
      className={className}
      data-theme={resolved.themeSlug}
      data-bg-override={couple.backgroundBase ? "" : undefined}
      data-text-override={couple.textColor ? "" : undefined}
      {...dataAttrs}
      style={{ backgroundColor: resolved.bg, ...vars, ...style }}
    >
      {children}
    </div>
  );
}

export function useResolvedTheme(couple: ThemeCouple): ResolvedTheme {
  return useMemo(
    () => resolveTheme(couple),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [couple.theme, couple.accentColor, couple.backgroundBase, couple.accent, couple.textColor],
  );
}
