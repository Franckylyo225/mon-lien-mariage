import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout, Field, inputClass } from "./signup";
import {
  PasswordChecklist,
  validatePassword,
} from "@/components/auth/password-strength";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nouveau mot de passe — MonInvit.com" },
      {
        name: "description",
        content: "Choisissez un nouveau mot de passe pour votre compte MonInvit.com.",
      },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Supabase places the recovery token in the URL hash (#access_token=...&type=recovery).
  // The client parses it automatically and fires PASSWORD_RECOVERY. We just
  // wait for a session (recovery or existing) before allowing the form.
  useEffect(() => {
    let cancelled = false;
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === "PASSWORD_RECOVERY" || (session && event === "SIGNED_IN")) {
        setReady(true);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session) {
        setReady(true);
      } else {
        // Give the hash-based recovery flow a moment to hydrate.
        setTimeout(() => {
          if (!cancelled) {
            supabase.auth.getSession().then(({ data: d2 }) => {
              if (cancelled) return;
              if (d2.session) setReady(true);
              else setInvalid(true);
            });
          }
        }, 600);
      }
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const check = useMemo(() => validatePassword(password), [password]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!check.valid) {
      setError("Votre mot de passe ne respecte pas tous les critères.");
      return;
    }
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setDone(true);
    setTimeout(() => navigate({ to: "/dashboard" }), 1500);
  };

  return (
    <AuthLayout
      eyebrow="Nouveau mot de passe"
      title={
        <>
          Choisissez un <em className="text-[#c17c74]">nouveau mot de passe.</em>
        </>
      }
      subtitle="Il vous servira à vous reconnecter à votre espace MonInvit.com."
    >
      {invalid ? (
        <div className="rounded-2xl border border-[#e8c5b6]/70 bg-white/70 p-5 text-sm text-[#2b1a14]">
          <p className="font-serif text-lg italic">Lien expiré ou invalide</p>
          <p className="mt-2 text-[#6b4a3e]">
            Ce lien de réinitialisation n'est plus valable. Demandez-en un
            nouveau depuis la page « mot de passe oublié ».
          </p>
          <Link
            to="/forgot-password"
            className="mt-4 inline-block rounded-full bg-[#2b1a14] px-4 py-2.5 text-xs font-medium tracking-wide text-[#fdf7f3] transition hover:-translate-y-0.5"
          >
            Demander un nouveau lien
          </Link>
        </div>
      ) : done ? (
        <div className="rounded-2xl border border-[#e8c5b6]/70 bg-white/70 p-5 text-sm text-[#2b1a14]">
          <p className="font-serif text-lg italic">Mot de passe mis à jour ✿</p>
          <p className="mt-2 text-[#6b4a3e]">
            Redirection vers votre espace…
          </p>
        </div>
      ) : !ready ? (
        <p className="text-sm text-[#6b4a3e]">Vérification du lien…</p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Field label="Nouveau mot de passe">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="Votre nouveau mot de passe"
              autoComplete="new-password"
              maxLength={128}
            />
          </Field>
          <PasswordChecklist password={password} />
          <Field label="Confirmer le mot de passe">
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={inputClass}
              placeholder="Retapez le même mot de passe"
              autoComplete="new-password"
              maxLength={128}
            />
          </Field>
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#2b1a14] px-4 py-3.5 text-sm font-medium tracking-wide text-[#fdf7f3] shadow-lg shadow-[#c17c74]/20 transition hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {loading ? "Mise à jour…" : "Mettre à jour"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
