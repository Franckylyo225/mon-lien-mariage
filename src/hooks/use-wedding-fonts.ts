import { useEffect, useMemo } from "react";
import { BODY_FONTS, TITLE_FONTS, findBodyFont, findTitleFont } from "@/lib/fonts";
import type { Couple } from "@/lib/wedding-store";
import { THEMES } from "@/lib/wedding-theme";

type FontWedding = Pick<Couple, "theme" | "customFontTitle" | "customFontBody">;

/**
 * Fonts bundled locally via @fontsource but not imported globally in
 * styles.css (too narrow a use case: a handful of themes / the custom font
 * picker). Loaded on demand, matched against the resolved family string.
 */
const LOCAL_FONT_IMPORTS: Record<string, () => Promise<unknown>> = {
  Marcellus: () => import("@fontsource/marcellus/400.css"),
  Amiri: () =>
    Promise.all([
      import("@fontsource/amiri/400.css"),
      import("@fontsource/amiri/400-italic.css"),
      import("@fontsource/amiri/700.css"),
    ]),
  "Special Elite": () => import("@fontsource/special-elite/400.css"),
};

function loadLocalFontIfNeeded(family: string) {
  const match = Object.keys(LOCAL_FONT_IMPORTS).find((name) => family.includes(name));
  if (match) void LOCAL_FONT_IMPORTS[match]();
}

export function useWeddingFonts(wedding: FontWedding) {
  const titleFont = findTitleFont(wedding.customFontTitle);
  const bodyFont = findBodyFont(wedding.customFontBody);

  useEffect(() => {
    const params = [titleFont?.googleFont, bodyFont?.googleFont].filter(Boolean);
    const linkId = "wedding-custom-fonts";
    const existing = document.getElementById(linkId);

    if (params.length === 0) {
      existing?.remove();
      return;
    }

    const link = existing instanceof HTMLLinkElement
      ? existing
      : document.createElement("link");
    link.id = linkId;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?${params
      .map((font) => `family=${font}`)
      .join("&")}&display=swap`;
    if (!link.isConnected) document.head.appendChild(link);

  }, [titleFont?.googleFont, bodyFont?.googleFont]);

  const theme = THEMES[wedding.theme] ?? THEMES["rose-elegance"];
  const titleFontFamily = titleFont?.family ?? theme.fontHeading;
  const bodyFontFamily = bodyFont?.family ?? theme.fontBody;

  useEffect(() => {
    loadLocalFontIfNeeded(titleFontFamily);
    loadLocalFontIfNeeded(bodyFontFamily);
  }, [titleFontFamily, bodyFontFamily]);

  return useMemo(
    () => ({ titleFontFamily, bodyFontFamily }),
    [titleFontFamily, bodyFontFamily],
  );
}

export { TITLE_FONTS, BODY_FONTS };