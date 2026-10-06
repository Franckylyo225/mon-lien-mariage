// Design tokens for every MonInvit.com email.
//
// Two rules shape this file, both learned from what the previous version got
// wrong:
//
// 1. Only declare fonts that inboxes actually have. The old tokens asked for
//    Playfair Display, Inter and JetBrains Mono while nothing ever loaded
//    them — no <link>, no @font-face — so every recipient saw Georgia, Arial
//    and Courier instead, and the design was never seen as drawn. Webfonts in
//    email are unreliable anyway (Gmail strips font links), so the stacks
//    below name only families that ship with the major platforms.
//
// 2. Design for one colour scheme and say so. Mail clients that auto-invert
//    turn a white card dark and take a dark logo with it; the header is a
//    solid brand band with a white logo precisely so it survives either way,
//    and the layout declares `color-scheme: light`.

export const brand = {
  name: "MonInvit.com",
  tagline: "Invitations & gestion de mariage",
  /** Framboise — charte officielle v1.0 */
  primary: "#E82050",
  primaryDark: "#C2143E",
  /** Champagne */
  gold: "#C6A15B",
  /** Champagne dark enough to read as small text on ivory. */
  goldDeep: "#8A6D2C",
  /** Nested panel background. */
  panelBg: "#FDF6F4",
  /** Legacy alias for panelBg. */
  accentBg: "#FDF6F4",
  ink: "#1A1A1A",
  bodyInk: "#3A3A3A",
  muted: "#6B6B6B",
  softBorder: "#F0E2DC",
  pageBg: "#FAF7F0",
} as const;

/** Reversed-out wordmark, sitting on the framboise band. */
export const logoWhiteUrl = "https://moninvit.com/media/logo-moninvit-blanc.png";
/** Dark wordmark, kept for anything rendered on a light surface. */
export const logoUrl = "https://moninvit.com/media/a53d13c7-logo-moninvit.png";

const SERIF = 'Georgia, "Times New Roman", Times, serif';
const SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const MONO = '"Courier New", Courier, monospace';

export const fonts = { serif: SERIF, sans: SANS, mono: MONO } as const;

/* ------------------------------- structure ------------------------------- */

export const main = {
  backgroundColor: brand.pageBg,
  fontFamily: SANS,
  margin: 0,
  padding: "32px 12px",
};

export const container = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#FFFFFF",
  border: `1px solid ${brand.softBorder}`,
  borderRadius: "20px",
  overflow: "hidden" as const,
};

/** Full-bleed brand band. A solid colour keeps the logo legible everywhere. */
export const bandHeader = {
  backgroundColor: brand.primary,
  borderBottom: `2px solid ${brand.gold}`,
  padding: "26px 32px",
  textAlign: "center" as const,
};

export const logo = {
  display: "block" as const,
  margin: "0 auto",
  width: "200px",
  height: "auto" as const,
};

/* ---------------------------------- body --------------------------------- */

export const body = {
  padding: "30px 32px 4px",
};

/** Small capital label naming the kind of message. */
export const eyebrow = {
  fontFamily: SANS,
  fontSize: "11px",
  fontWeight: 700 as const,
  color: brand.goldDeep,
  letterSpacing: "0.2em",
  textTransform: "uppercase" as const,
  margin: "0 0 10px",
};

export const h1 = {
  fontFamily: SERIF,
  fontSize: "28px",
  fontWeight: 400 as const,
  lineHeight: "1.25",
  color: brand.ink,
  margin: "0 0 16px",
};

export const text = {
  fontFamily: SANS,
  fontSize: "16px",
  lineHeight: "1.65",
  color: brand.bodyInk,
  margin: "0 0 18px",
};

export const smallText = {
  fontFamily: SANS,
  fontSize: "14px",
  lineHeight: "1.6",
  color: brand.muted,
  margin: "0 0 12px",
};

export const link = {
  color: brand.primary,
  textDecoration: "underline",
};

/** Nested block isolating the payload: a code, a link, a figure. */
export const panel = {
  backgroundColor: brand.panelBg,
  border: `1px solid ${brand.softBorder}`,
  borderRadius: "14px",
  padding: "20px 24px",
  margin: "0 0 22px",
};

export const codeBox = {
  fontFamily: MONO,
  fontSize: "30px",
  fontWeight: 700 as const,
  letterSpacing: "0.3em",
  color: brand.ink,
  textAlign: "center" as const,
  margin: 0,
  // The tracking adds a trailing gap; pull it back so the code looks centred.
  textIndent: "0.3em",
};

export const divider = {
  border: "none",
  borderTop: `1px solid ${brand.softBorder}`,
  margin: "26px 0 20px",
};

/* --------------------------------- footer -------------------------------- */

export const footer = {
  padding: "22px 32px 28px",
  textAlign: "center" as const,
  borderTop: `1px solid ${brand.softBorder}`,
};

export const footerBrand = {
  fontFamily: SANS,
  fontSize: "11px",
  fontWeight: 700 as const,
  color: brand.goldDeep,
  letterSpacing: "0.2em",
  textTransform: "uppercase" as const,
  margin: "0 0 8px",
};

export const footerText = {
  fontFamily: SANS,
  fontSize: "12px",
  lineHeight: "1.6",
  color: brand.muted,
  margin: 0,
};

/* --------------------------------- button -------------------------------- */
// Rendered as a table in EmailLayout: Outlook's Word engine drops border-radius
// and mishandles padding on a bare <a>, which is how the old button shipped.

export const buttonWrap = {
  padding: "4px 0 26px",
};

export const buttonCell = {
  backgroundColor: brand.primary,
  borderRadius: "999px",
};

export const buttonLink = {
  display: "inline-block" as const,
  fontFamily: SANS,
  fontSize: "16px",
  fontWeight: 600 as const,
  color: "#FFFFFF",
  textDecoration: "none",
  padding: "15px 32px",
  borderRadius: "999px",
  lineHeight: "1.2",
};

/** Kept so older imports of `button` keep compiling. */
export const button = buttonLink;

/** Legacy alias: the header is a band now. */
export const header = bandHeader;
/** Legacy alias for the gold label. */
export const brandTag = eyebrow;
