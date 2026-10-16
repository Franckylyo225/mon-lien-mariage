import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Official Google "G" mark — the four-colour logo required by Google's branding rules. */
function GoogleMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 18 18" aria-hidden focusable="false">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}

/**
 * "Continuer avec Google" — one-tap-ish sign-in that covers both sign-up and
 * sign-in: Supabase creates the account on the first pass and signs the user
 * in on later ones, so the same button serves `/login` and `/signup`.
 */
export function GoogleAuthButton({
  label = "Continuer avec Google",
  onError,
}: {
  label?: string;
  onError?: (message: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const start = async () => {
    setLoading(true);
    onError?.("");
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        // Let the user pick an account instead of silently reusing the last one.
        queryParams: { prompt: "select_account" },
        // Navigate by hand: Google refuses to render its consent screen inside
        // an iframe, so a framed preview must break out to the top window.
        skipBrowserRedirect: true,
      },
    });
    if (error || !data?.url) {
      setLoading(false);
      onError?.(error?.message ?? "Connexion Google indisponible. Réessayez dans un instant.");
      return;
    }
    try {
      // Cross-origin top navigation is permitted here because this runs from a
      // user click; falls back to the current frame if the embedder blocks it.
      (window.top ?? window).location.assign(data.url);
    } catch {
      window.location.assign(data.url);
    }
  };

  return (
    <button
      type="button"
      onClick={start}
      disabled={loading}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#F1E3C6]/70 bg-white px-4 py-3.5 text-sm font-semibold text-[#201A1C] shadow-sm transition hover:border-[#E82050]/40 hover:bg-[#FDF0F3]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E82050]/30 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <GoogleMark className="size-[18px] shrink-0" />
      {loading ? "Redirection…" : label}
    </button>
  );
}

/** "ou" rule separating the Google button from the email form. */
export function AuthDivider({ label = "ou" }: { label?: string }) {
  return (
    <div className="my-5 flex items-center gap-3">
      <span className="h-px flex-1 bg-[#F1E3C6]/80" />
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#7A6D70]">
        {label}
      </span>
      <span className="h-px flex-1 bg-[#F1E3C6]/80" />
    </div>
  );
}
