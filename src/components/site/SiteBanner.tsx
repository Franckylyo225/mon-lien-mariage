import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import {
  bannerDismissKey,
  bannerTargets,
  fetchActiveBanner,
  type SiteBanner as Banner,
  type SiteBannerAudience,
  type SiteBannerVariant,
} from "@/lib/site-banner";
import { cn } from "@/lib/utils";

const TONES: Record<SiteBannerVariant, { bar: string; link: string; dot: string; close: string }> =
  {
    promo: {
      bar: "bg-encre text-greige",
      link: "text-champagne-light decoration-champagne/60 hover:text-white",
      dot: "bg-framboise",
      close: "text-greige/60 hover:bg-white/10 hover:text-greige",
    },
    info: {
      bar: "bg-rose-poudre text-encre",
      link: "text-framboise decoration-framboise/40 hover:text-framboise-hover",
      dot: "bg-framboise",
      close: "text-encre-leger hover:bg-encre/5 hover:text-encre",
    },
    alerte: {
      bar: "bg-[#A32020] text-white",
      link: "text-white decoration-white/50 hover:text-white",
      dot: "bg-white",
      close: "text-white/70 hover:bg-white/15 hover:text-white",
    },
  };

/**
 * Bandeau d'information piloté depuis l'administration, rendu en tête de la
 * vitrine et de l'espace connecté.
 *
 * `surface` dit où le bandeau est rendu, pour qu'un message réservé aux
 * visiteurs ne s'affiche pas dans l'espace connecté, et inversement.
 *
 * Il n'apparaît qu'après l'hydratation : rien n'est rendu côté serveur, donc
 * la page ne saute pas, et l'absence de bandeau ne coûte rien.
 */
export function SiteBanner({
  surface,
  className,
}: {
  surface: Exclude<SiteBannerAudience, "tous">;
  className?: string;
}) {
  const { data: banner } = useQuery({
    queryKey: ["site-banner"],
    queryFn: fetchActiveBanner,
    // Une annonce n'a pas à être rafraîchie en continu, mais doit pouvoir
    // partir vite : cinq minutes de cache, pas de rechargement au focus.
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!banner) return;
    setDismissed(isDismissed(banner));
  }, [banner]);

  if (!banner || !bannerTargets(banner, surface)) return null;
  if (dismissed) return null;

  return (
    <BannerBar
      banner={banner}
      className={className}
      onClose={
        banner.isDismissible
          ? () => {
              setDismissed(true);
              remember(banner);
            }
          : undefined
      }
    />
  );
}

/**
 * Le bandeau lui-même, sans sa logique de chargement ni de fermeture : c'est
 * ce que l'administration réutilise pour prévisualiser un message avant de le
 * publier, afin que l'aperçu ne puisse pas dériver du rendu réel.
 *
 * Sans `onClose`, aucune croix n'est rendue — un aperçu ne se ferme pas.
 */
export function BannerBar({
  banner,
  onClose,
  className,
}: {
  banner: Banner;
  onClose?: () => void;
  className?: string;
}) {
  const tone = TONES[banner.variant];

  return (
    <aside
      aria-label="Information"
      className={cn(
        "w-full font-[family-name:var(--font-brand-ui)] text-[13px]",
        tone.bar,
        className,
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-2.5">
        <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", tone.dot)} />
        <p className="min-w-0 flex-1 leading-snug">
          {banner.message}
          {banner.linkHref && banner.linkLabel ? (
            <>
              {" "}
              {/* Lien brut plutôt que <Link> : la cible vient de la base, elle
                  n'est pas connue du routeur à la compilation. */}
              <a
                href={banner.linkHref}
                className={cn("font-semibold underline underline-offset-2", tone.link)}
              >
                {banner.linkLabel}
              </a>
            </>
          ) : null}
        </p>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Masquer cette information"
            className={cn(
              "-mr-2 grid size-7 shrink-0 place-items-center rounded-full transition",
              tone.close,
            )}
          >
            <X size={14} />
          </button>
        ) : null}
      </div>
    </aside>
  );
}

/**
 * La fermeture est propre au navigateur : elle ne vaut que pour ce visiteur,
 * et un stockage indisponible (navigation privée, cookies bloqués) ne doit pas
 * empêcher le bandeau de s'afficher.
 */
function isDismissed(banner: Banner): boolean {
  if (!banner.isDismissible) return false;
  try {
    return localStorage.getItem(bannerDismissKey(banner)) === "1";
  } catch {
    return false;
  }
}

function remember(banner: Banner) {
  try {
    localStorage.setItem(bannerDismissKey(banner), "1");
  } catch {
    // Rien à faire : le bandeau revient au prochain chargement.
  }
}
