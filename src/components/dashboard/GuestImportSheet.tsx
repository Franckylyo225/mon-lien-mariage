import { useMemo, useRef, useState, type ReactNode } from "react";
import { Drawer } from "vaul";
import { ArrowLeft, ClipboardPaste, Contact, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { useWedding, type Guest } from "@/lib/wedding-store";
import { guestTypeMeta } from "@/lib/guest-meta";
import {
  contactsSupported,
  parsePastedList,
  pickContacts,
  reviewRows,
  rowsFromFile,
  type ImportRow,
  type ReviewRow,
  type ReviewStatus,
} from "@/lib/guest-import";
import { useVisualViewport } from "@/hooks/use-visual-viewport";
import { cn } from "@/lib/utils";

type Stage = "source" | "paste" | "review";

const STATUS_NOTE: Record<ReviewStatus, { text: string; cls: string } | null> = {
  ok: null,
  no_phone: { text: "Sans numéro", cls: "text-amber-700" },
  bad_phone: { text: "Numéro illisible", cls: "text-amber-700" },
  duplicate: { text: "Déjà dans la liste", cls: "text-muted-foreground" },
};

export function GuestImportSheet({
  existing,
  onClose,
}: {
  existing: Guest[];
  onClose: () => void;
}) {
  const { ceremonies, addGuests } = useWedding();
  const vv = useVisualViewport();
  const fileRef = useRef<HTMLInputElement>(null);

  const [stage, setStage] = useState<Stage>("source");
  const [text, setText] = useState("");
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canPickContacts = useMemo(() => contactsSupported(), []);

  const startReview = (parsed: ImportRow[]) => {
    if (parsed.length === 0) {
      setError("Aucun invité trouvé. Vérifiez le contenu (un invité par ligne, avec son nom).");
      return;
    }
    const reviewed = reviewRows(parsed, existing);
    setRows(reviewed);
    setSelected(new Set(reviewed.filter((r) => r.status !== "duplicate").map((r) => r.id)));
    setError(null);
    setStage("review");
  };

  const onFile = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      startReview(await rowsFromFile(file));
    } catch {
      setError("Ce fichier n'a pas pu être lu. Utilisez un fichier Excel (.xlsx) ou CSV.");
    } finally {
      setBusy(false);
    }
  };

  const onContacts = async () => {
    setError(null);
    try {
      startReview(await pickContacts());
    } catch {
      // The user dismissed the picker, or the browser refused access.
    }
  };

  const toggle = (id: number) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const chosen = rows.filter((r) => selected.has(r.id));
  const counts = useMemo(
    () => ({
      noPhone: chosen.filter((r) => r.status === "no_phone" || r.status === "bad_phone").length,
      duplicates: rows.filter((r) => r.status === "duplicate").length,
    }),
    [chosen, rows],
  );

  const doImport = async () => {
    if (chosen.length === 0) return;
    setBusy(true);
    const saved = await addGuests(
      chosen.map(({ row }) => {
        const type = row.guestType ?? "autre";
        return {
          name: row.name,
          phone: row.phone,
          email: row.email,
          group: row.group || guestTypeMeta[type].short,
          guestType: type,
          allowedPlusOnes: 0,
          source: "csv" as const,
          ceremonyIds: ceremonies.map((c) => c.id),
        };
      }),
    );
    setBusy(false);
    if (saved === chosen.length)
      toast.success(`${saved} invité${saved > 1 ? "s" : ""} importé${saved > 1 ? "s" : ""}.`);
    else
      toast.error(`${saved} sur ${chosen.length} invités enregistrés. Réessayez pour les autres.`);
    onClose();
  };

  return (
    <Drawer.Root open onOpenChange={(open) => !open && onClose()} repositionInputs={false}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Drawer.Content
          style={
            vv
              ? { bottom: vv.keyboardHeight, maxHeight: Math.max(vv.visibleHeight - 12, 240) }
              : undefined
          }
          className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[90vh] w-full max-w-xl flex-col rounded-t-3xl border border-b-0 border-border bg-background outline-none"
        >
          <Drawer.Title className="sr-only">Importer des invités</Drawer.Title>
          <div className="flex items-center justify-center pt-3">
            <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
          </div>

          <header className="flex items-center gap-2 px-5 pb-2 pt-4">
            {stage !== "source" ? (
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setStage("source");
                }}
                aria-label="Retour"
                className="-ml-2 grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <ArrowLeft className="size-4" />
              </button>
            ) : null}
            <h2 className="font-serif text-xl">
              {stage === "review" ? "Vérifier avant d'importer" : "Importer des invités"}
            </h2>
          </header>

          <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2">
            {stage === "source" ? (
              <div className="space-y-2.5">
                <Source
                  icon={<ClipboardPaste className="size-5" />}
                  title="Coller une liste"
                  hint="Un invité par ligne : nom, puis numéro"
                  onClick={() => {
                    setError(null);
                    setStage("paste");
                  }}
                />
                <Source
                  icon={<FileSpreadsheet className="size-5" />}
                  title="Fichier Excel ou CSV"
                  hint="Colonnes reconnues : Nom, Téléphone, Email, Type, Groupe"
                  disabled={busy}
                  onClick={() => fileRef.current?.click()}
                />
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls,.csv,text/csv"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void onFile(f);
                    e.target.value = "";
                  }}
                />
                {canPickContacts ? (
                  <Source
                    icon={<Contact className="size-5" />}
                    title="Contacts du téléphone"
                    hint="Choisissez plusieurs contacts d'un coup"
                    onClick={() => void onContacts()}
                  />
                ) : (
                  <p className="px-1 pt-1 text-[12px] text-muted-foreground">
                    L'import depuis les contacts n'est disponible que sur Android (Chrome). Sur
                    iPhone, collez la liste ou importez un fichier.
                  </p>
                )}
                {error ? <p className="pt-1 text-[13px] text-destructive">{error}</p> : null}
              </div>
            ) : null}

            {stage === "paste" ? (
              <div className="space-y-3">
                <textarea
                  autoFocus
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={9}
                  placeholder={
                    "Awa Koné, 07 12 34 56 78\nKofi Mensah +233 24 123 4567\nMarie Traoré 0102030405"
                  }
                  className="w-full rounded-lg border border-input bg-card px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <p className="text-[12px] text-muted-foreground">
                  Sans indicatif, les numéros sont lus comme ivoiriens (+225). Ajoutez « + » et
                  l'indicatif pour un autre pays.
                </p>
                {error ? <p className="text-[13px] text-destructive">{error}</p> : null}
                <button
                  type="button"
                  disabled={text.trim().length === 0}
                  onClick={() => startReview(parsePastedList(text))}
                  className="w-full rounded-lg bg-primary py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                >
                  Continuer
                </button>
              </div>
            ) : null}

            {stage === "review" ? (
              <div className="space-y-3">
                <p className="text-[12px] text-muted-foreground">
                  {rows.length} invité{rows.length > 1 ? "s" : ""} trouvé
                  {rows.length > 1 ? "s" : ""}
                  {counts.duplicates > 0
                    ? ` · ${counts.duplicates} déjà dans votre liste (décochés)`
                    : ""}
                  . Décochez ceux à ne pas importer.
                </p>
                <ul className="divide-y divide-border rounded-xl border border-border bg-card">
                  {rows.map((r) => {
                    const note = STATUS_NOTE[r.status];
                    const on = selected.has(r.id);
                    return (
                      <li key={r.id}>
                        <label
                          className={cn(
                            "flex cursor-pointer items-center gap-3 px-3.5 py-2.5",
                            !on && "opacity-55",
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={() => toggle(r.id)}
                            className="size-4 shrink-0 accent-[var(--primary)]"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[14px] font-medium">
                              {r.row.name}
                            </span>
                            <span className="block truncate text-[12px] text-muted-foreground">
                              {r.row.phone ?? r.row.rawPhone ?? "—"}
                            </span>
                          </span>
                          {note ? (
                            <span className={cn("shrink-0 text-[11px] font-medium", note.cls)}>
                              {note.text}
                            </span>
                          ) : null}
                        </label>
                      </li>
                    );
                  })}
                </ul>
                {counts.noPhone > 0 ? (
                  <p className="text-[12px] text-amber-700">
                    {counts.noPhone} invité{counts.noPhone > 1 ? "s" : ""} sera
                    {counts.noPhone > 1 ? "ont" : ""} importé{counts.noPhone > 1 ? "s" : ""} sans
                    numéro : vous pourrez le compléter depuis leur fiche.
                  </p>
                ) : null}
                <button
                  type="button"
                  disabled={busy || chosen.length === 0}
                  onClick={() => void doImport()}
                  className="w-full rounded-lg bg-primary py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                >
                  {busy
                    ? "Import en cours…"
                    : `Importer ${chosen.length} invité${chosen.length > 1 ? "s" : ""}`}
                </button>
              </div>
            ) : null}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function Source({
  icon,
  title,
  hint,
  disabled,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  hint: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 text-left transition hover:bg-secondary/40 disabled:opacity-60"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-primary">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[14px] font-medium">{title}</span>
        <span className="block text-[12px] text-muted-foreground">{hint}</span>
      </span>
    </button>
  );
}
