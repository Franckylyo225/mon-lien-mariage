// Brand tokens for MonInvit.com auth emails.
// Colors mirror the app's "Rose Élégance" theme; fonts fall back to
// email-safe families since custom webfonts are unreliable in inboxes.

export const brand = {
  name: 'MonInvit.com',
  tagline: 'Invitations & gestion de mariage',
  primary: '#993556',
  primaryDark: '#7A2440',
  accentBg: '#FBEAF0',
  ink: '#1A1A1A',
  muted: '#6B6B6B',
  softBorder: '#EADCE1',
  pageBg: '#FAFAF9',
} as const;

// Wrapper (page)
export const main = {
  backgroundColor: '#ffffff',
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
  margin: 0,
  padding: '32px 12px',
};

// Card container
export const container = {
  maxWidth: '520px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  border: `1px solid ${brand.softBorder}`,
  borderRadius: '16px',
  overflow: 'hidden' as const,
};

// Header band (brand)
export const header = {
  backgroundColor: brand.primary,
  padding: '28px 32px 22px',
  textAlign: 'center' as const,
};

export const brandName = {
  fontFamily: '"Playfair Display", Georgia, "Times New Roman", serif',
  fontSize: '26px',
  fontStyle: 'italic' as const,
  fontWeight: 500 as const,
  color: '#ffffff',
  margin: 0,
  letterSpacing: '0.02em',
};

export const brandTag = {
  fontSize: '11px',
  color: 'rgba(255,255,255,0.85)',
  letterSpacing: '0.28em',
  textTransform: 'uppercase' as const,
  margin: '8px 0 0',
};

// Body
export const body = {
  padding: '32px 32px 8px',
};

export const h1 = {
  fontFamily: '"Playfair Display", Georgia, "Times New Roman", serif',
  fontStyle: 'italic' as const,
  fontSize: '24px',
  fontWeight: 500 as const,
  color: brand.ink,
  margin: '0 0 18px',
};

export const text = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#3A3A3A',
  margin: '0 0 20px',
};

export const smallText = {
  fontSize: '13px',
  lineHeight: '1.6',
  color: brand.muted,
  margin: '0 0 12px',
};

export const link = {
  color: brand.primary,
  textDecoration: 'underline',
};

export const buttonWrap = {
  padding: '8px 0 24px',
  textAlign: 'center' as const,
};

export const button = {
  backgroundColor: brand.primary,
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 600 as const,
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  borderRadius: '999px',
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'inline-block' as const,
};

export const codeBox = {
  fontFamily: '"JetBrains Mono", "Courier New", monospace',
  fontSize: '28px',
  fontWeight: 700 as const,
  letterSpacing: '0.4em',
  color: brand.primary,
  backgroundColor: brand.accentBg,
  border: `1px solid ${brand.softBorder}`,
  borderRadius: '12px',
  padding: '18px 24px',
  textAlign: 'center' as const,
  margin: '0 0 24px',
};

export const divider = {
  border: 'none',
  borderTop: `1px solid ${brand.softBorder}`,
  margin: '24px 0',
};

export const footer = {
  padding: '20px 32px 28px',
  textAlign: 'center' as const,
  fontSize: '12px',
  color: brand.muted,
  lineHeight: '1.6',
};

export const footerBrand = {
  fontFamily: '"Playfair Display", Georgia, serif',
  fontStyle: 'italic' as const,
  color: brand.primary,
  fontSize: '13px',
  margin: '0 0 4px',
};
