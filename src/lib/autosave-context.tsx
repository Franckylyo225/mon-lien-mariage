import { createContext, useContext, type ReactNode } from "react";
import { useAutosave, type SaveStatus } from "@/hooks/use-autosave";

/**
 * Shared autosave state at dashboard scope so both the editor (writer) and
 * the sticky action bar in the preview chrome (reader) see the same status.
 */
interface AutosaveContextValue {
  status: SaveStatus;
  schedule: (fn: () => Promise<void>) => void;
}

const Ctx = createContext<AutosaveContextValue | null>(null);

export function AutosaveProvider({ children }: { children: ReactNode }) {
  const { status, schedule } = useAutosave(500);
  return (
    <Ctx.Provider value={{ status, schedule }}>{children}</Ctx.Provider>
  );
}

export function useAutosaveContext(): AutosaveContextValue {
  const c = useContext(Ctx);
  if (!c) {
    // Safe fallback: no-op scheduler, idle status.
    return { status: "idle", schedule: () => {} };
  }
  return c;
}
