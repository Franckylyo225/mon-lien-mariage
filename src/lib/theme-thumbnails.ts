import type { ThemeId } from "@/lib/wedding-store";

import aquarelle from "@/assets/theme-thumbs/aquarelle.png.asset.json";
import bleuNuit from "@/assets/theme-thumbs/bleu-nuit.png.asset.json";
import confetti from "@/assets/theme-thumbs/confetti.png.asset.json";
import ivoireEpure from "@/assets/theme-thumbs/ivoire-epure.png.asset.json";
import jardinSauvage from "@/assets/theme-thumbs/jardin-sauvage.png.asset.json";
import kenteRoyal from "@/assets/theme-thumbs/kente-royal.png.asset.json";
import manuscrit from "@/assets/theme-thumbs/manuscrit.png.asset.json";
import monochrome from "@/assets/theme-thumbs/monochrome.png.asset.json";
import orAntique from "@/assets/theme-thumbs/or-antique.png.asset.json";
import papierKraft from "@/assets/theme-thumbs/papier-kraft.png.asset.json";
import roseElegance from "@/assets/theme-thumbs/rose-elegance.png.asset.json";
import sahelDore from "@/assets/theme-thumbs/sahel-dore.png.asset.json";
import terracottaBoheme from "@/assets/theme-thumbs/terracotta-boheme.png.asset.json";
import vertSauge from "@/assets/theme-thumbs/vert-sauge.png.asset.json";
import waxDore from "@/assets/theme-thumbs/wax-dore.png.asset.json";
import indigoAdinkra from "@/assets/theme-thumbs/indigo-adinkra.png.asset.json";
import kenteSouverain from "@/assets/theme-thumbs/kente-souverain.png.asset.json";
import bogolanBordeaux from "@/assets/theme-thumbs/bogolan-bordeaux.png.asset.json";
import waxIvoire from "@/assets/theme-thumbs/wax-ivoire.png.asset.json";
import nuitEbene from "@/assets/theme-thumbs/nuit-ebene.png.asset.json";
import zelligeEmeraude from "@/assets/theme-thumbs/zellige-emeraude.png.asset.json";
import mashrabiyaSable from "@/assets/theme-thumbs/mashrabiya-sable.png.asset.json";
import arabesqueBordeaux from "@/assets/theme-thumbs/arabesque-bordeaux.png.asset.json";
import nacreGirih from "@/assets/theme-thumbs/nacre-girih.png.asset.json";
import calligraphieNuit from "@/assets/theme-thumbs/calligraphie-nuit.png.asset.json";

/**
 * Real screenshot previews of every theme, captured from the actual
 * template render at /theme-thumb/:slug. Re-generate by running the
 * Playwright capture script + `lovable-assets create` when a template
 * design changes.
 */
export const THEME_THUMBNAIL_URL: Partial<Record<ThemeId, string>> = {
  "rose-elegance": roseElegance.url,
  "ivoire-epure": ivoireEpure.url,
  "or-antique": orAntique.url,
  "vert-sauge": vertSauge.url,
  "jardin-sauvage": jardinSauvage.url,
  "terracotta-boheme": terracottaBoheme.url,
  "wax-dore": waxDore.url,
  "kente-royal": kenteRoyal.url,
  "sahel-dore": sahelDore.url,
  "bleu-nuit": bleuNuit.url,
  manuscrit: manuscrit.url,
  monochrome: monochrome.url,
  aquarelle: aquarelle.url,
  confetti: confetti.url,
  "papier-kraft": papierKraft.url,
};
