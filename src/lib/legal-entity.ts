/**
 * Identité de l'éditeur du site, affichée dans les mentions légales et citée
 * par les autres pages légales. Source unique : ces informations engagent la
 * société, elles ne doivent pas diverger d'une page à l'autre.
 */
export const LEGAL_ENTITY = {
  /** Dénomination sociale. */
  name: "New Wave Conception",
  legalForm: "SARL",
  capital: "1 000 000 FCFA",
  address: "Cocody, Abidjan, Côte d'Ivoire",
  rccm: "CI-ABJ-03-2022-B12-04941",
  taxId: "2243543Q",
  phone: "+225 07 10 00 71 29",
  /** Adresse de l'éditeur. Le support produit reste contact@moninvit.com. */
  email: "hello@nwc-agency.com",
  /** Service édité par la société. */
  serviceName: "MonInvit.com",
} as const;

/** « +225 07 10 00 71 29 » → « +2250710007129 », pour les liens tel:. */
export const LEGAL_ENTITY_PHONE_HREF = `tel:${LEGAL_ENTITY.phone.replace(/\s/g, "")}`;
