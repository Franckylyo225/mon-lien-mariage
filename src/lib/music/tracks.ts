export interface MusicTrack {
  slug: string;
  name: string;
  url: string;
  mood?: string;
}

const R2_BASE = "https://pub-6390c3de4229488f9691491970c6e6f1.r2.dev";

export const MUSIC_TRACKS: MusicTrack[] = [
  { slug: "aisle-under-cotton-lace", name: "Aisle Under Cotton Lace", mood: "Romantique · cordes", url: `${R2_BASE}/aisle-under-cotton-lace.mp3` },
  { slug: "mossveil-vows", name: "Mossveil Vows", mood: "Cérémonie douce", url: `${R2_BASE}/mossveil-vows.mp3` },
  { slug: "mossveil-vows-1", name: "Mossveil Vows II", mood: "Cérémonie douce", url: `${R2_BASE}/mossveil-vows-1.mp3` },
  { slug: "nuit-de-balafon", name: "Nuit de Balafon", mood: "Afro élégant", url: `${R2_BASE}/nuit-de-balafon.mp3` },
  { slug: "valse-de-lin", name: "Valse de Lin", mood: "Valse légère", url: `${R2_BASE}/valse-de-lin.mp3` },
  { slug: "vows-on-silk", name: "Vows on Silk", mood: "Piano intime", url: `${R2_BASE}/vows-on-silk.mp3` },
  { slug: "wildflower-vows", name: "Wildflower Vows", mood: "Champêtre", url: `${R2_BASE}/wildflower-vows.mp3` },
];

export function findTrack(slug?: string | null): MusicTrack | undefined {
  if (!slug) return undefined;
  return MUSIC_TRACKS.find((t) => t.slug === slug);
}
