import { useRef, useState } from "react";
import { Drawer } from "vaul";
import { CircleCheck, Upload } from "lucide-react";
import { toast } from "sonner";
import { useWedding, type Guest } from "@/lib/wedding-store";
import { guestTypeMeta } from "@/lib/guest-meta";
import { useVisualViewport } from "@/hooks/use-visual-viewport";
import { PhoneField, isValidPhoneNumber } from "@/components/ui/PhoneField";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";

interface Props {
  existing: Guest[];
  onClose: () => void;
  onImport: () => void;
}

export function GuestQuickAddSheet({ existing, onClose, onImport }: Props) {
  const { ceremonies, addGuest } = useWedding();
  const vv = useVisualViewport();
  const nameRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [added, setAdded] = useState<string[]>([]);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const trimmed = name.trim();
  const dirty = trimmed.length > 0 || !!phone;
  const duplicate =
    trimmed.length > 0 &&
    [...existing.map((g) => g.name), ...added].some(
      (n) => n.trim().toLowerCase() === trimmed.toLowerCase(),
    );

  const save = async (keepOpen: boolean) => {
    if (!trimmed) return setError("Le nom est obligatoire.");
    if (phone && !isValidPhoneNumber(phone)) return setError("Numéro de téléphone invalide.");
    setError(null);
    setSaving(true);
    try {
      await addGuest({
        name: trimmed,
        phone,
        group: guestTypeMeta.autre.short,
        guestType: "autre",
        allowedPlusOnes: 0,
        source: "manuel",
        ceremonyIds: ceremonies.map((c) => c.id),
      });
    } finally {
      setSaving(false);
    }
    if (keepOpen) {
      setAdded((a) => [...a, trimmed]);
      setName("");
      setPhone(undefined);
      nameRef.current?.focus();
    } else {
      toast.success(`${trimmed} ajouté.`);
      onClose();
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (open) return;
    if (dirty) setConfirmDiscard(true);
    else onClose();
  };

  return (
    <>
      <ConfirmDialog
        open={confirmDiscard}
        onOpenChange={setConfirmDiscard}
        title="Abandonner cet invité ?"
        description="Les informations saisies seront perdues."
        confirmLabel="Abandonner"
        cancelLabel="Continuer"
        destructive
        onConfirm={onClose}
      />
      <Drawer.Root open onOpenChange={handleOpenChange} repositionInputs={false}>
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
            <Drawer.Title className="sr-only">Nouvel invité</Drawer.Title>
            <div className="flex items-center justify-center pt-3">
              <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
            </div>
            <header className="px-5 pb-2 pt-4">
              <h2 className="font-serif text-xl">Nouvel invité</h2>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                Nom et numéro WhatsApp suffisent. Le reste se règle ensuite depuis sa fiche.
              </p>
            </header>

            <form
              className="flex-1 space-y-4 overflow-y-auto px-5 pb-6 pt-3"
              onSubmit={(e) => {
                e.preventDefault();
                void save(true);
              }}
            >
              {added.length > 0 ? (
                <p className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-[12px] text-emerald-800">
                  <CircleCheck className="size-4 shrink-0" />
                  <span className="min-w-0 truncate">
                    {added[added.length - 1]} ajouté
                    {added.length > 1 ? ` · ${added.length} invités dans cette série` : ""}
                  </span>
                </p>
              ) : null}

              <div>
                <label
                  htmlFor="quick-guest-name"
                  className="mb-1.5 block text-[12px] font-medium text-muted-foreground"
                >
                  Nom complet
                </label>
                <input
                  id="quick-guest-name"
                  ref={nameRef}
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Prénom et nom"
                  autoComplete="off"
                  className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                {duplicate ? (
                  <p className="mt-1 text-[12px] text-amber-700">
                    Un invité porte déjà ce nom — vérifiez qu'il ne s'agit pas d'un doublon.
                  </p>
                ) : null}
              </div>

              <div>
                <p className="mb-1.5 text-[12px] font-medium text-muted-foreground">
                  Téléphone WhatsApp
                </p>
                <PhoneField
                  value={phone}
                  onChange={setPhone}
                  placeholder="Numéro de téléphone"
                  showError
                  errorMessage="Numéro de téléphone invalide"
                />
              </div>

              <p className="text-[12px] text-muted-foreground">
                {ceremonies.length > 0
                  ? `Invité à ${ceremonies.length === 1 ? "votre étape" : `vos ${ceremonies.length} étapes`} · modifiable depuis sa fiche.`
                  : "Aucune étape créée pour l'instant : ajoutez-en une depuis Programme."}
              </p>

              {error ? <p className="text-[13px] text-destructive">{error}</p> : null}

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void save(false)}
                  className="w-full rounded-lg bg-primary py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
                >
                  Enregistrer
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={cn(
                    "w-full rounded-lg border border-border bg-card py-3 text-sm font-medium transition hover:bg-secondary/40 disabled:opacity-60",
                  )}
                >
                  Enregistrer et ajouter un autre
                </button>
                <button
                  type="button"
                  onClick={onImport}
                  className="mx-auto flex items-center gap-1.5 pt-2 text-[13px] text-muted-foreground underline underline-offset-2"
                >
                  <Upload className="size-3.5" />
                  Importer plusieurs invités
                </button>
              </div>
            </form>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}
