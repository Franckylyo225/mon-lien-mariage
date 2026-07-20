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

  // Supabase may deliver the recovery token as either:
  //   - a PKCE code in the query string (?code=...), requiring exchangeCodeForSession
  //   - hash tokens (#access_token=...&type=recovery), auto-parsed by the client
  //   - a plain ?token_hash=...&type=recovery, requiring verifyOtp
  useEffect(() => {
    let cancelled = false;

    const markReady = () => {
      if (!cancelled) setReady(true);
    };
    const markInvalid = () => {
      if (!cancelled) setInvalid(true);
    };

    const run = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const tokenHash = url.searchParams.get("token_hash");
        const type = url.searchParams.get("type");
        const errorDesc =
          url.searchParams.get("error_description") ||
          new URLSearchParams(window.location.hash.replace(/^#/, "")).get(
            "error_description",
          );

        if (errorDesc) {
          markInvalid();
          return;
        }

        if (code) {
          const { error: err } =
            await supabase.auth.exchangeCodeForSession(code);
          if (err) {
            markInvalid();
            return;
          }
          // Clean the URL to avoid re-using the code on refresh.
          window.history.replaceState({}, "", "/reset-password");
          markReady();
          return;
        }

        if (tokenHash && type === "recovery") {
          const { error: err } = await supabase.auth.verifyOtp({
            type: "recovery",
            token_hash: tokenHash,
          });
          if (err) {
            markInvalid();
            return;
          }
          window.history.replaceState({}, "", "/reset-password");
          markReady();
          return;
        }

        // Hash-based recovery flow (older links): the client parses
        // #access_token automatically and fires PASSWORD_RECOVERY / SIGNED_IN.
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          markReady();
          return;
        }

        // Give the hash-based recovery flow a moment to hydrate.
        setTimeout(async () => {
          if (cancelled) return;
          const { data: d2 } = await supabase.auth.getSession();
          if (d2.session) markReady();
          else markInvalid();
        }, 800);
      } catch {
        markInvalid();
      }
    };

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === "PASSWORD_RECOVERY" || (session && event === "SIGNED_IN")) {
        markReady();
      }
    });

    void run();

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
