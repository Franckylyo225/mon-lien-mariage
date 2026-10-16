import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { resolvePostAuthPath } from "@/lib/auth-redirect";
import { fbq } from "@/lib/facebook-pixel";
import { AuthLayout } from "./signup";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [
      { title: "Connexion en cours — MonInvit.com" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuthCallbackPage,
});

/** An account created within this window is treated as a fresh sign-up. */
const NEW_ACCOUNT_WINDOW_MS = 2 * 60 * 1000;

/**
 * Landing page for the Google OAuth return trip.
 *
 * Supabase can hand the session back three ways depending on the project's
 * flow type, so all three are covered:
 *   - `?code=...`               → PKCE, needs exchangeCodeForSession
 *   - `#access_token=...`       → implicit, parsed by the client on init
 *   - `?error=...` / `#error=…` → the user cancelled or the provider refused
 */
function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fail = (message: string) => {
      if (!cancelled) setError(message);
    };

    void (async () => {
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(url.hash.replace(/^#/, ""));

      const providerError =
        url.searchParams.get("error_description") ||
        url.searchParams.get("error") ||
        hash.get("error_description") ||
        hash.get("error");
      if (providerError) {
        fail(providerError === "access_denied" ? "Connexion Google annulée." : providerError);
        return;
      }

      const code = url.searchParams.get("code");
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          fail(exchangeError.message);
          return;
        }
      }

      // With the implicit flow the client consumes the hash while initialising,
      // which `getSession` awaits.
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        fail(sessionError.message);
        return;
      }
      const user = data.session?.user;
      if (!user) {
        fail("Session introuvable. Merci de réessayer.");
        return;
      }

      // Strip the tokens/code from the address bar before going further.
      window.history.replaceState({}, "", "/auth/callback");

      const createdAt = user.created_at ? Date.parse(user.created_at) : NaN;
      const isNewAccount =
        Number.isFinite(createdAt) && Date.now() - createdAt < NEW_ACCOUNT_WINDOW_MS;
      if (isNewAccount) {
        // Admin notification + welcome email are handled DB-side by the
        // on_profile_created trigger, so only the pixel is fired here.
        fbq("track", "CompleteRegistration", { content_name: "signup_google" });
      }

      let target: Awaited<ReturnType<typeof resolvePostAuthPath>> = "/dashboard";
      try {
        target = await resolvePostAuthPath(user.id);
      } catch {
        /* routing is best-effort — the dashboard fallback always works */
      }
      if (!cancelled) navigate({ to: target, replace: true });
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (error) {
    return (
      <AuthLayout
        eyebrow="Connexion Google"
        title={
          <>
            Connexion <em className="text-[#E82050]">interrompue.</em>
          </>
        }
        subtitle="Nous n'avons pas pu finaliser la connexion avec Google."
      >
        <p className="text-xs text-destructive">{error}</p>
        <Link
          to="/login"
          className="btn-brand-gradient mt-6 block rounded-xl px-4 py-3.5 text-center text-sm font-semibold"
        >
          Revenir à la connexion
        </Link>
      </AuthLayout>
    );
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[#FBF8F8]">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#7A6D70]">
        Connexion en cours…
      </p>
    </div>
  );
}
