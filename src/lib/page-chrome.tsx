import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Slots the dashboard chrome (AppHeader center + a sticky action bar below)
 * exposes so route content can inject custom header contents.
 *
 * A route mounts custom slot contents in `useEffect` and clears them on
 * unmount so returning to a sibling route restores the default title/no-bar
 * layout.
 */
interface PageChromeState {
  centerNode: ReactNode | null;
  setCenterNode: (n: ReactNode | null) => void;
  actionBarNode: ReactNode | null;
  setActionBarNode: (n: ReactNode | null) => void;
}

const Ctx = createContext<PageChromeState | null>(null);

export function PageChromeProvider({ children }: { children: ReactNode }) {
  const [centerNode, setCenterNode] = useState<ReactNode | null>(null);
  const [actionBarNode, setActionBarNode] = useState<ReactNode | null>(null);
  const value = useMemo<PageChromeState>(
    () => ({ centerNode, setCenterNode, actionBarNode, setActionBarNode }),
    [centerNode, actionBarNode],
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
    };
  }
  return c;
}
