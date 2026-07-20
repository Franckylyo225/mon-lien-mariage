import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout, Field, inputClass } from "./signup";

export const Route = createFileRoute("/verify-email")({
  head: () => ({
    meta: [
      { title: "Confirmer votre email — MonInvit.com" },
      {
        name: "description",
        content:
          "Saisissez le code de confirmation reçu par email pour activer votre compte MonInvit.com.",
      },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    email: typeof s.email === "string" ? s.email : "",
  }),
  component: VerifyEmailPage,
});


function VerifyEmailPage() {
  const navigate = useNavigate();
  const { email: initialEmail } = Route.useSearch();
  const [email, setEmail] = useState(initialEmail || "");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const canonicalCode = useMemo(() => code.replace(/\D/g, "").slice(0, 10), [code]);

  useEffect(() => {
    setCode(canonicalCode);
  }, [canonicalCode]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!email.includes("@")) return setError("Adresse email invalide.");
    if (canonicalCode.length < 6)
      return setError("Saisissez le code reçu par email (au moins 6 chiffres).");
    setLoading(true);
    const { error: err } = await supabase.auth.verifyOtp({
      email,
      token: canonicalCode,
      type: "email",
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    navigate({ to: "/onboarding/prenoms" });
  };


  const resend = async () => {
    setError(null);
    setInfo(null);
    if (!email.includes("@")) return setError("Adresse email invalide.");
    setResending(true);
    const { error: err } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: "https://moninvit.com/verify-email" },
    });
    setResending(false);
    if (err) {
      setError(err.message);
      return;
    }
    setInfo("Un nouveau code vient d'être envoyé.");
  };

  return (
    <AuthLayout
      eyebrow="Confirmez votre email"
      title={<>Un code vous <em className="text-[#c17c74]">attend.</em></>}
      subtitle="Saisissez le code de confirmation reçu par email pour activer votre compte."
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
            autoComplete="email"
          />
        </Field>
        <Field label="Code de confirmation">
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={inputClass + " text-center text-2xl tracking-[0.4em] font-mono"}
            placeholder="••••••"
            maxLength={10}
          />
        </Field>

        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        {info ? (
          <p className="rounded-md border border-[#c17c74]/30 bg-[#c17c74]/10 px-3 py-2 text-xs text-[#7a2f3a]">
            {info}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#2b1a14] px-4 py-3.5 text-sm font-medium tracking-wide text-[#fdf7f3] shadow-lg shadow-[#c17c74]/20 transition hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {loading ? "Vérification…" : "Confirmer mon email"}
        </button>
      </form>
      <p className="mt-4 text-center text-xs text-[#6b4a3e]">
        Code non reçu ?{" "}
        <button
          type="button"
          onClick={resend}
          disabled={resending}
          className="font-medium text-[#c17c74] hover:underline disabled:opacity-50"
        >
          {resending ? "Envoi…" : "Renvoyer un code"}
        </button>
      </p>
      <p className="mt-6 text-center text-xs text-[#6b4a3e]">
        <Link to="/login" className="font-medium text-[#c17c74] hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </AuthLayout>
  );
}
