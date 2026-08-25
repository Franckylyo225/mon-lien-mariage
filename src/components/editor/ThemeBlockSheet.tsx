import { useEffect, useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";

interface Field {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}

interface ThemeBlockSheetProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  intro?: string;
  enabled: boolean;
  onEnabledChange: (v: boolean) => void;
  titleField: Field;
  bodyField: Field;
  referenceField: Field;
  extraControls?: React.ReactNode;
}

export function ThemeBlockSheet({
  open,
  onOpenChange,
  title,
  intro,
  enabled,
  onEnabledChange,
  titleField,
  bodyField,
  referenceField,
  extraControls,
}: ThemeBlockSheetProps) {
  const [titleDraft, setTitleDraft] = useState(titleField.value);
  const [bodyDraft, setBodyDraft] = useState(bodyField.value);
  const [refDraft, setRefDraft] = useState(referenceField.value);

  useEffect(() => {
    if (open) {
      setTitleDraft(titleField.value);
      setBodyDraft(bodyField.value);
      setRefDraft(referenceField.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title={title}>
      <div className="space-y-5">
        {intro && <p className="text-[12px] opacity-70">{intro}</p>}

        <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3">
          <div>
            <p className="text-sm font-medium">Afficher ce bloc</p>
            <p className="text-[11px] opacity-60">
              Vos invités verront ce bloc sur votre page.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => onEnabledChange(!enabled)}
            className={
              "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors " +
              (enabled ? "bg-primary" : "bg-muted")
            }
          >
            <span
              className={
                "inline-block size-5 rounded-full bg-background shadow transition-transform " +
                (enabled ? "translate-x-5" : "translate-x-0.5")
              }
            />
          </button>
        </label>

        <div
          className={
            "space-y-4 transition-opacity " +
            (!enabled ? "pointer-events-none opacity-40" : "")
          }
        >
          <div>
            <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
              {titleField.label}
            </label>
            <input
              type="text"
              value={titleDraft}
              placeholder={titleField.placeholder}
              onChange={(e) => {
                setTitleDraft(e.target.value);
                titleField.onChange(e.target.value);
              }}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
              {bodyField.label}
            </label>
            <textarea
              value={bodyDraft}
              rows={5}
              placeholder={bodyField.placeholder}
              onChange={(e) => {
                setBodyDraft(e.target.value);
                bodyField.onChange(e.target.value);
              }}
              className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
              {referenceField.label}
            </label>
            <input
              type="text"
              value={refDraft}
              placeholder={referenceField.placeholder}
              onChange={(e) => {
                setRefDraft(e.target.value);
                referenceField.onChange(e.target.value);
              }}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {extraControls}
        </div>
      </div>
    </BottomSheet>
  );
}
