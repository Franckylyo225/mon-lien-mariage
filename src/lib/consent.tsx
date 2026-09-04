import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { updateFacebookConsent } from "./facebook-pixel";


export type ConsentCategories = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

export type ConsentRecord = {
  version: number;
  date: string;
  categories: ConsentCategories;
};

export const CONSENT_VERSION = 1;
const STORAGE_KEY = "moninvit.consent.v1";
const GA_ID = "G-YZ4VKXCWED";
export const OPEN_PREFERENCES_EVENT = "moninvit:open-consent-preferences";

function readStored(): ConsentRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentRecord;
    if (!parsed || parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStored(record: ConsentRecord) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    /* storage indisponible */
  }
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function gtag(...args: unknown[]) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}

let gaLoaded = false;

function loadAnalytics() {
  if (typeof window === "undefined" || gaLoaded) return;
  gaLoaded = true;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
  gtag("js", new Date());
  gtag("config", GA_ID, { anonymize_ip: true });
}

function applyConsent(categories: ConsentCategories) {
  gtag("consent", "update", {
    analytics_storage: categories.analytics ? "granted" : "denied",
    ad_storage: categories.marketing ? "granted" : "denied",
    ad_user_data: categories.marketing ? "granted" : "denied",
    ad_personalization: categories.marketing ? "granted" : "denied",
  });
  if (categories.analytics) loadAnalytics();
}

type ConsentContextValue = {
  consent: ConsentRecord | null;
  ready: boolean;
  save: (categories: Omit<ConsentCategories, "necessary">) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  reset: () => void;
  preferencesOpen: boolean;
  openPreferences: () => void;
  closePreferences: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<ConsentRecord | null>(null);
  const [ready, setReady] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  useEffect(() => {
    const stored = readStored();
    if (stored) applyConsent(stored.categories);
    setConsent(stored);
    setReady(true);
  }, []);

  useEffect(() => {
    const handler = () => setPreferencesOpen(true);
    window.addEventListener(OPEN_PREFERENCES_EVENT, handler);
    return () => window.removeEventListener(OPEN_PREFERENCES_EVENT, handler);
  }, []);

  const persist = useCallback((categories: ConsentCategories) => {
    const record: ConsentRecord = {
      version: CONSENT_VERSION,
      date: new Date().toISOString(),
      categories,
    };
    writeStored(record);
    applyConsent(categories);
    setConsent(record);
    setPreferencesOpen(false);
  }, []);

  const value = useMemo<ConsentContextValue>(
    () => ({
      consent,
      ready,
      preferencesOpen,
      openPreferences: () => setPreferencesOpen(true),
      closePreferences: () => setPreferencesOpen(false),
      save: (c) => persist({ necessary: true, analytics: c.analytics, marketing: c.marketing }),
      acceptAll: () => persist({ necessary: true, analytics: true, marketing: true }),
      rejectAll: () => persist({ necessary: true, analytics: false, marketing: false }),
      reset: () => {
        try {
          window.localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* noop */
        }
        setConsent(null);
        setPreferencesOpen(true);
      },
    }),
    [consent, ready, preferencesOpen, persist],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent doit être utilisé dans <ConsentProvider>");
  return ctx;
}

export function openConsentPreferences() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(OPEN_PREFERENCES_EVENT));
  }
}
