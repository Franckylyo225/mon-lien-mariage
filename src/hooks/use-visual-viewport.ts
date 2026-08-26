import { useEffect, useState } from "react";

interface ViewportOffset {
  /** Height (px) occupied by the on-screen keyboard. */
  keyboardHeight: number;
  /** Visible height (px) above the keyboard. */
  visibleHeight: number;
}

/**
 * Tracks the iOS/Android visual viewport while the software keyboard is open.
 * Fixed-position bottom sheets sized with `vh` units break when the keyboard
 * opens (the layout viewport keeps its full height, leaving a blank gap and
 * hiding the focused field). This hook returns the real visible geometry so
 * sheets can anchor themselves just above the keyboard.
 */
export function useVisualViewport(): ViewportOffset | null {
  const [offset, setOffset] = useState<ViewportOffset | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;
    const vv = window.visualViewport;

    const update = () => {
      const keyboardHeight = window.innerHeight - vv.height - vv.offsetTop;
      // Ignore tiny fluctuations (scroll bounce, URL bar) — only real keyboards.
      if (keyboardHeight > 80) {
        setOffset({ keyboardHeight, visibleHeight: vv.height });
      } else {
        setOffset(null);
      }
    };

    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    update();
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return offset;
}
