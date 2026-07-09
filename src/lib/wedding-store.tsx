import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
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

export type ThemeId =
  // Classiques élégants
  | "rose-elegance"
  | "ivoire-epure"
  | "or-antique"
  // Botaniques
  | "vert-sauge"
  | "jardin-sauvage"
  | "terracotta-boheme"
  // Héritage africain
  | "wax-dore"
  | "kente-royal"
  | "sahel-dore"
  // Modernes éditoriaux
  | "bleu-nuit"
  | "manuscrit"
  | "monochrome"
  // Illustrés
  | "aquarelle"
  | "confetti"
  | "papier-kraft";

export type BackgroundBase = "ivoire" | "creme" | "blanc" | "gris";

export type EventType = "mariage" | "dot" | "traditionnel" | "autre";


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
  rsvpDeadline?: string;
  city: string;
  introMessage: string;
  heroImageUrl?: string;
  coupleStory?: string;
  eventType?: EventType;

  templateId: TemplateId;
  theme: ThemeId;
  accent?: string;
  accentColor?: string;
  backgroundBase?: BackgroundBase;
  hashtag?: string;
  slug?: string;
  isPublished: boolean;
  isLocked: boolean;
  publishedAt?: string;
  hasEnvelopeAnimation?: boolean;
  hasOpeningEffect?: boolean;
  openingEffectSlug?:
    | "envelope-royal"
    | "envelope-floral"
    | "grand-portal"
    | "cinema-curtain"
    | "falling-petals"
    | "book-open";
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  dressCodeNote?: string;
  dressCodeColors?: string[];
  customInfoTitle?: string;
  customInfoBody?: string;
  caption?: string;
  countdownEnabled?: boolean;
  countdownUnits?: Array<"days" | "hours" | "minutes" | "seconds">;
  countdownStyle?: {
    color?: "auto" | "ivoire" | "noir" | "accent";
    size?: "sm" | "md" | "lg";
    font?: "serif" | "sans" | "mono";
    animation?: "none" | "pulse" | "flip";
  };
  practicalInfoEnabled?: boolean;
  practicalParking?: string;
  practicalAccommodation?: string;
  practicalContactName?: string;
  practicalContactPhone?: string;
  registryEnabled?: boolean;
  registryTitle?: string;
  registryNote?: string;
  registryStores?: Array<{ name: string; url?: string }>;
  storyEnabled?: boolean;
  storyTitle?: string;
  storyBody?: string;
  storyImages?: string[];
  storyStyle?: {
    font?: "serif" | "sans" | "script" | "mono" | "display";
    size?: "sm" | "md" | "lg";
    align?: "left" | "center";
  };
  galleryEnabled?: boolean;
  galleryTitle?: string;
  galleryImages?: string[];
  shareTitle?: string;
  shareDescription?: string;
  shareImageUrl?: string;
}


export interface Account {
  email: string | null;
  isAuthenticated: boolean;
  onboardingStep: 0 | 1 | 2 | 3 | 4;
}

interface WeddingState {
  weddingId: string | null;
  loading: boolean;
  account: Account;
  couple: Couple;
  ceremonies: Ceremony[];
  guests: Guest[];
  signOut: () => Promise<void>;
  setOnboardingStep: (n: Account["onboardingStep"]) => Promise<void>;
  updateCouple: (patch: Partial<Couple>) => Promise<void>;
  addCeremony: (c: Omit<Ceremony, "id" | "publicSlug">) => Promise<Ceremony>;
  updateCeremony: (id: string, patch: Partial<Ceremony>) => Promise<void>;
  removeCeremony: (id: string) => Promise<void>;
  addGuest: (g: Omit<Guest, "id" | "rsvps"> & { rsvps?: RSVP[] }) => Promise<Guest>;
  updateGuest: (id: string, patch: Partial<Guest>) => Promise<void>;
  removeGuest: (id: string) => Promise<void>;
  setRsvp: (guestId: string, ceremonyId: string, status: RSVPStatus, plusOnes?: number) => Promise<void>;
  publish: (opts?: { slug?: string; envelopeAnimation?: boolean }) => Promise<void>;
  unpublish: () => Promise<void>;
}

const WeddingContext = createContext<WeddingState | null>(null);

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const defaultCouple = (): Couple => ({
  brideName: "Aïcha",
  groomName: "Stéphane",
  weddingDate: "2027-02-14",
  city: "Abidjan",
  introMessage:
    "Sous le soleil d'Abidjan, nous scellons notre promesse. Nous vous invitons à célébrer cette union entourés de chaleur et de lumière.",
  templateId: "terracotta",
  theme: "rose-elegance",
  eventType: "mariage",

  accent: "#993556",
  hashtag: "#AichaEtStephane2027",
  isPublished: false,
  isLocked: false,
  contactName: "Mariam Diabaté",
  contactPhone: "+225 07 08 09 10 11",
  contactEmail: "contact@aicha-stephane.ci",
  dressCodeNote: "Élégance Riviera — accents dorés et terracotta bienvenus.",
  customInfoTitle: "Bon à savoir",
  customInfoBody:
    "Un service de navette gratuit sera disponible depuis l'hôtel Ivoire à partir de 18h30.",
  countdownEnabled: true,
  countdownUnits: ["days", "hours", "minutes", "seconds"],
});


const defaultAccount = (): Account => ({
  email: null,
  isAuthenticated: false,
  onboardingStep: 4,
});

const emptyCouple = (): Couple => ({
  brideName: "",
  groomName: "",
  weddingDate: "",
  city: "Abidjan",
  introMessage: "",
  templateId: "terracotta",
  theme: "rose-elegance",
  eventType: "mariage",

  isPublished: false,
  isLocked: false,
});

// ---------- Demo data (used for anonymous browsing on /invitation preview) ----------
const demoCeremonies = (): Ceremony[] => [
  {
    id: "demo-c1",
    type: "dot",
    label: "Dot Traditionnelle",
    name: "Dot chez la famille Diabaté",
    date: "2027-02-13",
    timeStart: "09:00",
    timeEnd: "13:00",
    venue: "Concession familiale, Yopougon",
    mapsUrl: "https://maps.google.com/?q=Yopougon+Abidjan",
    dressCode: "Tenue traditionnelle exigée",
    color: "#993556",
    capacity: 80,
    status: "publiée",
    publicSlug: "dot-diabate",
    program: [
      { id: "p1", time: "09:00", title: "Accueil des familles" },
      { id: "p2", time: "10:00", title: "Présentation des kolas" },
      { id: "p3", time: "11:30", title: "Bénédiction des anciens" },
      { id: "p4", time: "12:30", title: "Repas traditionnel" },
    ],
  },
  {
    id: "demo-c2",
    type: "civil",
    label: "Mariage Civil",
    name: "Mairie de Cocody",
    date: "2027-02-14",
    timeStart: "11:30",
    timeEnd: "13:00",
    venue: "Hôtel de Ville, Cocody",
    mapsUrl: "https://maps.google.com/?q=Mairie+de+Cocody+Abidjan",
    dressCode: "Elégance Riviera",
    color: "#8b6f5e",
    capacity: 60,
    status: "publiée",
    publicSlug: "civil-cocody",
  },
  {
    id: "demo-c3",
    type: "diner",
    label: "Réception & Dîner",
    name: "Les Jardins de Cocody",
    date: "2027-02-14",
    timeStart: "19:00",
    timeEnd: "02:00",
    venue: "Les Jardins de Cocody, Riviera Golf",
    mapsUrl: "https://maps.google.com/?q=Riviera+Golf+Cocody",
    dressCode: "Cocktail chic — accent doré",
    color: "#d97757",
    capacity: 300,
    status: "publiée",
    publicSlug: "reception-jardins",
    program: [
      { id: "p1", time: "19:00", title: "Cocktail de bienvenue" },
      { id: "p2", time: "20:00", title: "Entrée des mariés" },
      { id: "p3", time: "20:30", title: "Dîner assis" },
      { id: "p4", time: "22:00", title: "Discours & première danse" },
    ],
  },
];

// ---------- DB row mappers ----------
type WeddingRow = {
  id: string;
  bride_name: string;
  groom_name: string;
  wedding_date: string | null;
  rsvp_deadline: string | null;
  city: string | null;
  intro_message: string | null;
  couple_story: string | null;
  hero_image_url: string | null;
  template_id: string;
  theme: string;
  event_type: string;

  accent: string | null;
  accent_color: string | null;
  background_base: string | null;
  hashtag: string | null;
  slug: string | null;
  is_published: boolean;
  is_locked: boolean;
  published_at: string | null;
  has_envelope_animation: boolean;
  onboarding_step: number;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  dress_code_note: string | null;
  dress_code_colors: string[] | null;
  custom_info_title: string | null;
  custom_info_body: string | null;
  caption: string | null;
  countdown_enabled: boolean | null;
  countdown_units: string[] | null;
  countdown_style: Record<string, unknown> | null;
  practical_info_enabled: boolean | null;
  practical_parking: string | null;
  practical_accommodation: string | null;
  practical_contact_name: string | null;
  practical_contact_phone: string | null;
  registry_enabled: boolean | null;
  registry_title: string | null;
  registry_note: string | null;
  registry_stores: Array<{ name: string; url?: string }> | null;
  story_enabled: boolean | null;
  story_title: string | null;
  story_body: string | null;
  story_images: string[] | null;
  story_style: Record<string, unknown> | null;
  gallery_enabled: boolean | null;
  gallery_title: string | null;
  gallery_images: string[] | null;
  share_title: string | null;
  share_description: string | null;
  share_image_url: string | null;
};


function rowToCouple(w: WeddingRow): Couple {
  return {
    brideName: w.bride_name ?? "",
    groomName: w.groom_name ?? "",
    weddingDate: w.wedding_date ?? "",
    rsvpDeadline: w.rsvp_deadline ?? undefined,
    city: w.city ?? "Abidjan",
    introMessage: w.intro_message ?? "",
    coupleStory: w.couple_story ?? undefined,
    heroImageUrl: w.hero_image_url ?? undefined,
    templateId: (w.template_id as TemplateId) ?? "terracotta",
    theme: (w.theme as ThemeId) ?? "rose-elegance",
    eventType: ((w.event_type as EventType) ?? "mariage"),

    accent: w.accent ?? undefined,
    accentColor: w.accent_color ?? undefined,
    backgroundBase: (w.background_base as BackgroundBase | null) ?? undefined,
    hashtag: w.hashtag ?? undefined,
    slug: w.slug ?? undefined,
    isPublished: !!w.is_published,
    isLocked: !!w.is_locked,
    publishedAt: w.published_at ?? undefined,
    hasEnvelopeAnimation: !!w.has_envelope_animation,
    hasOpeningEffect: !!(w as { has_opening_effect?: boolean | null }).has_opening_effect,
    openingEffectSlug:
      ((w as { opening_effect_slug?: string | null }).opening_effect_slug as Couple["openingEffectSlug"]) ?? undefined,
    contactName: w.contact_name ?? undefined,
    contactPhone: w.contact_phone ?? undefined,
    contactEmail: w.contact_email ?? undefined,
    dressCodeNote: w.dress_code_note ?? undefined,
    dressCodeColors: w.dress_code_colors ?? [],
    customInfoTitle: w.custom_info_title ?? undefined,
    customInfoBody: w.custom_info_body ?? undefined,
    caption: w.caption ?? undefined,
    countdownEnabled: w.countdown_enabled ?? true,
    countdownUnits: (w.countdown_units as Couple["countdownUnits"]) ?? [
      "days",
      "hours",
      "minutes",
      "seconds",
    ],
    countdownStyle: (w.countdown_style as Couple["countdownStyle"]) ?? {},
    practicalInfoEnabled: w.practical_info_enabled ?? false,
    practicalParking: w.practical_parking ?? undefined,
    practicalAccommodation: w.practical_accommodation ?? undefined,
    practicalContactName: w.practical_contact_name ?? undefined,
    practicalContactPhone: w.practical_contact_phone ?? undefined,
    registryEnabled: w.registry_enabled ?? false,
    registryTitle: w.registry_title ?? undefined,
    registryNote: w.registry_note ?? undefined,
    registryStores: Array.isArray(w.registry_stores) ? w.registry_stores : [],
    storyEnabled: w.story_enabled ?? true,
    storyTitle: w.story_title ?? undefined,
    storyBody: w.story_body ?? undefined,
    storyImages: w.story_images ?? [],
    storyStyle: (w.story_style as Couple["storyStyle"]) ?? {},
    galleryEnabled: w.gallery_enabled ?? false,
    galleryTitle: w.gallery_title ?? undefined,
    galleryImages: w.gallery_images ?? [],
    shareTitle: w.share_title ?? undefined,
    shareDescription: w.share_description ?? undefined,
    shareImageUrl: w.share_image_url ?? undefined,
  };
}

function coupleToRow(p: Partial<Couple>): Record<string, unknown> {
  const r: Record<string, unknown> = {};
  if (p.brideName !== undefined) r.bride_name = p.brideName;
  if (p.groomName !== undefined) r.groom_name = p.groomName;
  if (p.weddingDate !== undefined) r.wedding_date = p.weddingDate || null;
  if (p.rsvpDeadline !== undefined) r.rsvp_deadline = p.rsvpDeadline || null;
  if (p.city !== undefined) r.city = p.city;
  if (p.introMessage !== undefined) r.intro_message = p.introMessage;
  if (p.coupleStory !== undefined) r.couple_story = p.coupleStory;
  if (p.heroImageUrl !== undefined) r.hero_image_url = p.heroImageUrl || null;
  if (p.templateId !== undefined) r.template_id = p.templateId;
  if (p.theme !== undefined) r.theme = p.theme;
  if (p.eventType !== undefined) r.event_type = p.eventType;

  if (p.accent !== undefined) r.accent = p.accent;
  if (p.accentColor !== undefined) r.accent_color = p.accentColor || null;
  if (p.backgroundBase !== undefined) r.background_base = p.backgroundBase || null;
  if (p.hashtag !== undefined) r.hashtag = p.hashtag;
  if (p.slug !== undefined) r.slug = p.slug;
  if (p.isPublished !== undefined) r.is_published = p.isPublished;
  if (p.isLocked !== undefined) r.is_locked = p.isLocked;
  if (p.publishedAt !== undefined) r.published_at = p.publishedAt;
  if (p.hasEnvelopeAnimation !== undefined) r.has_envelope_animation = p.hasEnvelopeAnimation;
  if (p.hasOpeningEffect !== undefined) r.has_opening_effect = p.hasOpeningEffect;
  if (p.openingEffectSlug !== undefined) r.opening_effect_slug = p.openingEffectSlug ?? null;
  if (p.contactName !== undefined) r.contact_name = p.contactName;
  if (p.contactPhone !== undefined) r.contact_phone = p.contactPhone;
  if (p.contactEmail !== undefined) r.contact_email = p.contactEmail;
  if (p.dressCodeNote !== undefined) r.dress_code_note = p.dressCodeNote;
  if (p.dressCodeColors !== undefined) r.dress_code_colors = p.dressCodeColors ?? [];
  if (p.customInfoTitle !== undefined) r.custom_info_title = p.customInfoTitle;
  if (p.customInfoBody !== undefined) r.custom_info_body = p.customInfoBody;
  if (p.caption !== undefined) r.caption = p.caption || null;
  if (p.countdownEnabled !== undefined) r.countdown_enabled = p.countdownEnabled;
  if (p.countdownUnits !== undefined) r.countdown_units = p.countdownUnits;
  if (p.countdownStyle !== undefined) r.countdown_style = p.countdownStyle ?? {};
  if (p.practicalInfoEnabled !== undefined) r.practical_info_enabled = p.practicalInfoEnabled;
  if (p.practicalParking !== undefined) r.practical_parking = p.practicalParking || null;
  if (p.practicalAccommodation !== undefined) r.practical_accommodation = p.practicalAccommodation || null;
  if (p.practicalContactName !== undefined) r.practical_contact_name = p.practicalContactName || null;
  if (p.practicalContactPhone !== undefined) r.practical_contact_phone = p.practicalContactPhone || null;
  if (p.registryEnabled !== undefined) r.registry_enabled = p.registryEnabled;
  if (p.registryTitle !== undefined) r.registry_title = p.registryTitle || null;
  if (p.registryNote !== undefined) r.registry_note = p.registryNote || null;
  if (p.registryStores !== undefined) r.registry_stores = p.registryStores ?? [];
  if (p.storyEnabled !== undefined) r.story_enabled = p.storyEnabled;
  if (p.storyTitle !== undefined) r.story_title = p.storyTitle || null;
  if (p.storyBody !== undefined) r.story_body = p.storyBody || null;
  if (p.storyImages !== undefined) r.story_images = p.storyImages ?? [];
  if (p.storyStyle !== undefined) r.story_style = p.storyStyle ?? {};
  if (p.galleryEnabled !== undefined) r.gallery_enabled = p.galleryEnabled;
  if (p.galleryTitle !== undefined) r.gallery_title = p.galleryTitle || null;
  if (p.galleryImages !== undefined) r.gallery_images = p.galleryImages ?? [];
  if (p.shareTitle !== undefined) r.share_title = p.shareTitle || null;
  if (p.shareDescription !== undefined) r.share_description = p.shareDescription || null;
  if (p.shareImageUrl !== undefined) r.share_image_url = p.shareImageUrl || null;
  return r;
}

type CeremonyRow = {
  id: string;
  type: string;
  label: string;
  name: string;
  date: string | null;
  time_start: string | null;
  time_end: string | null;
  venue: string | null;
  maps_url: string | null;
  dress_code: string | null;
  color: string | null;
  capacity: number | null;
  notes: string | null;
  program: ProgramItem[] | null;
  status: string;
  public_slug: string;
  sort_order: number;
};

function rowToCeremony(c: CeremonyRow): Ceremony {
  return {
    id: c.id,
    type: (c.type as CeremonyType) ?? "autre",
    label: c.label ?? "",
    name: c.name ?? "",
    date: c.date ?? "",
    timeStart: c.time_start ?? "",
    timeEnd: c.time_end ?? undefined,
    venue: c.venue ?? "",
    mapsUrl: c.maps_url ?? undefined,
    dressCode: c.dress_code ?? undefined,
    color: c.color ?? "#993556",
    capacity: c.capacity ?? undefined,
    notes: c.notes ?? undefined,
    program: Array.isArray(c.program) ? c.program : [],
    status: (c.status as Ceremony["status"]) ?? "brouillon",
    publicSlug: c.public_slug ?? "",
  };
}

function ceremonyToRow(c: Partial<Ceremony>): Record<string, unknown> {
  const r: Record<string, unknown> = {};
  if (c.type !== undefined) r.type = c.type;
  if (c.label !== undefined) r.label = c.label;
  if (c.name !== undefined) r.name = c.name;
  if (c.date !== undefined) r.date = c.date || null;
  if (c.timeStart !== undefined) r.time_start = c.timeStart;
  if (c.timeEnd !== undefined) r.time_end = c.timeEnd;
  if (c.venue !== undefined) r.venue = c.venue;
  if (c.mapsUrl !== undefined) r.maps_url = c.mapsUrl;
  if (c.dressCode !== undefined) r.dress_code = c.dressCode;
  if (c.color !== undefined) r.color = c.color;
  if (c.capacity !== undefined) r.capacity = c.capacity;
  if (c.notes !== undefined) r.notes = c.notes;
  if (c.program !== undefined) r.program = c.program;
  if (c.status !== undefined) r.status = c.status;
  if (c.publicSlug !== undefined) r.public_slug = c.publicSlug;
  return r;
}

type GuestRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  group_name: string;
  guest_type: string;
  allowed_plus_ones: number;
  source: string;
  ceremony_ids: string[];
  rsvps: RSVP[] | null;
  message: string | null;
};

function rowToGuest(g: GuestRow): Guest {
  return {
    id: g.id,
    name: g.name,
    phone: g.phone ?? undefined,
    email: g.email ?? undefined,
    group: g.group_name ?? "",
    guestType: (g.guest_type as GuestType) ?? "autre",
    allowedPlusOnes: g.allowed_plus_ones ?? 0,
    source: (g.source as GuestSource) ?? "manuel",
    ceremonyIds: Array.isArray(g.ceremony_ids) ? g.ceremony_ids : [],
    rsvps: Array.isArray(g.rsvps) ? g.rsvps : [],
    message: g.message ?? undefined,
  };
}

function guestToRow(g: Partial<Guest>): Record<string, unknown> {
  const r: Record<string, unknown> = {};
  if (g.name !== undefined) r.name = g.name;
  if (g.phone !== undefined) r.phone = g.phone;
  if (g.email !== undefined) r.email = g.email;
  if (g.group !== undefined) r.group_name = g.group;
  if (g.guestType !== undefined) r.guest_type = g.guestType;
  if (g.allowedPlusOnes !== undefined) r.allowed_plus_ones = g.allowedPlusOnes;
  if (g.source !== undefined) r.source = g.source;
  if (g.ceremonyIds !== undefined) r.ceremony_ids = g.ceremonyIds;
  if (g.rsvps !== undefined) r.rsvps = g.rsvps;
  if (g.message !== undefined) r.message = g.message;
  return r;
}

export function WeddingProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [weddingId, setWeddingId] = useState<string | null>(null);

  const [account, setAccount] = useState<Account>(defaultAccount);
  const [couple, setCouple] = useState<Couple>(defaultCouple);
  const [ceremonies, setCeremonies] = useState<Ceremony[]>(demoCeremonies);
  const [guests, setGuests] = useState<Guest[]>([]);

  const loadedFor = useRef<string | null>(null);

  // Auth subscription
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Load or create wedding when session changes
  useEffect(() => {
    if (!authReady) return;
    if (!session) {
      loadedFor.current = null;
      setWeddingId(null);
      setAccount(defaultAccount());
      setCouple(defaultCouple());
      setCeremonies(demoCeremonies());
      setGuests([]);
      setLoading(false);
      return;
    }
    if (loadedFor.current === session.user.id) return;
    loadedFor.current = session.user.id;
    setLoading(true);

    (async () => {
      let { data: w } = await supabase
        .from("weddings")
        .select("*")
        .eq("owner_id", session.user.id)
        .maybeSingle();

      if (!w) {
        const empty = emptyCouple();
        const insertRow = { owner_id: session.user.id, ...coupleToRow(empty) };
        const { data: created, error } = await supabase
          .from("weddings")
          .insert(insertRow as never)
          .select("*")
          .single();
        if (error) {
          console.error("createWedding", error);
          setLoading(false);
          return;
        }
        w = created;
      }

      const wRow = w as WeddingRow;
      setWeddingId(wRow.id);
      setCouple(rowToCouple(wRow));
      setAccount({
        email: session.user.email ?? null,
        isAuthenticated: true,
        onboardingStep: (wRow.onboarding_step as Account["onboardingStep"]) ?? 0,
      });

      const [{ data: cs }, { data: gs }] = await Promise.all([
        supabase.from("ceremonies").select("*").eq("wedding_id", wRow.id).order("sort_order"),
        supabase.from("guests").select("*").eq("wedding_id", wRow.id).order("created_at"),
      ]);
      setCeremonies((cs ?? []).map((c) => rowToCeremony(c as CeremonyRow)));
      setGuests((gs ?? []).map((g) => rowToGuest(g as GuestRow)));
      setLoading(false);
    })();
  }, [session, authReady]);

  // Apply data-theme
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", couple.theme);
  }, [couple.theme]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const setOnboardingStep = useCallback<WeddingState["setOnboardingStep"]>(
    async (n) => {
      setAccount((a) => ({ ...a, onboardingStep: n }));
      if (weddingId) {
        await supabase.from("weddings").update({ onboarding_step: n } as never).eq("id", weddingId);
      }
    },
    [weddingId],
  );

  const updateCouple = useCallback<WeddingState["updateCouple"]>(
    async (patch) => {
      setCouple((c) => ({ ...c, ...patch }));
      if (weddingId) {
        const { error } = await supabase
          .from("weddings")
          .update(coupleToRow(patch) as never)
          .eq("id", weddingId);
        if (error) console.error("updateCouple", error);
      }
    },
    [weddingId],
  );

  const addCeremony = useCallback<WeddingState["addCeremony"]>(
    async (c) => {
      const id = uid();
      const publicSlug = slugify(c.name) || id.slice(0, 6);
      const created: Ceremony = { ...c, id, publicSlug };
      setCeremonies((prev) => [...prev, created]);
      if (weddingId) {
        const row = {
          id,
          wedding_id: weddingId,
          ...ceremonyToRow(created),
          sort_order: ceremonies.length,
        };
        const { error } = await supabase.from("ceremonies").insert(row as never);
        if (error) console.error("addCeremony", error);
      }
      return created;
    },
    [weddingId, ceremonies.length],
  );

  const updateCeremony = useCallback<WeddingState["updateCeremony"]>(
    async (id, patch) => {
      setCeremonies((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
      if (weddingId) {
        const { error } = await supabase
          .from("ceremonies")
          .update(ceremonyToRow(patch) as never)
          .eq("id", id);
        if (error) console.error("updateCeremony", error);
      }
    },
    [weddingId],
  );

  const removeCeremony = useCallback<WeddingState["removeCeremony"]>(
    async (id) => {
      setCeremonies((prev) => prev.filter((c) => c.id !== id));
      setGuests((prev) =>
        prev.map((g) => ({
          ...g,
          ceremonyIds: g.ceremonyIds.filter((cid) => cid !== id),
          rsvps: g.rsvps.filter((r) => r.ceremonyId !== id),
        })),
      );
      if (weddingId) {
        const { error } = await supabase.from("ceremonies").delete().eq("id", id);
        if (error) console.error("removeCeremony", error);
      }
    },
    [weddingId],
  );

  const addGuest = useCallback<WeddingState["addGuest"]>(
    async (g) => {
      const id = uid();
      const rsvps =
        g.rsvps ??
        g.ceremonyIds.map((cid) => ({ ceremonyId: cid, status: "en_attente" as RSVPStatus, plusOnes: 0 }));
      const created: Guest = { ...g, id, rsvps };
      setGuests((prev) => [created, ...prev]);
      if (weddingId) {
        const row = { id, wedding_id: weddingId, ...guestToRow(created) };
        const { error } = await supabase.from("guests").insert(row as never);
        if (error) console.error("addGuest", error);
      }
      return created;
    },
    [weddingId],
  );

  const updateGuest = useCallback<WeddingState["updateGuest"]>(
    async (id, patch) => {
      setGuests((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));
      if (weddingId) {
        const { error } = await supabase.from("guests").update(guestToRow(patch) as never).eq("id", id);
        if (error) console.error("updateGuest", error);
      }
    },
    [weddingId],
  );

  const removeGuest = useCallback<WeddingState["removeGuest"]>(
    async (id) => {
      setGuests((prev) => prev.filter((g) => g.id !== id));
      if (weddingId) {
        const { error } = await supabase.from("guests").delete().eq("id", id);
        if (error) console.error("removeGuest", error);
      }
    },
    [weddingId],
  );

  const setRsvp = useCallback<WeddingState["setRsvp"]>(
    async (guestId, ceremonyId, status, plusOnes) => {
      let nextRsvps: RSVP[] = [];
      setGuests((prev) =>
        prev.map((g) => {
          if (g.id !== guestId) return g;
          const existing = g.rsvps.find((r) => r.ceremonyId === ceremonyId);
          nextRsvps = existing
            ? g.rsvps.map((r) =>
                r.ceremonyId === ceremonyId
                  ? { ...r, status, plusOnes: plusOnes ?? r.plusOnes }
                  : r,
              )
            : [...g.rsvps, { ceremonyId, status, plusOnes: plusOnes ?? 0 }];
          return { ...g, rsvps: nextRsvps };
        }),
      );
      if (weddingId) {
        await supabase.from("guests").update({ rsvps: nextRsvps as unknown as never } as never).eq("id", guestId);
      }
    },
    [weddingId],
  );

  const publish = useCallback<WeddingState["publish"]>(
    async (opts) => {
      const baseSlug =
        opts?.slug || couple.slug || slugify(`${couple.brideName}-et-${couple.groomName}`) || uid();
      const patch: Partial<Couple> = {
        slug: baseSlug,
        isPublished: true,
        isLocked: true,
        publishedAt: new Date().toISOString(),
        hasEnvelopeAnimation: opts?.envelopeAnimation ?? couple.hasEnvelopeAnimation ?? false,
      };
      setCouple((c) => ({ ...c, ...patch }));
      if (weddingId) {
        const { error } = await supabase.from("weddings").update(coupleToRow(patch) as never).eq("id", weddingId);
        if (error) console.error("publish", error);
      }
    },
    [weddingId, couple.slug, couple.brideName, couple.groomName, couple.hasEnvelopeAnimation],
  );

  const unpublish = useCallback<WeddingState["unpublish"]>(async () => {
    const patch: Partial<Couple> = { isPublished: false, isLocked: false };
    setCouple((c) => ({ ...c, ...patch }));
    if (weddingId) {
      await supabase.from("weddings").update(coupleToRow(patch) as never).eq("id", weddingId);
    }
  }, [weddingId]);

  const value = useMemo<WeddingState>(
    () => ({
      weddingId,
      loading,
      account,
      couple,
      ceremonies,
      guests,
      signOut,
      setOnboardingStep,
      updateCouple,
      addCeremony,
      updateCeremony,
      removeCeremony,
      addGuest,
      updateGuest,
      removeGuest,
      setRsvp,
      publish,
      unpublish,
    }),
    [
      weddingId,
      loading,
      account,
      couple,
      ceremonies,
      guests,
      signOut,
      setOnboardingStep,
      updateCouple,
      addCeremony,
      updateCeremony,
      removeCeremony,
      addGuest,
      updateGuest,
      removeGuest,
      setRsvp,
      publish,
      unpublish,
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

export function configProgress(state: {
  couple: Couple;
  ceremonies: Ceremony[];
  guests: Guest[];
}): { pct: number; items: { label: string; done: boolean; weight: number }[] } {
  const { couple, ceremonies, guests } = state;
  const items = [
    { label: "Prénoms du couple", done: !!couple.brideName && !!couple.groomName, weight: 15 },
    { label: "Date du mariage", done: !!couple.weddingDate, weight: 10 },
    { label: "Au moins 1 étape avec date et lieu", done: ceremonies.some((c) => c.date && c.venue), weight: 20 },
    { label: "Toutes les étapes ont date et lieu", done: ceremonies.length > 0 && ceremonies.every((c) => c.date && c.venue), weight: 15 },
    { label: "Au moins 5 invités", done: guests.length >= 5, weight: 15 },
    { label: "Photo du couple", done: !!couple.heroImageUrl, weight: 10 },
    { label: "Thème choisi", done: !!couple.theme, weight: 15 },
  ];
  const pct = items.reduce((sum, i) => sum + (i.done ? i.weight : 0), 0);
  return { pct, items };
}
