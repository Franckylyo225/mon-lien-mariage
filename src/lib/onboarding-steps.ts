/**
 * Ordre des étapes de l'onboarding — source unique de vérité.
 *
 * Le type d'événement vient en premier : les étapes suivantes adaptent leur
 * vocabulaire à ce choix, elles ont donc besoin de le connaître. Numérotation
 * « Étape n / N », bouton Retour, cible du Continuer, points de progression et
 * reprise du wizard se dérivent tous de ce tableau. Réordonner ici suffit ;
 * aucun numéro ni aucun chemin d'étape ne doit être écrit en dur ailleurs.
 */
export const ONBOARDING_STEPS = [
  "/onboarding/evenement",
  "/onboarding/prenoms",
  "/onboarding/dates",
  "/onboarding/theme",
] as const;

export type OnboardingStepPath = (typeof ONBOARDING_STEPS)[number];

export const ONBOARDING_STEP_COUNT = ONBOARDING_STEPS.length;

/** Où entre toute arrivée dans le wizard (inscription, vérification, reprise). */
export const FIRST_ONBOARDING_STEP = ONBOARDING_STEPS[0];

/**
 * Compteur persisté dans `weddings.onboarding_step` : le nombre d'étapes
 * franchies, `ONBOARDING_STEP_COUNT` valant « wizard terminé ».
 */
export type OnboardingStepCount = 0 | 1 | 2 | 3 | 4;

const indexOf = (path: OnboardingStepPath) => ONBOARDING_STEPS.indexOf(path);

/** Position 1-based, pour les libellés « Étape n / N ». */
export function onboardingStepNumber(path: OnboardingStepPath): number {
  return indexOf(path) + 1;
}

/** Titre de page d'une étape : « Étape 2 / 4 — Vos prénoms ». */
export function onboardingStepTitle(path: OnboardingStepPath, label: string): string {
  return `Étape ${onboardingStepNumber(path)} / ${ONBOARDING_STEP_COUNT} — ${label}`;
}

/** Où mène le Continuer d'une étape : la suivante, ou le tableau de bord. */
export function onboardingNextDestination(
  path: OnboardingStepPath,
): OnboardingStepPath | "/dashboard" {
  return ONBOARDING_STEPS[indexOf(path) + 1] ?? "/dashboard";
}

/** La valeur à persister une fois `path` validée. */
export function onboardingStepAfter(path: OnboardingStepPath): OnboardingStepCount {
  // `indexOf` rend un `number` ; le tableau et l'union ont la même longueur.
  return (indexOf(path) + 1) as OnboardingStepCount;
}

/**
 * L'étape sur laquelle rouvrir le wizard, ou `null` quand il est terminé et
 * que la destination est le tableau de bord.
 *
 * `hasNames` dit si les prénoms sont déjà enregistrés. Il sert au seul cas
 * ambigu décrit ci-dessous ; l'omettre revient à ne se fier qu'au compteur.
 */
export function onboardingResumePath(
  step: number | null | undefined,
  opts: { hasNames?: boolean } = {},
): OnboardingStepPath | null {
  const done = typeof step === "number" && Number.isInteger(step) && step > 0 ? step : 0;
  if (done >= ONBOARDING_STEP_COUNT) return null;

  /**
   * Rattrapage des comptes commencés sous l'ancien ordre (prénoms puis
   * événement) : leur compteur vaut 1 pour « prénoms faits », là où 1 signifie
   * désormais « type d'événement choisi ». Les deux cas se distinguent aux
   * prénoms, car sous le nouvel ordre un compteur à 1 précède forcément leur
   * saisie. Sans ce rattrapage, un compte à mi-parcours repasserait par les
   * prénoms puis sauterait le choix du type — qui ne se rattrape plus ensuite,
   * rien ne permettant de le changer après l'onboarding. À retirer quand il ne
   * reste plus de compte arrêté à l'étape 1.
   */
  if (done === 1 && opts.hasNames) return "/onboarding/evenement";

  return ONBOARDING_STEPS[done];
}
