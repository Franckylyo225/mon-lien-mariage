import { useEffect, useMemo } from "react";
import { BODY_FONTS, TITLE_FONTS, findBodyFont, findTitleFont } from "@/lib/fonts";
import type { Couple } from "@/lib/wedding-store";
import { THEMES } from "@/lib/wedding-theme";

type FontWedding = Pick<Couple, "theme" | "customFontTitle" | "customFontBody">;

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

  return useMemo(() => {
    const theme = THEMES[wedding.theme] ?? THEMES["rose-elegance"];
    return {
      titleFontFamily: titleFont?.family ?? theme.fontHeading,
      bodyFontFamily: bodyFont?.family ?? theme.fontBody,
    };
  }, [wedding.theme, titleFont?.family, bodyFont?.family]);
}

export { TITLE_FONTS, BODY_FONTS };