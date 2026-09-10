import { useEffect, useState } from "react";
import { IconX, IconDeviceMobileShare, IconShare2 } from "@tabler/icons-react";
import {
  getDeferredPrompt,
  isIos,
  isStandalone,
  subscribeInstallPrompt,
  type BeforeInstallPromptEvent,
} from "./pwa-install";

const VISITS_KEY = "moninvit_pwa_visits";
const DISMISSED_KEY = "moninvit_pwa_banner_dismissed_at";
const MIN_VISITS = 2;
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;

function isIosSafari() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const safari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  return isIos() && safari;
}

export function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [iosMode, setIosMode] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone()) return;

    // Count visits to the couples' space
    let visits = 0;
    try {
      visits = Number(localStorage.getItem(VISITS_KEY) ?? "0") + 1;
      localStorage.setItem(VISITS_KEY, String(visits));
    } catch {
      return;
    }

    let dismissedAt = 0;
    try {
      dismissedAt = Number(localStorage.getItem(DISMISSED_KEY) ?? "0");
    } catch {
      dismissedAt = 0;
    }

    const snoozed = dismissedAt > 0 && Date.now() - dismissedAt < SNOOZE_MS;
    const eligible = visits >= MIN_VISITS && !snoozed;
    if (!eligible) return;

    if (isIosSafari()) {
      setIosMode(true);
      const t = window.setTimeout(() => setVisible(true), 1200);
      return () => window.clearTimeout(t);
    }

    const syncPrompt = () => {
      const prompt = getDeferredPrompt();
      if (!prompt) return;
      setDeferred(prompt);
      setVisible(true);
    };
    syncPrompt();
    const unsubscribe = subscribeInstallPrompt(syncPrompt);
    const onInstalled = () => setVisible(false);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      unsubscribe();
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    setDeferred(null);
    setVisible(false);
    if (choice.outcome === "dismissed") {
      try {
        localStorage.setItem(DISMISSED_KEY, String(Date.now()));
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-[4.75rem] z-[90] mx-auto max-w-xl px-3">
      <div className="relative flex items-start gap-3 rounded-2xl border border-[#C6A15B]/40 bg-background/95 p-3.5 shadow-xl shadow-[#201A1C]/10 backdrop-blur">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#E82050]/10 text-[#E82050]">
          {iosMode ? (
            <IconShare2 size={20} strokeWidth={1.8} />
          ) : (
            <IconDeviceMobileShare size={20} strokeWidth={1.8} />
          )}
        </span>

        <div className="min-w-0 flex-1 pr-5">
          <p className="text-[13px] font-medium leading-snug text-foreground">
            Ajoutez MonInvit à votre écran d'accueil
          </p>
          {iosMode ? (
            <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
              Appuyez sur <span className="font-medium text-foreground">Partager</span>, puis
              «&nbsp;Sur l'écran d'accueil&nbsp;».
            </p>
          ) : (
            <>
              <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
                Un accès rapide à votre espace mariés, comme une vraie application.
              </p>
              <button
                onClick={install}
                className="mt-2.5 rounded-full bg-[#E82050] px-4 py-2 text-[12px] font-medium tracking-wide text-white transition active:scale-95"
              >
                Installer
              </button>
            </>
          )}
        </div>

        <button
          onClick={dismiss}
          aria-label="Fermer"
          className="absolute right-2 top-2 grid size-7 place-items-center rounded-full text-foreground/50 transition active:scale-95"
        >
          <IconX size={15} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}
