import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type EditMode = "preview" | "edit";

interface EditModeState {
  mode: EditMode;
  setMode: (m: EditMode) => void;
  toggle: () => void;
}

const EditModeContext = createContext<EditModeState | null>(null);

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<EditMode>("preview");
  const value = useMemo<EditModeState>(
    () => ({
      mode,
      setMode,
      toggle: () => setMode((m) => (m === "edit" ? "preview" : "edit")),
    }),
    [mode],
  );
  return <EditModeContext.Provider value={value}>{children}</EditModeContext.Provider>;
}

export function useEditMode(): EditModeState {
  const ctx = useContext(EditModeContext);
  if (!ctx) {
    // Fallback: outside a provider, edit mode is always "preview".
    return { mode: "preview", setMode: () => {}, toggle: () => {} };
  }
  return ctx;
}
