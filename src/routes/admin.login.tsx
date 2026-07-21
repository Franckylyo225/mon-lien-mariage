import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { IconShieldLock, IconArrowLeft } from "@tabler/icons-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin — MonInvit.com" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { data: signIn, error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (err || !signIn.user) {
      setLoading(false);
      setError(err?.message ?? "Identifiants invalides");
      return;
    }
    const [adminRole, ownerRole] = await Promise.all([
      supabase.rpc("has_role", {
        _user_id: signIn.user.id,
        _role: "admin",
      }),
      supabase.rpc("has_role", {
        _user_id: signIn.user.id,
        _role: "owner",
      }),
    ]);
    setLoading(false);
    if (adminRole.error || ownerRole.error || (!adminRole.data && !ownerRole.data)) {
      await supabase.auth.signOut();
      setError("Ce compte n'a pas les droits administrateur.");
      return;
    }
    navigate({ to: "/admin", replace: true });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-950 px-4 py-10 text-neutral-100">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(60% 40% at 50% 0%, rgba(153,53,86,0.35), transparent 70%), radial-gradient(40% 30% at 100% 100%, rgba(59,130,246,0.15), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <Link
        to="/"
        className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-neutral-300 backdrop-blur hover:bg-white/10"
      >
        <IconArrowLeft size={14} /> Retour au site
      </Link>

      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 grid size-14 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.02] shadow-[0_10px_40px_-10px_rgba(153,53,86,0.5)]">
            <IconShieldLock size={26} className="text-[#e8a4b1]" />
          </div>
          <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.35em] text-[#e8a4b1]/80">
            Espace administrateur
          </p>
          <h1 className="font-serif text-2xl">Connexion sécurisée</h1>
          <p className="mt-1 text-[12px] text-neutral-400">
            Accès réservé aux membres de l'équipe MonInvit.com
          </p>
        </div>

        <form
          onSubmit={submit}
          className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl"
        >
          <div>
            <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-neutral-400">
              Adresse email
            </label>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-neutral-900/60 px-3 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 outline-none transition focus:border-[#e8a4b1]/60 focus:ring-2 focus:ring-[#e8a4b1]/20"
              placeholder="admin@moninvit.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-neutral-400">
              Mot de passe
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-neutral-900/60 px-3 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 outline-none transition focus:border-[#e8a4b1]/60 focus:ring-2 focus:ring-[#e8a4b1]/20"
              placeholder="••••••••"
            />
          </div>

          {error ? (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-300">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-b from-[#c17c74] to-[#993556] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-[#993556]/30 transition hover:brightness-110 disabled:opacity-60"
          >
            {loading ? "Vérification…" : "Se connecter"}
          </button>

          <p className="pt-2 text-center text-[10px] text-neutral-500">
            Toutes les connexions sont journalisées.
          </p>
        </form>

        <p className="mt-6 text-center text-[11px] text-neutral-500">
          Vous n'êtes pas administrateur ?{" "}
          <Link to="/login" className="text-[#e8a4b1] hover:underline">
            Connexion utilisateur
          </Link>
        </p>
      </div>
    </div>
  );
}
