import { useEffect, useState } from "react";
import { ChevronDown, RotateCcw, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BODY_FONTS, TITLE_FONTS } from "@/lib/fonts";
import type { Couple } from "@/lib/wedding-store";
import { THEMES } from "@/lib/wedding-theme";
import { cn } from "@/lib/utils";

interface TypographyPanelProps {
  couple: Pick<Couple, "theme" | "customFontTitle" | "customFontBody">;
  onPatch: (patch: Partial<Couple>) => void;
  defaultExpanded?: boolean;
}

export function TypographyPanel({ couple, onPatch, defaultExpanded = false }: TypographyPanelProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [fonts, setFonts] = useState({
    customFontTitle: couple.customFontTitle ?? null,
    customFontBody: couple.customFontBody ?? null,
  });
  const theme = THEMES[couple.theme] ?? THEMES["rose-elegance"];
  const customized = Boolean(fonts.customFontTitle || fonts.customFontBody);

  useEffect(() => {
    setFonts({
      customFontTitle: couple.customFontTitle ?? null,
      customFontBody: couple.customFontBody ?? null,
    });
  }, [couple.customFontTitle, couple.customFontBody]);

  const commit = (next: typeof fonts) => {
    setFonts(next);
    onPatch(next);
  };

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-background">
      <Button
        type="button"
        variant="ghost"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        className="h-auto w-full justify-between rounded-none px-4 py-3.5"
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Type className="size-4 text-primary" />
          Personnaliser la typographie
        </span>
        <ChevronDown className={cn("size-4 transition-transform", expanded && "rotate-180")} />
      </Button>

      {expanded ? (
        <div className="space-y-5 border-t border-border px-4 py-4">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Police du thème « {theme.name} » : {fontName(theme.fontHeading)} / {fontName(theme.fontBody)}
          </p>

          <FontChoices
            label="Police des titres"
            fonts={TITLE_FONTS}
            selected={fonts.customFontTitle}
            sample="Aa"
            onSelect={(id) => commit({ ...fonts, customFontTitle: id })}
          />
          <FontChoices
            label="Police du texte"
            fonts={BODY_FONTS}
            selected={fonts.customFontBody}
            sample="Aa Bb Cc"
            onSelect={(id) => commit({ ...fonts, customFontBody: id })}
          />

          {customized ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => commit({ customFontTitle: null, customFontBody: null })}
              className="h-auto px-0 py-1 text-xs text-muted-foreground underline underline-offset-4 hover:bg-transparent"
            >
              <RotateCcw className="size-3.5" />
              Revenir à la typographie du thème
            </Button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function FontChoices({ label, fonts, selected, sample, onSelect }: {
  label: string;
  fonts: readonly { id: string; label: string; family: string }[];
  selected?: string | null;
  sample: string;
  onSelect: (id: string) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-semibold text-foreground">{label}</legend>
      <div className="grid grid-cols-2 gap-2">
        {fonts.map((font) => {
          const active = selected === font.id;
          return (
            <Button
              key={font.id}
              type="button"
              variant="outline"
              aria-pressed={active}
              onClick={() => onSelect(font.id)}
              className={cn(
                "h-[72px] min-w-0 flex-col items-start gap-1 whitespace-normal px-3 py-2 text-left",
                active && "border-primary bg-primary/10 ring-1 ring-primary",
              )}
            >
              <span className="text-xl leading-none" style={{ fontFamily: font.family }}>{sample}</span>
              <span className="w-full truncate text-[11px] font-medium">{font.label}</span>
            </Button>
          );
        })}
      </div>
    </fieldset>
  );
}

function fontName(family: string) {
  return family.split(",")[0].replaceAll('"', "").replaceAll("'", "");
}