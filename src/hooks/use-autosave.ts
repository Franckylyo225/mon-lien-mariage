import { useCallback, useRef, useState } from "react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Debounced autosave with visual status.
 * saveFn should throw on failure.
 */
export function useAutosave(delay = 500) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const schedule = useCallback(
    (saveFn: () => Promise<void>) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (savedTimer.current) clearTimeout(savedTimer.current);
      timerRef.current = setTimeout(async () => {
        setStatus("saving");
        try {
          await saveFn();
          setStatus("saved");
          savedTimer.current = setTimeout(() => setStatus("idle"), 2000);
        } catch (err) {
          console.error("[autosave]", err);
          setStatus("error");
        }
      }, delay);
    },
    [delay],
  );

  return { status, schedule };
}
