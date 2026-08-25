import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout, Field, inputClass } from "./signup";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Mot de passe oublié — MonInvit.com" },
      {
        name: "description",
        content:
          "Recevez un lien par email pour réinitialiser votre mot de passe MonInvit.com.",
      },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Adresse email invalide.");
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: "https://moninvit.com/reset-password",
    });
    setLoading(false);
    if (err) {
      const status = (err as { status?: number }).status;
      if (status === 429) {
        setError(
          "Trop de demandes en peu de temps. Patientez une minute avant de réessayer (vérifiez aussi vos spams, un email a peut-être déjà été envoyé).",
        );
      } else {
        setError(err.message);
      }
      return;
    }
    setSent(true);
  };

  return (
    <AuthLayout
      eyebrow="Mot de passe oublié"
      title={
        <>
          On vous <em className="text-[#E82050]">renvoie la clé.</em>
        </>
      }
      subtitle="Indiquez l'adresse email de votre compte, nous vous enverrons un lien pour choisir un nouveau mot de passe."
    >
      {sent ? (
        <div className="rounded-2xl border border-[#F1E3C6]/70 bg-white/70 p-5 text-sm text-[#201A1C]">
          <p className="font-serif text-lg italic">Email envoyé ✿</p>
          <p className="mt-2 text-[#5A4F52]">
            Si un compte existe pour <strong>{email}</strong>, vous recevrez
            dans quelques instants un email avec un lien de réinitialisation
            valable 1 heure.
          </p>
          <p className="mt-3 text-xs text-[#7A6D70]">
            Pensez à vérifier vos spams. Vous ne recevez rien ?{" "}
            <button
              type="button"
              onClick={() => setSent(false)}
              className="font-medium text-[#E82050] hover:underline"
            >
              Réessayer
            </button>
            .
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Field label="Adresse email">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="vous@exemple.ci"
              maxLength={255}
              autoComplete="email"
            />
          </Field>
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#201A1C] px-4 py-3.5 text-sm font-medium tracking-wide text-[#FBF8F8] shadow-lg shadow-[#E82050]/20 transition hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {loading ? "Envoi…" : "Recevoir le lien"}
          </button>
        </form>
      )}
      <p className="mt-6 text-center text-xs text-[#5A4F52]">
        Retour à la{" "}
        <Link to="/login" className="font-medium text-[#E82050] hover:underline">
          connexion
        </Link>
      </p>
    </AuthLayout>
  );
}
