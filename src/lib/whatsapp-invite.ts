export const DEFAULT_WHATSAPP_INVITE_TEMPLATE =
  "Bonjour {prenom} 👋, vous êtes convié(e) au mariage de {noms_maries} le {date} ! Confirmez votre présence ici : {lien_rsvp}";

const TEMPLATE_VARIABLES = ["prenom", "noms_maries", "date", "lien_rsvp"] as const;

export type WhatsAppInviteValues = Record<(typeof TEMPLATE_VARIABLES)[number], string>;

export function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] || fullName.trim();
}

export function formatEventDate(value: string) {
  if (!value) return "la date prévue";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function renderWhatsAppInvite(template: string, values: WhatsAppInviteValues) {
  return TEMPLATE_VARIABLES.reduce(
    (message, variable) => message.replaceAll(`{${variable}}`, values[variable]),
    template.trim() || DEFAULT_WHATSAPP_INVITE_TEMPLATE,
  );
}

export function normalizeWhatsAppPhone(phone?: string) {
  if (!phone?.trim()) return null;
  const trimmed = phone.trim();
  let digits = trimmed.replace(/\D/g, "");

  if (trimmed.startsWith("00")) digits = digits.slice(2);
  else if (!trimmed.startsWith("+") && !digits.startsWith("225")) digits = `225${digits}`;

  return /^\d{8,15}$/.test(digits) ? digits : null;
}

export function createWhatsAppInviteUrl(phone: string | undefined, message: string) {
  const normalizedPhone = normalizeWhatsAppPhone(phone);
  if (!normalizedPhone) return null;
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}