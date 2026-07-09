import type { ComponentType } from "react";
import type { TemplateId, ThemeId } from "@/lib/wedding-store";
import { templateForTheme } from "@/lib/wedding-theme";
import type { TemplateProps } from "./types";
import { TerracottaTemplate } from "./terracotta";
import { NoirMinimalTemplate } from "./noir-minimal";
import { BotaniqueDoreTemplate } from "./botanique-dore";
import { TropicalTemplate } from "./tropical";
import { ArtDecoTemplate } from "./art-deco";

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
 * Phase 1: theme drives the rendered page. The dynamic loader picks the
 * template component + RSVP tone from the current theme slug.
 * Phase 3 will replace individual templates with per-theme designs.
 */
export function componentForTheme(theme: ThemeId): ComponentType<TemplateProps> {
  return templateComponents[templateForTheme(theme)];
}

export function rsvpToneForTheme(
  theme: ThemeId,
): "warm" | "dark" | "gold" | "tropical" | "deco" {
  return templateRsvpTone[templateForTheme(theme)];
}
