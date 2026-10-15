import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { AuthLayout, Field, inputClass } from "./signup";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Connexion — MonInvit.com" },
      { name: "description", content: "Connectez-vous à votre espace MonInvit.com." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const routeAfterAuth = async () => {
    // Route based on number of weddings
    const { data: userRes } = await supabase.auth.getUser();
    const userId = userRes.user?.id;
    if (userId) {
      const { data: list } = await supabase
        .from("weddings")
        .select("id, onboarding_step, created_at")
        .eq("owner_id", userId)
        .order("created_at", { ascending: false });
      const weddings = list ?? [];
      if (weddings.length >= 2) {
        navigate({ to: "/dashboard/events" });
        return;
      }
      if (weddings.length === 1) {
        const rawStep = weddings[0].onboarding_step as number | null;
        const step = Number.isInteger(rawStep) && rawStep !== null && rawStep >= 0 && rawStep <= 4
          ? rawStep
          : 0;
        const targets = [
          "/onboarding/prenoms",
          "/onboarding/evenement",
          "/onboarding/dates",
          "/onboarding/theme",
        ] as const;
        if (step < 4) {
          navigate({ to: targets[step as 0 | 1 | 2 | 3] });
          return;
        }
      }
      // 0 weddings → the store will bootstrap one on first dashboard load,
      // but push the user through the onboarding wizard
      if (weddings.length === 0) {
        navigate({ to: "/onboarding/prenoms" });
        return;
      }
    }
    navigate({ to: "/dashboard" });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    await routeAfterAuth();
  };

  const signInWithGoogle = async () => {
    setError(null);
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    setLoading(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    if (result.redirected) return;
    await routeAfterAuth();
  };

  return (
    <AuthLayout
      eyebrow="Se connecter"
      title={<>Content de vous <em className="text-[#E82050]">revoir.</em></>}
      subtitle="Reprenez la préparation de votre grand jour là où vous l'avez laissée."
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Adresse email">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="vous@exemple.ci"
          />
        </Field>
        <Field label="Mot de passe">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Votre mot de passe"
            className={inputClass}
            autoComplete="current-password"
          />
        </Field>
        <div className="-mt-1 text-right">
          <Link
            to="/forgot-password"
            className="text-xs font-medium text-[#E82050] hover:underline"
          >
            Mot de passe oublié ?
          </Link>
        </div>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="btn-brand-gradient w-full rounded-xl px-4 py-3.5 text-sm font-semibold"
        >
          {loading ? "Connexion…" : "Se connecter"}
        </button>
        <div className="flex items-center gap-3 py-1">
          <span className="h-px flex-1 bg-[#F1E3C6]" />
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#7A6D70]">ou</span>
          <span className="h-px flex-1 bg-[#F1E3C6]" />
        </div>
        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#F1E3C6]/80 bg-white px-4 py-3.5 text-sm font-semibold text-[#201A1C] transition hover:bg-[#FDF0F3] disabled:opacity-60"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="size-[18px]">
            <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.16 3.57-8.81Z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A12 12 0 0 0 12 24Z" />
            <path fill="#FBBC05" d="M5.27 14.28a7.2 7.2 0 0 1 0-4.56V6.63H1.29a12 12 0 0 0 0 10.74l3.98-3.09Z" />
            <path fill="#EA4335" d="M12 4.75c1.76 0 3.35.61 4.6 1.8l3.42-3.42A11.98 11.98 0 0 0 12 0 12 12 0 0 0 1.29 6.63l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75Z" />
          </svg>
          Continuer avec Google
        </button>
      </form>
      <p className="mt-6 text-center text-xs text-[#5A4F52]">
        Pas encore de compte —{" "}
        <Link to="/signup" className="font-medium text-[#E82050] hover:underline">
          S'inscrire
        </Link>
      </p>
    </AuthLayout>
  );
}
