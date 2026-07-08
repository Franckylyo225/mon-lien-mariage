import type { TemplateId } from "@/lib/wedding-store";
import type { TemplateProps } from "./types";
import { TerracottaTemplate } from "./terracotta";
import { NoirMinimalTemplate } from "./noir-minimal";
import { BotaniqueDoreTemplate } from "./botanique-dore";
import { TropicalTemplate } from "./tropical";
import { ArtDecoTemplate } from "./art-deco";

export const templateComponents: Record<
  TemplateId,
  (props: TemplateProps) => JSX.Element
> = {
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
