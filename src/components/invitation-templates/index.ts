import type { ComponentType } from "react";
import type { TemplateId, ThemeId } from "@/lib/wedding-store";
import { templateForTheme } from "@/lib/wedding-theme";
import type { TemplateProps } from "./types";
import { TerracottaTemplate } from "./terracotta";
import { NoirMinimalTemplate } from "./noir-minimal";
import { BotaniqueDoreTemplate } from "./botanique-dore";
import { TropicalTemplate } from "./tropical";
import { ArtDecoTemplate } from "./art-deco";
import { RoseEleganceTemplate } from "./rose-elegance";
import { IvoireEpureTemplate } from "./ivoire-epure";
import { OrAntiqueTemplate } from "./or-antique";

export const templateComponents: Record<TemplateId, ComponentType<TemplateProps>> = {
  terracotta: TerracottaTemplate,
  "noir-minimal": NoirMinimalTemplate,
  "botanique-dore": BotaniqueDoreTemplate,
  tropical: TropicalTemplate,
  "art-deco": ArtDecoTemplate,
};

export const templateRsvpTone: Record<
  TemplateId,
  "warm" | "dark" | "gold" | "tropical" | "deco"
> = {
  terracotta: "warm",
  "noir-minimal": "dark",
  "botanique-dore": "gold",
  tropical: "tropical",
  "art-deco": "deco",
};

/**
 * Phase 3: some themes have dedicated designs and bypass the template
 * mapping in wedding-theme.ts. Any theme absent here still resolves via
 * the Phase-2 fallback (templateForTheme). Add a theme here as soon as
 * its dedicated component ships.
 */
const themeComponents: Partial<Record<ThemeId, ComponentType<TemplateProps>>> = {
  "rose-elegance": RoseEleganceTemplate,
  "ivoire-epure": IvoireEpureTemplate,
  "or-antique": OrAntiqueTemplate,
};

const themeRsvpTone: Partial<
  Record<ThemeId, "warm" | "dark" | "gold" | "tropical" | "deco">
> = {
  "rose-elegance": "warm",
  "ivoire-epure": "dark",
  "or-antique": "deco",
};

export function componentForTheme(theme: ThemeId): ComponentType<TemplateProps> {
  return themeComponents[theme] ?? templateComponents[templateForTheme(theme)];
}

export function rsvpToneForTheme(
  theme: ThemeId,
): "warm" | "dark" | "gold" | "tropical" | "deco" {
  return themeRsvpTone[theme] ?? templateRsvpTone[templateForTheme(theme)];
}
