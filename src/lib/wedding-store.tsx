import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CeremonyType =
  | "dot"
  | "civil"
  | "religieux"
  | "traditionnel"
  | "diner"
  | "anniversaire"
  | "autre";

export type TemplateId =
  | "terracotta"
  | "noir-minimal"
  | "botanique-dore"
  | "tropical"
  | "art-deco";


export type RSVPStatus = "confirmé" | "en_attente" | "décliné" | "sans_reponse";

export type GuestSource = "manuel" | "csv" | "auto";

export interface ProgramItem {
  id: string;
  time: string; // "HH:mm"
  title: string;
  description?: string;
}

export interface Ceremony {
  id: string;
  type: CeremonyType;
  label: string;
  name: string;
  date: string; // ISO
  timeStart: string; // "HH:mm"
  timeEnd?: string;
  venue: string;
  mapsUrl?: string;
  dressCode?: string;
  color: string; // hex
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
  allowedPlusOnes: number;
  source: GuestSource;
  ceremonyIds: string[];
  rsvps: RSVP[];
  message?: string;
}

export interface Couple {
  brideName: string;
  groomName: string;
  weddingDate: string; // ISO
  city: string;
  introMessage: string;
  heroImageUrl?: string;
  templateId: TemplateId;
  accent?: string;
  hashtag?: string;
}


interface WeddingState {
  couple: Couple;
  ceremonies: Ceremony[];
  guests: Guest[];
  updateCouple: (patch: Partial<Couple>) => void;
  addCeremony: (c: Omit<Ceremony, "id" | "publicSlug">) => void;
  updateCeremony: (id: string, patch: Partial<Ceremony>) => void;
  removeCeremony: (id: string) => void;
  addGuest: (g: Omit<Guest, "id" | "rsvps"> & { rsvps?: RSVP[] }) => Guest;
  updateGuest: (id: string, patch: Partial<Guest>) => void;
  removeGuest: (id: string) => void;
  setRsvp: (guestId: string, ceremonyId: string, status: RSVPStatus, plusOnes?: number) => void;
}

const WeddingContext = createContext<WeddingState | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10);
const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

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
    color: "#c17c74",
    capacity: 80,
    notes: "Prévoir kolas, pagnes et enveloppe pour la belle-famille.",
    status: "publiée",
    publicSlug: "dot-diabate",
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
  },

];

const seedGuests = (ceremonies: Ceremony[]): Guest[] => {
  const [dot, civil, reception] = ceremonies;
  const mk = (
    name: string,
    group: string,
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
    mk("Tante Adjoua Kouamé", "Famille mariée", 1, [dot.id, civil.id, reception.id], {
      [dot.id]: "confirmé",
      [civil.id]: "confirmé",
      [reception.id]: "confirmé",
    }, "manuel", "+225 07 12 34 56 78"),
    mk("Oncle Yao Diabaté", "Famille mariée", 2, [dot.id, reception.id], {
      [dot.id]: "confirmé",
      [reception.id]: "en_attente",
    }, "manuel", "+225 05 44 12 90 33"),
    mk("N'Guessan Konan", "Famille marié", 1, [dot.id, civil.id, reception.id], {
      [dot.id]: "confirmé",
      [civil.id]: "en_attente",
      [reception.id]: "confirmé",
    }, "manuel"),
    mk("Fatou Traoré", "Amies mariée", 1, [reception.id], {
      [reception.id]: "confirmé",
    }, "csv", "+225 07 88 41 22 10"),
    mk("Marc Anoumaba", "Collègues", 1, [reception.id], {
      [reception.id]: "décliné",
    }, "csv"),
    mk("Grace Adepo", "Amies mariée", 0, [reception.id], {
      [reception.id]: "en_attente",
    }, "auto", "+225 01 22 55 09 87"),
    mk("Pasteur Kouadio", "VIP", 0, [civil.id, reception.id], {
      [civil.id]: "confirmé",
      [reception.id]: "confirmé",
    }),
    mk("Aminata Bakayoko", "Amies mariée", 1, [dot.id, reception.id], {
      [dot.id]: "en_attente",
      [reception.id]: "confirmé",
    }, "auto"),
  ];
};

export function WeddingProvider({ children }: { children: ReactNode }) {
  const [couple, setCouple] = useState<Couple>({
    brideName: "Aïcha",
    groomName: "Stéphane",
    weddingDate: "2027-02-14",
    city: "Abidjan",
    introMessage:
      "Sous le soleil d'Abidjan, nous scellons notre promesse. Nous vous invitons à célébrer cette union entourés de chaleur et de lumière.",
    templateId: "terracotta",
    accent: "#d97757",
    hashtag: "#AichaEtStephane2027",
  });

  const [ceremonies, setCeremonies] = useState<Ceremony[]>(() => seedCeremonies());
  const [guests, setGuests] = useState<Guest[]>(() => seedGuests(seedCeremonies()));

  const updateCouple = useCallback(
    (patch: Partial<Couple>) => setCouple((c) => ({ ...c, ...patch })),
    [],
  );

  const addCeremony = useCallback((c: Omit<Ceremony, "id" | "publicSlug">) => {
    setCeremonies((prev) => [
      ...prev,
      { ...c, id: uid(), publicSlug: slugify(c.name) || uid() },
    ]);
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

  const value = useMemo<WeddingState>(
    () => ({
      couple,
      ceremonies,
      guests,
      updateCouple,
      addCeremony,
      updateCeremony,
      removeCeremony,
      addGuest,
      updateGuest,
      removeGuest,
      setRsvp,
    }),
    [
      couple,
      ceremonies,
      guests,
      updateCouple,
      addCeremony,
      updateCeremony,
      removeCeremony,
      addGuest,
      updateGuest,
      removeGuest,
      setRsvp,
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
  const target = new Date(dateISO + "T00:00:00");
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function formatFrenchDate(dateISO: string): string {
  return new Date(dateISO + "T00:00:00").toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatShortDate(dateISO: string): string {
  return new Date(dateISO + "T00:00:00").toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function nextCeremony(ceremonies: Ceremony[]): Ceremony | undefined {
  const now = Date.now();
  return [...ceremonies]
    .filter((c) => new Date(c.date + "T" + c.timeStart).getTime() >= now)
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
