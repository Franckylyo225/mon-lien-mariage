import { useEffect } from "react";

export const SCRIPT_FONT = "'Pinyon Script', 'Cormorant Garamond', ui-serif, Georgia, serif";

/**
 * Pinyon Script n'est utilisée que par quelques pages d'ouverture : elle reste
 * hors du bundle global et n'est chargée que lorsqu'un de ces modèles est
 * réellement affiché.
 */
export function useScriptFont() {
  useEffect(() => {
    void import("@fontsource/pinyon-script/400.css");
  }, []);
}
