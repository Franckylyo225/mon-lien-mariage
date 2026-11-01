import { supabase } from "@/integrations/supabase/client";

/** Habillage du bandeau. Le ton porte le message autant que le texte. */
export type SiteBannerVariant = "promo" | "info" | "alerte";

/**
 * Qui voit le bandeau. Le même bandeau sert la vitrine et l'espace connecté, et
 * toutes les annonces ne s'adressent pas aux deux : une promotion sur la
 * publication parle surtout à qui a déjà un compte.
 */
export type SiteBannerAudience = "tous" | "visiteurs" | "connectes";

export interface SiteBanner {
  id: string;
  message: string;
  linkLabel: string | null;
  linkHref: string | null;
  variant: SiteBannerVariant;
  audience: SiteBannerAudience;
  isDismissible: boolean;
  /** Sert de version : un message réécrit se réaffiche à qui l'avait fermé. */
  updatedAt: string;
}

const SELECT = "id,message,link_label,link_href,variant,audience,is_dismissible,updated_at";

const VARIANTS: SiteBannerVariant[] = ["promo", "info", "alerte"];
const AUDIENCES: SiteBannerAudience[] = ["tous", "visiteurs", "connectes"];

/**
 * La colonne est un `text` contraint côté base. Une valeur inconnue ici
 * voudrait dire que la base a pris de l'avance sur le code : on retombe sur le
 * ton neutre plutôt que de ne rien afficher.
 */
function asVariant(value: string): SiteBannerVariant {
  return (VARIANTS as string[]).includes(value) ? (value as SiteBannerVariant) : "info";
}

function asAudience(value: string): SiteBannerAudience {
  return (AUDIENCES as string[]).includes(value) ? (value as SiteBannerAudience) : "tous";
}

/**
 * Le bandeau à afficher, ou `null` s'il n'y en a aucun. Quand plusieurs sont
 * actifs, le plus récemment modifié gagne.
 *
 * La fenêtre de diffusion est filtrée ici en plus de la RLS : la politique qui
 * autorise l'administration à gérer ses bandeaux lui donne aussi le droit de
 * les lire tous, et sans ce filtre un administrateur verrait sur la vitrine un
 * bandeau qu'il vient de programmer pour plus tard.
 */
export async function fetchActiveBanner(): Promise<SiteBanner | null> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("site_banners")
    .select(SELECT)
    .eq("is_active", true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gt.${now}`)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Pas de bandeau plutôt qu'une erreur en travers de toutes les pages : la
  // table peut manquer (migration non encore appliquée) et un bandeau n'est
  // jamais une raison de casser la page qui le porte.
  if (error || !data) return null;

  return {
    id: data.id,
    message: data.message,
    linkLabel: data.link_label,
    linkHref: data.link_href,
    variant: asVariant(data.variant),
    audience: asAudience(data.audience),
    isDismissible: data.is_dismissible,
    updatedAt: data.updated_at,
  };
}

/** Vrai si ce bandeau s'adresse à la surface qui l'affiche. */
export function bannerTargets(
  banner: SiteBanner,
  surface: Exclude<SiteBannerAudience, "tous">,
): boolean {
  return banner.audience === "tous" || banner.audience === surface;
}

/**
 * Clé de fermeture, portée par l'identifiant *et* la date de modification :
 * corriger le texte d'un bandeau le remet devant les yeux de tout le monde,
 * alors que le refermer reste définitif tant qu'il ne change pas.
 */
export function bannerDismissKey(banner: SiteBanner): string {
  return `moninvit.banner.${banner.id}.${banner.updatedAt}`;
}
