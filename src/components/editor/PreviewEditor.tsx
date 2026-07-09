import { useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { useWedding } from "@/lib/wedding-store";
import { useAutosave } from "@/hooks/use-autosave";
import { SaveIndicator } from "./SaveIndicator";
import { Lock, Type, Users, Calendar, X, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

type Sheet = null | "caption" | "names" | "date";

const CAPTION_SUGGESTIONS = [
  "Ils se disent oui",
  "Save the date",
  "Nous nous marions",
  "Together forever",
];

interface EditorProps {
  mode: "preview" | "edit";
  onToggle: () => void;
}

export function PreviewEditor({ mode, onToggle }: EditorProps) {
  const { couple, updateCouple } = useWedding();
  const [sheet, setSheet] = useState<Sheet>(null);
  const { status, schedule } = useAutosave(500);

  // Local drafts (updated live in UI, persisted debounced)
  const [caption, setCaption] = useState(couple.caption ?? "");
  const [bride, setBride] = useState(couple.brideName);
  const [groom, setGroom] = useState(couple.groomName);
  const [date, setDate] = useState(couple.weddingDate);
  const [city, setCity] = useState(couple.city);

  const persist = (patch: Parameters<typeof updateCouple>[0]) => {
    schedule(async () => {
      await updateCouple(patch);
    });
  };

  return (
    <>
      {/* Floating action button top-right */}
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "fixed right-4 top-20 z-30 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.2em] shadow-lg transition-all",
          mode === "edit"
            ? "bg-foreground text-background"
            : "bg-background text-foreground ring-1 ring-border",
        )}
      >
        {mode === "edit" ? (
          <>
            <X className="size-3.5" />
            Terminer
          </>
        ) : (
          <>
            <Pencil className="size-3.5" />
            Modifier
          </>
        )}
      </button>

      {/* Bottom edit bar (edit mode only) */}
      {mode === "edit" && (
        <div className="fixed inset-x-0 bottom-20 z-30 mx-auto flex max-w-xl justify-center px-4 pb-2">
          <div className="flex w-full items-center gap-2 overflow-x-auto rounded-2xl border border-border bg-background/95 p-2 shadow-lg backdrop-blur">
            <EditChip
              icon={<Type className="size-4" />}
              label="Petit texte"
              value={caption || "Ils se disent oui"}
              onClick={() => setSheet("caption")}
            />
            <EditChip
              icon={<Users className="size-4" />}
              label="Prénoms"
              value={`${bride} & ${groom}`}
              locked={couple.isLocked}
              onClick={() => setSheet("names")}
            />
            <EditChip
              icon={<Calendar className="size-4" />}
              label="Date & lieu"
              value={`${date || "—"} · ${city}`}
              onClick={() => setSheet("date")}
            />
          </div>
        </div>
      )}

      <SaveIndicator status={status} />

      {/* Caption sheet */}
      <BottomSheet
        open={sheet === "caption"}
        onOpenChange={(o) => !o && setSheet(null)}
        title="Petit texte au-dessus des prénoms"
      >
        <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
          Texte affiché
        </label>
        <input
          type="text"
          value={caption}
          maxLength={40}
          placeholder="Ils se disent oui"
          onChange={(e) => {
            setCaption(e.target.value);
            persist({ caption: e.target.value });
          }}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/40"
        />
        <p className="mt-1 text-right text-[10px] opacity-40">{caption.length}/40</p>

        <p className="mt-6 mb-2 font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
          Suggestions
        </p>
        <div className="flex flex-wrap gap-2">
          {CAPTION_SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setCaption(s);
                persist({ caption: s });
              }}
              className="rounded-full border border-border bg-muted px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition hover:bg-foreground hover:text-background"
            >
              {s}
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Names sheet */}
      <BottomSheet
        open={sheet === "names"}
        onOpenChange={(o) => !o && setSheet(null)}
        title="Vos prénoms"
      >
        {couple.isLocked ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
            <Lock className="mb-2 size-4" />
            Les prénoms ne peuvent plus être modifiés après publication.
          </div>
        ) : (
          <div className="space-y-4">
            <Field
              label="Prénom 1"
              value={bride}
              onChange={(v) => {
                setBride(v);
                persist({ brideName: v });
              }}
            />
            <Field
              label="Prénom 2"
              value={groom}
              onChange={(v) => {
                setGroom(v);
                persist({ groomName: v });
              }}
            />
          </div>
        )}
      </BottomSheet>

      {/* Date & lieu sheet */}
      <BottomSheet
        open={sheet === "date"}
        onOpenChange={(o) => !o && setSheet(null)}
        title="Date et lieu"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
              Date du mariage
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                persist({ weddingDate: e.target.value });
              }}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <Field
            label="Ville"
            value={city}
            onChange={(v) => {
              setCity(v);
              persist({ city: v });
            }}
          />
        </div>
      </BottomSheet>
    </>
  );
}

function EditChip({
  icon,
  label,
  value,
  onClick,
  locked,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onClick: () => void;
  locked?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-w-[9rem] shrink-0 flex-col items-start gap-0.5 rounded-xl border border-dashed border-border bg-background px-3 py-2 text-left transition active:scale-[0.97]"
    >
      <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] opacity-60">
        {icon}
        {label}
        {locked && <Lock className="size-3" />}
      </span>
      <span className="line-clamp-1 w-full text-xs">{value}</span>
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
      />
    </div>
  );
}
