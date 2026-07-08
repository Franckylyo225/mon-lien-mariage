import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useWedding } from "@/lib/wedding-store";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Inscription — MonMariage.ci" },
      { name: "description", content: "Créez votre compte MonMariage.ci pour préparer votre mariage." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { signIn, setOnboardingStep, resetAll } = useWedding();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cgu, setCgu] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <AuthLayout title="Créer un compte">
      <p className="mb-6 rounded-md bg-secondary/60 px-3 py-2 text-xs text-secondary-foreground">
        Mode démo — l'authentification est simulée localement.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!email.includes("@")) return setError("Adresse email invalide.");
          if (password.length < 8) return setError("Au moins 8 caractères.");
          if (!cgu) return setError("Merci d'accepter les CGU.");
          resetAll();
          signIn(email);
          setOnboardingStep(0);
          navigate({ to: "/onboarding/couple" });
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
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="Au moins 8 caractères"
          />
        </Field>
        <label className="flex items-start gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={cgu}
            onChange={(e) => setCgu(e.target.checked)}
            className="mt-0.5"
          />
          J'accepte les conditions générales d'utilisation.
        </label>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        <button
          type="submit"
          className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Créer mon compte
        </button>
      </form>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        J'ai déjà un compte —{" "}
        <Link to="/login" className="text-primary hover:underline">
          Se connecter
        </Link>
      </p>
    </AuthLayout>
  );
}

export function AuthLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-md px-5 py-10 sm:py-16">
        <Link to="/" className="mb-10 inline-block font-serif text-lg italic">
          MonMariage<span className="text-primary">.ci</span>
        </Link>
        <h1 className="font-serif text-3xl italic">{title}</h1>
        <div className="mt-8">{children}</div>
      </div>
    </main>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
