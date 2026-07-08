import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout, Field, GoogleAuthButton, AuthDivider } from "./signup";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Connexion — MonMariage.ci" },
      { name: "description", content: "Connectez-vous à votre espace MonMariage.ci." },
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
        "/onboarding/couple",
        "/onboarding/ceremonies",
        "/onboarding/theme",
        "/onboarding/guests",
      ] as const;
      if (step < 4) {
        navigate({ to: targets[step as 0 | 1 | 2 | 3] });
        return;
      }
    }
    navigate({ to: "/dashboard" });
  };

  return (
    <AuthLayout title="Se connecter">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Adresse email">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="vous@exemple.ci"
          />
        </Field>
        <Field label="Mot de passe">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </Field>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Pas encore de compte —{" "}
        <Link to="/signup" className="text-primary hover:underline">
          S'inscrire
        </Link>
      </p>
    </AuthLayout>
  );
}
