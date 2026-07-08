import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { GuestType } from "./guest-meta";

export type CeremonyType =
  | "dot"
  | "civil"
  | "religieux"
  | "traditionnel"
  | "diner"
  | "anniversaire"
  | "fiancailles"
  | "autre";

export type TemplateId =
  | "terracotta"
  | "noir-minimal"
  | "botanique-dore"
  | "tropical"
  | "art-deco";

export type ThemeId = "rose-elegance" | "ivoire-epure" | "wax-dore";

export type RSVPStatus = "confirmé" | "en_attente" | "décliné" | "sans_reponse";

export type GuestSource = "manuel" | "csv" | "auto" | "qr_signup";

export interface ProgramItem {
  id: string;
  time: string;
  title: string;
  description?: string;
}

export interface Ceremony {
  id: string;
  type: CeremonyType;
  label: string;
  name: string;
  date: string;
  timeStart: string;
  timeEnd?: string;
  venue: string;
  mapsUrl?: string;
  dressCode?: string;
  color: string;
  capacity?: number;
  notes?: string;
  program?: ProgramItem[];
  status: "brouillon" | "publiée";
  publicSlug: string;
}

export interface RSVP {
  ceremonyId: string;
  status: RSVPStatus;
  plusOnes: number;
}

export interface Guest {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  group: string;
  guestType: GuestType;
  allowedPlusOnes: number;
  source: GuestSource;
  ceremonyIds: string[];
  rsvps: RSVP[];
  message?: string;
}

export interface Couple {
  brideName: string;
  groomName: string;
  weddingDate: string;
  city: string;
  introMessage: string;
  heroImageUrl?: string;
  coupleStory?: string;
  templateId: TemplateId;
  theme: ThemeId;
  accent?: string;
  hashtag?: string;
  slug?: string;
  isPublished: boolean;
  isLocked: boolean;
  publishedAt?: string;
}

export interface Account {
  email: string | null;
  isAuthenticated: boolean;
  onboardingStep: 0 | 1 | 2 | 3 | 4; // 0 = pas commencé, 4 = terminé
}

interface WeddingState {
  account: Account;
  couple: Couple;
  ceremonies: Ceremony[];
  guests: Guest[];
  signIn: (email: string) => void;
  signOut: () => void;
  setOnboardingStep: (n: Account["onboardingStep"]) => void;
  updateCouple: (patch: Partial<Couple>) => void;
  addCeremony: (c: Omit<Ceremony, "id" | "publicSlug">) => Ceremony;
  updateCeremony: (id: string, patch: Partial<Ceremony>) => void;
  removeCeremony: (id: string) => void;
  addGuest: (g: Omit<Guest, "id" | "rsvps"> & { rsvps?: RSVP[] }) => Guest;
  updateGuest: (id: string, patch: Partial<Guest>) => void;
  removeGuest: (id: string) => void;
  setRsvp: (guestId: string, ceremonyId: string, status: RSVPStatus, plusOnes?: number) => void;
  resetAll: () => void;
}

const WeddingContext = createContext<WeddingState | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10);
export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const STORAGE_KEY = "mmci_state_v1";

const defaultCouple = (): Couple => ({
  brideName: "Aïcha",
  groomName: "Stéphane",
  weddingDate: "2027-02-14",
  city: "Abidjan",
  introMessage:
    "Sous le soleil d'Abidjan, nous scellons notre promesse. Nous vous invitons à célébrer cette union entourés de chaleur et de lumière.",
  templateId: "terracotta",
  theme: "rose-elegance",
  accent: "#993556",
  hashtag: "#AichaEtStephane2027",
  isPublished: false,
  isLocked: false,
});

const defaultAccount = (): Account => ({
  email: null,
  isAuthenticated: false,
  onboardingStep: 4, // démo pré-remplie
});

const seedCeremonies = (): Ceremony[] => [
  {
    id: "c1",
    type: "dot",
    label: "Dot Traditionnelle",
    name: "Dot chez la famille Diabaté",
    date: "2027-02-13",
    timeStart: "09:00",
    timeEnd: "13:00",
    venue: "Concession familiale, Yopougon",
    dressCode: "Tenue traditionnelle exigée",
    color: "#993556",
    capacity: 80,
    notes: "Prévoir kolas, pagnes et enveloppe pour la belle-famille.",
    status: "publiée",
    publicSlug: "dot-diabate",
    program: [
      { id: "p1", time: "09:00", title: "Accueil des familles", description: "Café, jus et présentation des délégations." },
      { id: "p2", time: "10:00", title: "Présentation des kolas", description: "Remise symbolique par la famille du marié." },
      { id: "p3", time: "11:30", title: "Bénédiction des anciens" },
      { id: "p4", time: "12:30", title: "Repas traditionnel" },
    ],
  },
  {
    id: "c2",
    type: "civil",
    label: "Mariage Civil",
    name: "Mairie de Cocody",
    date: "2027-02-14",
    timeStart: "11:30",
    timeEnd: "13:00",
    venue: "Hôtel de Ville, Cocody",
    dressCode: "Elégance Riviera",
    color: "#8b6f5e",
    capacity: 60,
    status: "publiée",
    publicSlug: "civil-cocody",
  },
  {
    id: "c3",
    type: "diner",
    label: "Réception & Dîner",
    name: "Les Jardins de Cocody",
    date: "2027-02-14",
    timeStart: "19:00",
    timeEnd: "02:00",
    venue: "Les Jardins de Cocody, Riviera Golf",
    dressCode: "Cocktail chic — accent doré",
    color: "#d97757",
    capacity: 300,
    status: "publiée",
    publicSlug: "reception-jardins",
    program: [
      { id: "p1", time: "19:00", title: "Cocktail de bienvenue", description: "Sur la terrasse, au coucher du soleil." },
      { id: "p2", time: "20:00", title: "Entrée des mariés" },
      { id: "p3", time: "20:30", title: "Dîner assis" },
      { id: "p4", time: "22:00", title: "Discours & première danse" },
      { id: "p5", time: "23:00", title: "Ouverture de la piste" },
    ],
  },
];

const seedGuests = (ceremonies: Ceremony[]): Guest[] => {
  const [dot, civil, reception] = ceremonies;
  const mk = (
    name: string,
    group: string,
    guestType: GuestType,
    allowed: number,
    ids: string[],
    rsvps: Partial<Record<string, RSVPStatus>>,
    source: GuestSource = "manuel",
    phone?: string,
  ): Guest => ({
    id: uid(),
    name,
    phone,
    group,
    guestType,
    allowedPlusOnes: allowed,
    source,
    ceremonyIds: ids,
    rsvps: ids.map((cid) => ({
      ceremonyId: cid,
      status: rsvps[cid] ?? "en_attente",
      plusOnes: 0,
    })),
  });
  return [
    mk("Tante Adjoua Kouamé", "Famille mariée", "parent_mariee", 1, [dot.id, civil.id, reception.id], {
      [dot.id]: "confirmé", [civil.id]: "confirmé", [reception.id]: "confirmé",
    }, "manuel", "+225 07 12 34 56 78"),
    mk("Oncle Yao Diabaté", "Famille mariée", "parent_mariee", 2, [dot.id, reception.id], {
      [dot.id]: "confirmé", [reception.id]: "en_attente",
    }, "manuel", "+225 05 44 12 90 33"),
    mk("N'Guessan Konan", "Famille marié", "parent_marie", 1, [dot.id, civil.id, reception.id], {
      [dot.id]: "confirmé", [civil.id]: "en_attente", [reception.id]: "confirmé",
    }),
    mk("Fatou Traoré", "Amies mariée", "ami_mariee", 1, [reception.id], {
      [reception.id]: "confirmé",
    }, "csv", "+225 07 88 41 22 10"),
    mk("Marc Anoumaba", "Collègues", "collegue", 1, [reception.id], {
      [reception.id]: "décliné",
    }, "csv"),
    mk("Grace Adepo", "Amies mariée", "ami_mariee", 0, [reception.id], {
      [reception.id]: "en_attente",
    }, "auto", "+225 01 22 55 09 87"),
    mk("Pasteur Kouadio", "VIP", "autre", 0, [civil.id, reception.id], {
      [civil.id]: "confirmé", [reception.id]: "confirmé",
    }),
    mk("Aminata Bakayoko", "Amies mariée", "ami_mariee", 1, [dot.id, reception.id], {
      [dot.id]: "en_attente", [reception.id]: "confirmé",
    }),
  ];
};

interface Persisted {
  account: Account;
  couple: Couple;
  ceremonies: Ceremony[];
  guests: Guest[];
}

function loadPersisted(): Persisted | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Persisted;
    if (!parsed?.couple || !Array.isArray(parsed?.ceremonies)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function WeddingProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account>(defaultAccount);
  const [couple, setCouple] = useState<Couple>(defaultCouple);
  const [ceremonies, setCeremonies] = useState<Ceremony[]>(() => seedCeremonies());
  const [guests, setGuests] = useState<Guest[]>(() => seedGuests(seedCeremonies()));
  const [hydrated, setHydrated] = useState(false);

  // Hydrate depuis localStorage côté client
  useEffect(() => {
    const p = loadPersisted();
    if (p) {
      setAccount({ ...defaultAccount(), ...p.account });
      setCouple({ ...defaultCouple(), ...p.couple });
      setCeremonies(p.ceremonies);
      setGuests(p.guests);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ account, couple, ceremonies, guests }),
      );
    } catch { /* quota / SSR */ }
  }, [hydrated, account, couple, ceremonies, guests]);

  // Applique le data-theme sur <html>
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", couple.theme);
  }, [couple.theme]);

  const signIn = useCallback((email: string) => {
    setAccount((a) => ({ ...a, email, isAuthenticated: true }));
  }, []);
  const signOut = useCallback(() => {
    setAccount((a) => ({ ...a, isAuthenticated: false }));
  }, []);
  const setOnboardingStep = useCallback((n: Account["onboardingStep"]) => {
    setAccount((a) => ({ ...a, onboardingStep: n }));
  }, []);

  const updateCouple = useCallback(
    (patch: Partial<Couple>) => setCouple((c) => ({ ...c, ...patch })),
    [],
  );

  const addCeremony = useCallback((c: Omit<Ceremony, "id" | "publicSlug">) => {
    const created: Ceremony = { ...c, id: uid(), publicSlug: slugify(c.name) || uid() };
    setCeremonies((prev) => [...prev, created]);
    return created;
  }, []);

  const updateCeremony = useCallback(
    (id: string, patch: Partial<Ceremony>) =>
      setCeremonies((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c))),
    [],
  );

  const removeCeremony = useCallback((id: string) => {
    setCeremonies((prev) => prev.filter((c) => c.id !== id));
    setGuests((prev) =>
      prev.map((g) => ({
        ...g,
        ceremonyIds: g.ceremonyIds.filter((cid) => cid !== id),
        rsvps: g.rsvps.filter((r) => r.ceremonyId !== id),
      })),
    );
  }, []);

  const addGuest = useCallback<WeddingState["addGuest"]>((g) => {
    const guest: Guest = {
      ...g,
      id: uid(),
      rsvps:
        g.rsvps ??
        g.ceremonyIds.map((cid) => ({ ceremonyId: cid, status: "en_attente", plusOnes: 0 })),
    };
    setGuests((prev) => [guest, ...prev]);
    return guest;
  }, []);

  const updateGuest = useCallback(
    (id: string, patch: Partial<Guest>) =>
      setGuests((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g))),
    [],
  );

  const removeGuest = useCallback(
    (id: string) => setGuests((prev) => prev.filter((g) => g.id !== id)),
    [],
  );

  const setRsvp = useCallback<WeddingState["setRsvp"]>(
    (guestId, ceremonyId, status, plusOnes) => {
      setGuests((prev) =>
        prev.map((g) => {
          if (g.id !== guestId) return g;
          const existing = g.rsvps.find((r) => r.ceremonyId === ceremonyId);
          const nextRsvps = existing
            ? g.rsvps.map((r) =>
                r.ceremonyId === ceremonyId
                  ? { ...r, status, plusOnes: plusOnes ?? r.plusOnes }
                  : r,
              )
            : [...g.rsvps, { ceremonyId, status, plusOnes: plusOnes ?? 0 }];
          return { ...g, rsvps: nextRsvps };
        }),
      );
    },
    [],
  );

  const resetAll = useCallback(() => {
    setAccount(defaultAccount());
    setCouple(defaultCouple());
    const seeds = seedCeremonies();
    setCeremonies(seeds);
    setGuests(seedGuests(seeds));
    try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
  }, []);

  const value = useMemo<WeddingState>(
    () => ({
      account, couple, ceremonies, guests,
      signIn, signOut, setOnboardingStep,
      updateCouple, addCeremony, updateCeremony, removeCeremony,
      addGuest, updateGuest, removeGuest, setRsvp, resetAll,
    }),
    [
      account, couple, ceremonies, guests,
      signIn, signOut, setOnboardingStep,
      updateCouple, addCeremony, updateCeremony, removeCeremony,
      addGuest, updateGuest, removeGuest, setRsvp, resetAll,
    ],
  );

  return <WeddingContext.Provider value={value}>{children}</WeddingContext.Provider>;
}

export function useWedding(): WeddingState {
  const ctx = useContext(WeddingContext);
  if (!ctx) throw new Error("useWedding must be used within WeddingProvider");
  return ctx;
}

// Helpers ------------------------------------------------------------

export function daysUntil(dateISO: string): number {
  if (!dateISO) return 0;
  const target = new Date(dateISO + "T00:00:00");
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function formatFrenchDate(dateISO: string): string {
  if (!dateISO) return "Date à définir";
  return new Date(dateISO + "T00:00:00").toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatShortDate(dateISO: string): string {
  if (!dateISO) return "À définir";
  return new Date(dateISO + "T00:00:00").toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function nextCeremony(ceremonies: Ceremony[]): Ceremony | undefined {
  const now = Date.now();
  return [...ceremonies]
    .filter((c) => c.date && new Date(c.date + "T" + (c.timeStart || "00:00")).getTime() >= now)
    .sort((a, b) => a.date.localeCompare(b.date) || a.timeStart.localeCompare(b.timeStart))[0];
}

export function guestStats(guests: Guest[], ceremonyId?: string) {
  const flat = ceremonyId
    ? guests
        .filter((g) => g.ceremonyIds.includes(ceremonyId))
        .map((g) => g.rsvps.find((r) => r.ceremonyId === ceremonyId)?.status ?? "en_attente")
    : guests.flatMap((g) => g.rsvps.map((r) => r.status));

  const total = flat.length;
  const confirmés = flat.filter((s) => s === "confirmé").length;
  const en_attente = flat.filter((s) => s === "en_attente" || s === "sans_reponse").length;
  const déclinés = flat.filter((s) => s === "décliné").length;
  return { total, confirmés, en_attente, déclinés };
}

// Progression de configuration (0-100)
export function configProgress(state: {
  couple: Couple;
  ceremonies: Ceremony[];
  guests: Guest[];
}): { pct: number; items: { label: string; done: boolean; weight: number }[] } {
  const { couple, ceremonies, guests } = state;
  const items = [
    {
      label: "Prénoms du couple",
      done: !!couple.brideName && !!couple.groomName,
      weight: 15,
    },
    {
      label: "Date du mariage",
      done: !!couple.weddingDate,
      weight: 10,
    },
    {
      label: "Au moins 1 cérémonie avec date et lieu",
      done: ceremonies.some((c) => c.date && c.venue),
      weight: 20,
    },
    {
      label: "Toutes les cérémonies ont date et lieu",
      done: ceremonies.length > 0 && ceremonies.every((c) => c.date && c.venue),
      weight: 15,
    },
    {
      label: "Au moins 5 invités",
      done: guests.length >= 5,
      weight: 15,
    },
    {
      label: "Photo du couple",
      done: !!couple.heroImageUrl,
      weight: 10,
    },
    {
      label: "Thème choisi",
      done: !!couple.theme,
      weight: 15,
    },
  ];
  const pct = items.reduce((sum, i) => sum + (i.done ? i.weight : 0), 0);
  return { pct, items };
}
