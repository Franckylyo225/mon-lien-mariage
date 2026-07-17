import { useEffect, useMemo, useState } from "react";
import { Drawer } from "vaul";
import { IconLock } from "@tabler/icons-react";
import { useWedding, type EventType } from "@/lib/wedding-store";
import { cn } from "@/lib/utils";

const EVENT_OPTIONS: { value: EventType; label: string; icon: string }[] = [
  { value: "mariage", label: "Mariage", icon: "◈" },
  { value: "coutumier", label: "Mariage coutumier", icon: "✿" },
  { value: "anniversaire", label: "Anniversaire", icon: "✦" },
  { value: "autre", label: "Autre", icon: "⋯" },
];

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function BasicInfoSheet({ open, onOpenChange }: Props) {
  const { couple, updateCouple } = useWedding();
  const isLocked = couple.isLocked;

  const initial = useMemo(
    () => ({
      brideName: couple.brideName ?? "",
      groomName: couple.groomName ?? "",
      eventType: (couple.eventType ?? "mariage") as EventType,
      weddingDate: couple.weddingDate ?? "",
      rsvpDeadline: couple.rsvpDeadline ?? "",
      city: couple.city ?? "",
    }),
    [couple, open], // reset when reopened
  );

  const [brideName, setBrideName] = useState(initial.brideName);
  const [groomName, setGroomName] = useState(initial.groomName);
  const [eventType, setEventType] = useState<EventType>(initial.eventType);
  const [weddingDate, setWeddingDate] = useState(initial.weddingDate);
  const [rsvpDeadline, setRsvpDeadline] = useState(initial.rsvpDeadline);
  const [city, setCity] = useState(initial.city);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setBrideName(initial.brideName);
      setGroomName(initial.groomName);
      setEventType(initial.eventType);
      setWeddingDate(initial.weddingDate);
      setRsvpDeadline(initial.rsvpDeadline);
      setCity(initial.city);
      setFlash(null);
    }
  }, [open, initial]);

  const dirty =
    brideName !== initial.brideName ||
    groomName !== initial.groomName ||
    eventType !== initial.eventType ||
    weddingDate !== initial.weddingDate ||
    rsvpDeadline !== initial.rsvpDeadline ||
    city !== initial.city;

  const rsvpError =
    rsvpDeadline && weddingDate && rsvpDeadline > weddingDate
      ? "La date limite RSVP doit être avant la date du mariage."
      : null;

  const canSave = dirty && !rsvpError && !saving;

  const handleClose = (next: boolean) => {
    if (!next && dirty) {
      const ok = window.confirm("Abandonner les modifications ?");
      if (!ok) return;
    }
    onOpenChange(next);
  };

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await updateCouple({
        brideName: isLocked ? initial.brideName : brideName.trim(),
        groomName: isLocked ? initial.groomName : groomName.trim(),
        eventType: isLocked ? initial.eventType : eventType,
        weddingDate,
        rsvpDeadline: rsvpDeadline || undefined,
        city: city.trim(),
      });
      setFlash("Modifications enregistrées");
      setTimeout(() => {
        onOpenChange(false);
      }, 400);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer.Root open={open} onOpenChange={handleClose}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[85vh] w-full max-w-xl flex-col rounded-t-3xl border border-b-0 border-border bg-background outline-none">
          <Drawer.Title className="sr-only">Informations de base</Drawer.Title>

          <div className="flex items-center justify-center pt-3">
            <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
          </div>

          <header className="flex items-center justify-between gap-3 px-5 pb-3 pt-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-50">
                Modifier
              </p>
              <h2 className="font-serif text-xl">Informations de base</h2>
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className={cn(
                "rounded-full px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition",
                canSave
                  ? "bg-foreground text-background hover:opacity-90"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {saving ? "…" : "Enregistrer"}
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-5 pb-8 pt-2">
            {flash ? (
              <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-800">
                {flash}
              </div>
            ) : null}

            {/* Identité */}
            <Section title="Identité">
              <Field label="Prénom marié(e) A">
                <LockableInput
                  value={brideName}
                  onChange={setBrideName}
                  locked={isLocked}
                  placeholder="Prénom"
                />
              </Field>
              <Field label="Prénom marié(e) B">
                <LockableInput
                  value={groomName}
                  onChange={setGroomName}
                  locked={isLocked}
                  placeholder="Prénom"
                />
              </Field>
            </Section>

            {/* Type */}
            <Section title="Type d'événement">
              <div className="grid grid-cols-2 gap-2.5">
                {EVENT_OPTIONS.map((o) => {
                  const active = eventType === o.value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      disabled={isLocked}
                      onClick={() => setEventType(o.value)}
                      className={cn(
                        "flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition",
                        active
                          ? "border-[1.5px] border-foreground bg-secondary/60"
                          : "border-border bg-card",
                        isLocked && "opacity-60",
                      )}
                    >
                      <span className="font-serif text-lg italic">{o.icon}</span>
                      <p className="text-[12px] font-medium">{o.label}</p>
                    </button>
                  );
                })}
              </div>
              {isLocked ? (
                <p className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <IconLock size={12} /> Non modifiable après publication
                </p>
              ) : null}
            </Section>

            {/* Dates */}
            <Section title="Dates">
              <Field label="Date du mariage">
                <input
                  type="date"
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </Field>
              <Field label="Date limite RSVP">
                <input
                  type="date"
                  value={rsvpDeadline}
                  onChange={(e) => setRsvpDeadline(e.target.value)}
                  className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Doit être avant la date du mariage
                </p>
                {rsvpError ? (
                  <p className="mt-1 text-[11px] text-destructive">{rsvpError}</p>
                ) : null}
              </Field>
            </Section>

            {/* Lieu */}
            <Section title="Lieu">
              <Field label="Ville du mariage">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex : Abidjan"
                  className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </Field>
            </Section>

            <button
              type="button"
              onClick={() => handleClose(false)}
              className="mt-2 w-full rounded-lg border border-border bg-card py-2.5 text-[12px] text-muted-foreground transition active:bg-secondary"
            >
              Annuler
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
        {title}
      </p>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function LockableInput({
  value,
  onChange,
  locked,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  locked: boolean;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={locked}
        placeholder={placeholder}
        title={locked ? "Les prénoms ne peuvent plus être modifiés après publication." : undefined}
        className={cn(
          "w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring",
          locked
            ? "border-border bg-[#F3F4F6] text-muted-foreground pr-9"
            : "border-input bg-card",
        )}
      />
      {locked ? (
        <IconLock
          size={14}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
      ) : null}
    </div>
  );
}
