import { createFileRoute } from "@tanstack/react-router";
import { ThemeThumbnail } from "@/components/editor/ThemeThumbnail";
import { THEMES } from "@/lib/wedding-theme";
import type { ThemeId } from "@/lib/wedding-store";

export const Route = createFileRoute("/theme-thumb-test")({
  head: () => ({ meta: [{ title: "Theme thumb test" }] }),
  component: TestRoute,
});

function TestRoute() {
  const slugs = Object.keys(THEMES) as ThemeId[];
  return (
    <div className="mx-auto max-w-xl p-4">
      <div className="grid grid-cols-3 gap-2.5">
        {slugs.map((s) => (
          <div
            key={s}
            className="relative flex flex-col overflow-hidden rounded-2xl border-2 border-border"
          >
            <ThemeThumbnail theme={s} />
            <div className="border-t border-border bg-background px-2 py-1.5 text-[10px]">
              {THEMES[s].name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
