import { useEffect, useState } from "react";

export type MorphPhase = "in" | "out" | "hidden";

/**
 * Keeps a bar mounted long enough to play its leave animation.
 *
 * The page editor swaps two bottom bars that occupy the same spot — the action
 * dock and the edit chip bar. Unmounting the outgoing one on the spot makes the
 * swap snap; this holds it for `outMs` so it can shrink away while the incoming
 * one grows in, and the two read as a single surface changing shape.
 */
export function useMorphPhase(active: boolean, outMs = 190): MorphPhase {
  const [phase, setPhase] = useState<MorphPhase>(active ? "in" : "hidden");

  useEffect(() => {
    if (active) {
      setPhase("in");
      return;
    }
    // Already gone: stay gone rather than replaying the leave animation.
    setPhase((p) => (p === "hidden" ? "hidden" : "out"));
    const t = setTimeout(() => setPhase("hidden"), outMs);
    return () => clearTimeout(t);
  }, [active, outMs]);

  return phase;
}
