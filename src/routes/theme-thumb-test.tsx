import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ThemeSheet } from "@/components/editor/ThemeSheet";
import type { Couple } from "@/lib/wedding-store";

export const Route = createFileRoute("/theme-thumb-test")({
  head: () => ({ meta: [{ title: "Theme sheet test" }] }),
  component: TestRoute,
});

function TestRoute() {
  const [open, setOpen] = useState(true);
  const [couple, setCouple] = useState<Couple>({
    brideName: "A",
    groomName: "B",
    weddingDate: "2027-02-14",
    rsvpDeadline: undefined,
    city: "Abidjan",
    introMessage: "",
    templateId: "terracotta",
    theme: "rose-elegance",
    caption: "",
    isPublished: false,
    isLocked: false,
    countdownEnabled: true,
    countdownUnits: ["days"],
  });
  return (
    <div className="p-8">
      <button className="rounded bg-black px-4 py-2 text-white" onClick={() => setOpen(true)}>
        Open Sheet
      </button>
      <ThemeSheet
        open={open}
        onOpenChange={setOpen}
        couple={couple}
        onPatch={(p) => setCouple({ ...couple, ...p })}
      />
    </div>
  );
}
