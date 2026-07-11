import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout, Field, GoogleAuthButton, AuthDivider, inputClass } from "./signup";

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
    // Fetch onboarding step to route correctly
    const { data: userRes } = await supabase.auth.getUser();
    const userId = userRes.user?.id;
    if (userId) {
      const { data: w } = await supabase
        .from("weddings")
        .select("onboarding_step")
        .eq("owner_id", userId)
        .maybeSingle();
      const step = w?.onboarding_step ?? 0;
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
    navigate({ to: "/dashboard" });
  };

  return (
    <AuthLayout
      eyebrow="Se connecter"
      title={<>Content de vous <em className="text-[#c17c74]">revoir.</em></>}
      subtitle="Reprenez la préparation de votre grand jour là où vous l'avez laissée."
    >
      <GoogleAuthButton label="Continuer avec Google" />
      <AuthDivider />
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
          />
        </Field>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#2b1a14] px-4 py-3.5 text-sm font-medium tracking-wide text-[#fdf7f3] shadow-lg shadow-[#c17c74]/20 transition hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
      <p className="mt-6 text-center text-xs text-[#6b4a3e]">
        Pas encore de compte —{" "}
        <Link to="/signup" className="font-medium text-[#c17c74] hover:underline">
          S'inscrire
        </Link>
      </p>
    </AuthLayout>
  );
}
