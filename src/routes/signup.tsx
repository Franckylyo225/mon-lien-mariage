import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  PasswordChecklist,
  validatePassword,
} from "@/components/auth/password-strength";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Inscription — MonInvit.com" },
      { name: "description", content: "Créez votre compte MonInvit.com pour préparer votre mariage." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cgu, setCgu] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pwCheck = useMemo(() => validatePassword(password), [password]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!email.includes("@")) return setError("Adresse email invalide.");
    if (!pwCheck.valid)
      return setError(
        "Votre mot de passe ne respecte pas tous les critères ci-dessous.",
      );
    if (!cgu) return setError("Merci d'accepter les CGU.");
    setLoading(true);
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: "https://moninvit.com/verify-email" },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (data.session) {
      navigate({ to: "/onboarding/prenoms" });
    } else {
      navigate({ to: "/verify-email", search: { email } });
    }
  };

  return (
    <AuthLayout
      eyebrow="Créer un compte"
      title={<>Commençons <em className="text-[#c17c74]">votre histoire.</em></>}
      subtitle="En 10 minutes, votre page d'invitation est prête à être partagée."
    >
      <GoogleAuthButton label="S'inscrire avec Google" />
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
            minLength={8}
            maxLength={128}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="8 caractères min., 1 majuscule, 1 chiffre"
            autoComplete="new-password"
          />
        </Field>
        <PasswordChecklist password={password} />
        <label className="flex items-start gap-2 text-xs text-[#6b4a3e]">
          <input
            type="checkbox"
            checked={cgu}
            onChange={(e) => setCgu(e.target.checked)}
            className="mt-0.5 accent-[#c17c74]"
          />
          J'accepte les conditions générales d'utilisation.
        </label>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        {info ? <p className="rounded-md border border-[#c17c74]/30 bg-[#c17c74]/10 px-3 py-2 text-xs text-[#7a2f3a]">{info}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#2b1a14] px-4 py-3.5 text-sm font-medium tracking-wide text-[#fdf7f3] shadow-lg shadow-[#c17c74]/20 transition hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {loading ? "Création…" : "Créer mon compte"}
        </button>
      </form>
      <p className="mt-6 text-center text-xs text-[#6b4a3e]">
        J'ai déjà un compte —{" "}
        <Link to="/login" className="font-medium text-[#c17c74] hover:underline">
          Se connecter
        </Link>
      </p>
    </AuthLayout>
  );
}

import heroCouple from "@/assets/home-couple.jpg";

export const inputClass =
  "w-full rounded-xl border border-[#e8c5b6]/70 bg-white/70 px-4 py-3 text-sm text-[#2b1a14] outline-none transition placeholder:text-[#b39588] focus:border-[#c17c74] focus:bg-white focus:ring-2 focus:ring-[#c17c74]/20";

export function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fdf7f3] text-[#2b1a14]">
      {/* Romantic gradient wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 500px at 15% -10%, #f6d9cb 0%, #fdf7f3 55%, #fdf7f3 100%)",
        }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-60">
        <span className="absolute left-[8%] top-[22%] size-2 rounded-full bg-[#c17c74]/40" />
        <span className="absolute right-[42%] top-[8%] size-3 rounded-full bg-[#e8c5b6]/60" />
        <span className="absolute left-[38%] bottom-[10%] size-1.5 rounded-full bg-[#d97757]/50" />
      </div>

      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 lg:grid-cols-2">
        {/* Form column */}
        <div className="flex flex-col px-5 py-8 sm:px-10 sm:py-12">
          <Link to="/" className="inline-block font-serif text-lg italic">
            MonInvit<span className="text-[#c17c74]">.com</span>
          </Link>

          <div className="mx-auto mt-10 flex w-full max-w-md flex-1 flex-col justify-center sm:mt-16">
            {eyebrow ? (
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#c17c74]">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="mt-4 font-serif text-4xl italic leading-[1.05] sm:text-5xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-3 text-sm leading-relaxed text-[#6b4a3e]">
                {subtitle}
              </p>
            ) : null}
            <div className="mt-10">{children}</div>
          </div>

          <p className="mt-10 text-center text-[11px] text-[#8a6a5e] sm:text-left">
            © 2027 MonInvit.com
          </p>
        </div>

        {/* Editorial image column — desktop only */}
        <aside className="relative hidden overflow-hidden lg:block">
          <img
            src={heroCouple}
            alt=""
            aria-hidden
            className="absolute inset-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)] rounded-[2rem] object-cover shadow-2xl shadow-[#c17c74]/20"
          />
          <div className="absolute inset-4 rounded-[2rem] bg-gradient-to-t from-[#2b1a14]/70 via-transparent to-transparent" />
          <div className="absolute bottom-14 left-12 right-12 text-[#fdf7f3]">
            <p className="font-serif text-3xl italic leading-[1.15]">
              « Notre page était prête <br />
              le soir même. »
            </p>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.35em] text-[#e8c5b6]">
              Aïcha & Loïc — Abidjan
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.25em] text-[#6b4a3e]">
        {label}
      </span>
      {children}
    </label>
  );
}

export function AuthDivider() {
  return (
    <div className="my-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-[#8a6a5e]">
      <span className="h-px flex-1 bg-[#e8c5b6]" />
      ou
      <span className="h-px flex-1 bg-[#e8c5b6]" />
    </div>
  );
}

export function GoogleAuthButton({ label }: { label: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setError(null);
    setLoading(true);
    try {
      const { lovable } = await import("@/integrations/lovable/index");
      // Force le flow OAuth via le domaine Lovable (le domaine custom moninvit.com
      // passe par un proxy Vercel qui casse le callback Google). L'utilisateur
      // termine la connexion sur moninvit.lovable.app où la session est établie.
      const LOVABLE_ORIGIN = "https://moninvit.lovable.app";
      const isLovableOrigin = window.location.origin === LOVABLE_ORIGIN;
      if (!isLovableOrigin) {
        window.location.href = `${LOVABLE_ORIGIN}/signup?google=1`;
        return;
      }
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: LOVABLE_ORIGIN,
      });
      if (result.error) {
        setError(result.error.message ?? "Connexion Google impossible.");
        setLoading(false);
        return;
      }
      if (result.redirected) return;
      window.location.href = `${LOVABLE_ORIGIN}/dashboard`;

    } catch (e) {
      setError(e instanceof Error ? e.message : "Connexion Google impossible.");
      setLoading(false);
    }
  };

  return (
    <>
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="flex w-full items-center justify-center gap-3 rounded-full border border-[#e8c5b6]/70 bg-white/80 px-4 py-3 text-sm font-medium text-[#2b1a14] transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md disabled:opacity-60 disabled:hover:translate-y-0"
    >
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2c-.4.4 6.6-4.8 6.6-14.8 0-1.3-.1-2.4-.4-3.5z"/>
      </svg>
      {loading ? "Connexion…" : label}
    </button>
    {error ? <p className="mt-2 text-center text-xs text-destructive">{error}</p> : null}
    </>
  );
}



