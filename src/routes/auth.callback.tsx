import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const hash = window.location.hash.startsWith("#")
          ? window.location.hash.slice(1)
          : window.location.hash;
        const params = new URLSearchParams(hash);
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        if (!access_token || !refresh_token) {
          // Peut-être déjà connecté ?
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            window.location.replace("/dashboard");
            return;
          }
          setError("Session introuvable. Merci de réessayer la connexion.");
          return;
        }
        const { error: err } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (err) {
          setError(err.message);
          return;
        }
        window.history.replaceState({}, "", "/auth/callback");
        window.location.replace("/dashboard");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur inconnue.");
      }
    };
    void run();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fff7f1] px-6 text-center">
      <div className="max-w-sm space-y-3">
        {error ? (
          <>
            <h1 className="text-lg font-semibold text-[#2b1a14]">Connexion impossible</h1>
            <p className="text-sm text-[#6b4a3d]">{error}</p>
            <a
              href="/signup"
              className="inline-block rounded-full bg-[#993556] px-5 py-2 text-sm font-medium text-white"
            >
              Réessayer
            </a>
          </>
        ) : (
          <>
            <h1 className="text-lg font-semibold text-[#2b1a14]">Connexion en cours…</h1>
            <p className="text-sm text-[#6b4a3d]">Nous finalisons votre session.</p>
          </>
        )}
      </div>
    </main>
  );
}
