import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Slots the dashboard chrome (AppHeader center + a floating action dock)
 * exposes so route content can inject custom header contents.
 *
 * A route mounts custom slot contents in `useEffect` and clears them on
 * unmount so returning to a sibling route restores the default title/no-bar
 * layout.
 */

/**
 * Layout switches a route can ask the dashboard chrome for. Declarative on
 * purpose: a route states what it wants, the chrome decides how to render it,
 * so the layout never has to branch on the current pathname.
 */
export interface PageChromeOptions {
  /** Hides the bottom tab bar and the FAB — for immersive, full-page routes. */
  hideBottomNav?: boolean;
  /** Replaces the header avatar with a back chevron pointing at this route. */
  backTo?: string;
  /** Accessible name for that back button. */
  backLabel?: string;
}

/** Stable identity for "no options", so consumers don't re-render for nothing. */
const NO_OPTIONS: PageChromeOptions = {};

interface PageChromeState {
  centerNode: ReactNode | null;
  setCenterNode: (n: ReactNode | null) => void;
  actionBarNode: ReactNode | null;
  setActionBarNode: (n: ReactNode | null) => void;
  options: PageChromeOptions;
  setOptions: (o: PageChromeOptions) => void;
}

const Ctx = createContext<PageChromeState | null>(null);

export function PageChromeProvider({ children }: { children: ReactNode }) {
  const [centerNode, setCenterNode] = useState<ReactNode | null>(null);
  const [actionBarNode, setActionBarNode] = useState<ReactNode | null>(null);
  const [options, setOptions] = useState<PageChromeOptions>(NO_OPTIONS);
  const value = useMemo<PageChromeState>(
    () => ({
      centerNode,
      setCenterNode,
      actionBarNode,
      setActionBarNode,
      options,
      setOptions,
    }),
    [centerNode, actionBarNode, options],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePageChrome(): PageChromeState {
  const c = useContext(Ctx);
  if (!c) {
    // Safe fallback outside the provider: rendering does nothing.
    return {
      centerNode: null,
      setCenterNode: () => {},
      actionBarNode: null,
      setActionBarNode: () => {},
      options: NO_OPTIONS,
      setOptions: () => {},
    };
  }
  return c;
}
