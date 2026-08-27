import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useConsent } from "@/lib/consent";

function Toggle({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={
        "relative h-6 w-11 shrink-0 rounded-full transition " +
        (checked ? "bg-framboise" : "bg-[#E7DFE1]") +
        (disabled ? " opacity-60" : "")
      }
    >
      <span
        className={
          "absolute top-0.5 size-5 rounded-full bg-white shadow transition-all " +
          (checked ? "left-[22px]" : "left-0.5")
        }
      />
    </button>
  );
}

export function ConsentManager() {
  const { consent, ready, preferencesOpen, closePreferences, openPreferences, acceptAll, rejectAll, save } =
    useConsent();
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (preferencesOpen) {
      setAnalytics(consent?.categories.analytics ?? false);
      setMarketing(consent?.categories.marketing ?? false);
    }
  }, [preferencesOpen, consent]);

  const embedded =
    typeof window !== "undefined" &&
    (window.self !== window.top ||
      new URLSearchParams(window.location.search).has("embed"));

  if (!ready || embedded) return null;

  const showBanner = !consent && !preferencesOpen;
  if (!showBanner && !preferencesOpen) return null;

  return (
    <>
      {showBanner ? (
        <div
          role="dialog"
          aria-live="polite"
          aria-label="Gestion des cookies"
          className="fixed inset-x-0 bottom-0 z-[120] p-3 sm:p-5"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <div className="mx-auto max-h-[80dvh] w-full max-w-3xl overflow-y-auto overscroll-contain rounded-3xl border border-champagne-light bg-greige p-4 shadow-[0_20px_60px_-15px_rgba(32,26,28,0.25)] sm:p-6">
            <p className="kicker">Confidentialité</p>
            <h2 className="mt-1 font-brand-serif text-xl italic text-encre sm:text-2xl">
              Votre vie privée compte
            </h2>
            <p className="mt-2 font-brand-body text-sm leading-relaxed text-encre-doux">
              Nous utilisons des cookies nécessaires au fonctionnement du site et, avec votre
              accord, des cookies de mesure d'audience pour améliorer MonInvit. Vous pouvez
              changer d'avis à tout moment.{" "}
              <Link
                to="/politique-de-confidentialite"
                className="font-medium text-framboise underline decoration-framboise/40 underline-offset-2 hover:text-framboise-hover"
              >
                En savoir plus
              </Link>
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={openPreferences}
                className="btn-outline-framboise min-h-11 w-full px-5 text-sm sm:w-auto"
              >
                Personnaliser
              </button>
              <button
                type="button"
                onClick={rejectAll}
                className="btn-outline-framboise min-h-11 w-full px-5 text-sm sm:w-auto"
              >
                Tout refuser
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="btn-framboise min-h-11 w-full px-5 text-sm sm:w-auto"
              >
                Tout accepter
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {preferencesOpen ? (
        <div className="fixed inset-0 z-[130] flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-encre/50 backdrop-blur-[2px]"
            onClick={() => (consent ? closePreferences() : undefined)}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Préférences de cookies"
            className="relative z-10 max-h-[88dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-3xl border border-champagne-light bg-greige p-5 shadow-[0_20px_60px_-15px_rgba(32,26,28,0.3)] sm:rounded-3xl sm:p-6"
            style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
          >
            <div className="h-1 w-10 rounded-full bg-gradient-to-r from-framboise to-champagne" />
            <h2 className="mt-3 font-brand-serif text-2xl italic text-encre">
              Préférences de cookies
            </h2>
            <p className="mt-2 font-brand-body text-sm text-encre-doux">
              Choisissez les catégories que vous acceptez. Votre choix est enregistré sur cet
              appareil.
            </p>

            <div className="mt-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3 rounded-2xl border border-brand-border bg-white/60 p-4">
                <div className="min-w-0">
                  <p className="font-brand-ui text-sm font-semibold text-encre">Nécessaires</p>
                  <p className="mt-1 font-brand-body text-xs leading-relaxed text-encre-leger">
                    Connexion, sécurité et enregistrement de vos préférences. Toujours actifs.
                  </p>
                </div>
                <Toggle checked disabled label="Cookies nécessaires (toujours actifs)" />
              </div>

              <div className="flex items-start justify-between gap-3 rounded-2xl border border-brand-border bg-white/60 p-4">
                <div className="min-w-0">
                  <p className="font-brand-ui text-sm font-semibold text-encre">Mesure d'audience</p>
                  <p className="mt-1 font-brand-body text-xs leading-relaxed text-encre-leger">
                    Google Analytics, pour comprendre l'usage du site et l'améliorer.
                  </p>
                </div>
                <Toggle checked={analytics} onChange={setAnalytics} label="Cookies de mesure d'audience" />
              </div>

              <div className="flex items-start justify-between gap-3 rounded-2xl border border-brand-border bg-white/60 p-4">
                <div className="min-w-0">
                  <p className="font-brand-ui text-sm font-semibold text-encre">Marketing</p>
                  <p className="mt-1 font-brand-body text-xs leading-relaxed text-encre-leger">
                    Personnalisation des publicités et mesure des campagnes.
                  </p>
                </div>
                <Toggle checked={marketing} onChange={setMarketing} label="Cookies marketing" />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={rejectAll}
                className="btn-outline-framboise min-h-11 w-full px-5 text-sm sm:w-auto"
              >
                Tout refuser
              </button>
              <button
                type="button"
                onClick={() => save({ analytics, marketing })}
                className="btn-framboise min-h-11 w-full px-5 text-sm sm:w-auto"
              >
                Enregistrer mes choix
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
