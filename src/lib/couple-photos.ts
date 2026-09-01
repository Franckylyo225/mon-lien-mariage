import type { ThemeId } from "@/lib/wedding-store";

import p1 from "@/assets/couples/portrait-happy-smiley-couple.jpg.asset.json";
import p2 from "@/assets/couples/portrait-smiley-couple-posing-together.jpg.asset.json";
import p3 from "@/assets/couples/side-view-smiley-couple.jpg.asset.json";
import p4 from "@/assets/couples/front-view-smiley-couple-posing-together.jpg.asset.json";
import p5 from "@/assets/couples/portrait-handsome-man-with-smiley-beautiful-woman.jpg.asset.json";
import p6 from "@/assets/couples/side-view-embraced-smiley-couple.jpg.asset.json";
import p7 from "@/assets/couples/front-view-smiley-couple-posing-having-fun.jpg.asset.json";
import p8 from "@/assets/couples/portrait-smiley-handsome-man-with-beautiful-woman.jpg.asset.json";
import p9 from "@/assets/couples/side-view-smiley-couple-posing-with-copy-space.jpg.asset.json";

/** Photos de couple utilisées pour les aperçus de thèmes (démos). */
export const COUPLE_PHOTOS: string[] = [
  p1.url,
  p2.url,
  p3.url,
  p4.url,
  p5.url,
  p6.url,
  p7.url,
  p8.url,
  p9.url,
];

/** Photo stable (déterministe) pour un thème donné. */
export function couplePhotoForTheme(theme: ThemeId | string): string {
  let h = 0;
  for (let i = 0; i < theme.length; i++) h = (h * 31 + theme.charCodeAt(i)) >>> 0;
  return COUPLE_PHOTOS[h % COUPLE_PHOTOS.length];
}

/** Prénoms de démonstration. */
export const DEMO_BRIDE = "Aïcha";
export const DEMO_GROOM = "Loïc";
