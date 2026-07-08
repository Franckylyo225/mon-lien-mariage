import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useWedding } from "@/lib/wedding-store";
import { AuthLayout, Field } from "./signup";

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
  const { signIn, account } = useWedding();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <AuthLayout title="Se connecter">
      <p className="mb-6 rounded-md bg-secondary/60 px-3 py-2 text-xs text-secondary-foreground">
        Mode démo — l'authentification est simulée localement.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          signIn(email);
          const step = account.onboardingStep;
          const targets = ["/onboarding/couple", "/onboarding/ceremonies", "/onboarding/theme", "/onboarding/guests"] as const;
          if (step < 4) {
            navigate({ to: targets[step] });
          } else {
            navigate({ to: "/dashboard" });
          }
        }}
        className="space-y-4"
      >
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
        <button
          type="submit"
          className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Se connecter
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
