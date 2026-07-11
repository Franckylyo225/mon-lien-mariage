import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  IconArrowLeft,
  IconUser,
  IconMail,
  IconLock,
  IconDevices,
  IconBell,
  IconLanguage,
  IconLogout,
  IconTrash,
  IconChevronRight,
  IconEye,
  IconEyeOff,
  IconBrandGoogle,
  IconX,
} from "@tabler/icons-react";

export const Route = createFileRoute("/app/profile")({
  head: () => ({
    meta: [
      { title: "Mon profil — MonInvit.com" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilePage,
});

type ProfileRow = {
  id: string;
  email: string | null;
  user_first_name: string | null;
  display_name: string | null;
  email_notifications: boolean | null;
  deletion_requested_at: string | null;
};

function maskEmail(email: string | null | undefined): string {
  if (!email) return "—";
  const [local, domain] = email.split("@");
  if (!domain) return email;
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}${"*".repeat(Math.max(1, local.length - 2))}${local[local.length - 1]}@${domain}`;
}

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarBroken, setAvatarBroken] = useState(false);

  const [openSheet, setOpenSheet] = useState<
    | null
    | "firstName"
    | "email"
    | "password"
    | "sessions"
    | "logout"
    | "delete"
  >(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        navigate({ to: "/login", replace: true });
        return;
      }
      setUser(data.user);
      const { data: prof } = await supabase
        .from("profiles")
        .select("id,email,user_first_name,display_name,email_notifications,deletion_requested_at")
        .eq("id", data.user.id)
        .maybeSingle();
      setProfile((prof as ProfileRow) ?? null);
      setLoading(false);
    })();
  }, [navigate]);

  const isGoogle = useMemo(() => {
    const idents = user?.identities ?? [];
    const hasGoogle = idents.some((i) => i.provider === "google");
    const hasEmail = idents.some((i) => i.provider === "email");
    return hasGoogle && !hasEmail;
  }, [user]);

  const googleAvatar = useMemo(() => {
    if (!isGoogle) return null;
    const meta = user?.user_metadata as { avatar_url?: string; picture?: string } | undefined;
    return meta?.avatar_url || meta?.picture || null;
  }, [isGoogle, user]);

  const firstName =
    profile?.user_first_name ||
    profile?.display_name ||
    (user?.user_metadata as { full_name?: string; name?: string } | undefined)?.full_name?.split(" ")[0] ||
    (user?.email ? user.email.split("@")[0] : "");

  const initial = (firstName || user?.email || "?").trim()[0]?.toUpperCase() ?? "?";

  const memberSince = useMemo(() => {
    const iso = user?.created_at;
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  }, [user]);

  const emailConfirmed = !!user?.email_confirmed_at;

  const updateProfile = async (patch: Partial<ProfileRow>) => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update(patch as never)
      .eq("id", user.id);
    if (error) throw error;
    setProfile((p) => (p ? { ...p, ...patch } : p));
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-40">Chargement…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 h-14 border-b border-border/70 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-full max-w-xl items-center justify-between gap-3 px-3 sm:px-5">
          <button
            onClick={() => navigate({ to: "/dashboard" })}
            className="flex items-center gap-1.5 rounded-full px-2 py-1 text-[12px] text-muted-foreground transition active:scale-95"
          >
            <IconArrowLeft size={16} strokeWidth={1.75} />
            <span>Retour</span>
          </button>
          <h1 className="text-[13px] font-medium tracking-wide text-foreground/80">Mon profil</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 pb-10">
        {/* Avatar + identity */}
        <section className="mb-5 flex flex-col items-center gap-2 px-2 pt-6">
          <div className="grid size-16 place-items-center overflow-hidden rounded-full border-[1.5px] border-[#ED93B1] bg-[#FBEAF0]">
            {googleAvatar && !avatarBroken ? (
              <img
                src={googleAvatar}
                alt=""
                className="size-full object-cover"
                onError={() => setAvatarBroken(true)}
              />
            ) : (
              <span className="font-serif text-2xl italic text-[#993556]">{initial}</span>
            )}
          </div>
          <p className="font-serif text-lg italic text-foreground">{firstName || "—"}</p>
          {memberSince ? (
            <p className="text-[10px] text-muted-foreground">Membre depuis {memberSince}</p>
          ) : null}
        </section>

        {/* Personal info */}
        <SectionLabel>Informations personnelles</SectionLabel>
        <Card>
          <Row
            icon={<IconUser size={14} strokeWidth={1.75} />}
            label="Prénom"
            value={firstName || "Ajouter"}
            action={
              <button
                onClick={() => setOpenSheet("firstName")}
                className="text-[11px] font-medium text-[#993556]"
              >
                Modifier
              </button>
            }
          />
          <Divider />
          <Row
            icon={<IconMail size={14} strokeWidth={1.75} />}
            label="Email"
            value={user?.email ?? "—"}
            action={
              isGoogle ? (
                <Badge tone="neutral">Via Google</Badge>
              ) : emailConfirmed ? (
                <Badge tone="success">Vérifié</Badge>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge tone="warning">Non vérifié</Badge>
                  <button
                    onClick={async () => {
                      if (!user?.email) return;
                      const { error } = await supabase.auth.resend({
                        type: "signup",
                        email: user.email,
                      });
                      if (error) toast.error(error.message);
                      else toast.success("Email de vérification renvoyé");
                    }}
                    className="text-[11px] font-medium text-[#993556]"
                  >
                    Renvoyer
                  </button>
                </div>
              )
            }
          />
        </Card>

        {/* Security */}
        <SectionLabel className="mt-6">Sécurité et connexion</SectionLabel>
        <Card>
          {isGoogle ? (
            <Row
              icon={<IconBrandGoogle size={14} strokeWidth={1.75} />}
              label="Connexion via Google"
              value={user?.email ?? ""}
            />
          ) : (
            <>
              <Row
                icon={<IconMail size={14} strokeWidth={1.75} />}
                label="Email de connexion"
                value={maskEmail(user?.email)}
                action={
                  <button
                    onClick={() => setOpenSheet("email")}
                    className="text-[11px] font-medium text-[#993556]"
                  >
                    Modifier
                  </button>
                }
              />
              <Divider />
              <Row
                icon={<IconLock size={14} strokeWidth={1.75} />}
                label="Mot de passe"
                value="••••••••"
                action={
                  <button
                    onClick={() => setOpenSheet("password")}
                    className="text-[11px] font-medium text-[#993556]"
                  >
                    Modifier
                  </button>
                }
              />
              <Divider />
            </>
          )}
          <Row
            icon={<IconDevices size={14} strokeWidth={1.75} />}
            label="Sessions actives"
            value="Cet appareil"
            action={
              <button
                onClick={() => setOpenSheet("sessions")}
                className="grid size-6 place-items-center text-muted-foreground"
              >
                <IconChevronRight size={14} />
              </button>
            }
          />
        </Card>

        {/* Preferences */}
        <SectionLabel className="mt-6">Préférences</SectionLabel>
        <Card>
          <Row
            icon={<IconBell size={14} strokeWidth={1.75} />}
            label="Notifications par email"
            description="Nouvelles confirmations RSVP"
            action={
              <Toggle
                on={profile?.email_notifications ?? true}
                onChange={async (on) => {
                  try {
                    await updateProfile({ email_notifications: on });
                  } catch (e) {
                    toast.error((e as Error).message);
                  }
                }}
              />
            }
          />
          <Divider />
          <Row
            icon={<IconLanguage size={14} strokeWidth={1.75} />}
            label="Langue"
            value="Français"
            action={<IconChevronRight size={14} className="text-muted-foreground" />}
          />
        </Card>

        {/* Danger zone */}
        <SectionLabel className="mt-6">Zone de danger</SectionLabel>
        <div className="overflow-hidden rounded-xl border border-destructive/40">
          <DangerRow
            icon={<IconLogout size={14} strokeWidth={1.75} />}
            title="Se déconnecter"
            description="Fermer la session sur cet appareil"
            onClick={() => setOpenSheet("logout")}
          />
          <div className="border-t border-destructive/25" />
          <DangerRow
            icon={<IconTrash size={14} strokeWidth={1.75} />}
            title="Supprimer mon compte"
            description="Suppression définitive sous 30 jours"
            onClick={() => setOpenSheet("delete")}
          />
        </div>

        <p className="mt-8 pb-4 text-center text-[10px] text-muted-foreground">
          MonInvit.com · v1.0.0
        </p>
      </main>

      {/* Sheets */}
      {openSheet === "firstName" && user && (
        <FirstNameSheet
          initial={firstName}
          onClose={() => setOpenSheet(null)}
          onSave={async (v) => {
            await updateProfile({ user_first_name: v });
            toast.success("Prénom mis à jour");
            setOpenSheet(null);
          }}
        />
      )}
      {openSheet === "email" && user && (
        <EmailSheet onClose={() => setOpenSheet(null)} currentEmail={user.email ?? ""} />
      )}
      {openSheet === "password" && (
        <PasswordSheet onClose={() => setOpenSheet(null)} />
      )}
      {openSheet === "sessions" && (
        <SessionsSheet
          onClose={() => setOpenSheet(null)}
          onSignOutOthers={async () => {
            const { error } = await supabase.auth.signOut({ scope: "others" });
            if (error) toast.error(error.message);
            else toast.success("Autres appareils déconnectés");
            setOpenSheet(null);
          }}
        />
      )}
      {openSheet === "logout" && (
        <ConfirmSheet
          title="Voulez-vous vous déconnecter ?"
          confirmLabel="Se déconnecter"
          onClose={() => setOpenSheet(null)}
          onConfirm={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/login", replace: true });
          }}
        />
      )}
      {openSheet === "delete" && user && (
        <DeleteAccountSheet
          isGoogle={isGoogle}
          email={user.email ?? ""}
          onClose={() => setOpenSheet(null)}
          onConfirmed={async () => {
            try {
              await updateProfile({ deletion_requested_at: new Date().toISOString() });
            } catch (e) {
              console.error(e);
            }
            await supabase.auth.signOut();
            toast.success("Demande enregistrée. Votre compte sera supprimé dans 30 jours.");
            navigate({ to: "/login", replace: true });
          }}
        />
      )}
    </div>
  );
}

/* ---------- primitives ---------- */

function SectionLabel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={`mb-2 px-1 text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground ${className}`}
    >
      {children}
    </p>
  );
}

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">{children}</div>
  );
}

function Divider() {
  return <div className="mx-3 border-t border-border/60" />;
}

function Row({
  icon,
  label,
  value,
  description,
  action,
}: {
  icon: ReactNode;
  label: string;
  value?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-3">
      <span className="grid size-7 shrink-0 place-items-center rounded-md bg-secondary text-muted-foreground">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-muted-foreground">{label}</p>
        {value ? <p className="truncate text-[13px] text-foreground">{value}</p> : null}
        {description ? (
          <p className="text-[10px] text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function DangerRow({
  icon,
  title,
  description,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 px-3 py-3 text-left transition active:bg-destructive/5"
    >
      <span className="grid size-7 shrink-0 place-items-center rounded-md bg-destructive/10 text-destructive">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium text-destructive">{title}</p>
        <p className="text-[10px] text-muted-foreground">{description}</p>
      </div>
      <IconChevronRight size={14} className="text-destructive/70" />
    </button>
  );
}

function Badge({
  tone,
  children,
}: {
  tone: "success" | "warning" | "neutral";
  children: ReactNode;
}) {
  const styles: Record<string, string> = {
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-800",
    neutral: "bg-secondary text-muted-foreground",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${styles[tone]}`}>
      {children}
    </span>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative h-6 w-10 rounded-full transition ${
        on ? "bg-[#993556]" : "bg-border"
      }`}
    >
      <span
        className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition ${
          on ? "left-[18px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

/* ---------- sheets ---------- */

function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onEsc);
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-xl rounded-t-2xl bg-background p-5 pb-8 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-base italic">{title}</h2>
          <button
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full text-muted-foreground"
          >
            <IconX size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function InputBase(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-border bg-card px-3 py-2.5 text-[13px] outline-none focus:border-[#c17c74] ${props.className ?? ""}`}
    />
  );
}

function Label({ children }: { children: ReactNode }) {
  return <label className="mb-1 block text-[11px] text-muted-foreground">{children}</label>;
}

function PrimaryButton({
  children,
  disabled,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      disabled={disabled}
      className="w-full rounded-full bg-[#2b1a14] px-4 py-3 text-sm font-medium text-[#fdf7f3] transition disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function PasswordField({
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <InputBase
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2 top-1/2 -translate-y-1/2 grid size-8 place-items-center text-muted-foreground"
      >
        {show ? <IconEyeOff size={16} /> : <IconEye size={16} />}
      </button>
    </div>
  );
}

function FirstNameSheet({
  initial,
  onSave,
  onClose,
}: {
  initial: string;
  onSave: (v: string) => Promise<void>;
  onClose: () => void;
}) {
  const [v, setV] = useState(initial);
  const [saving, setSaving] = useState(false);
  return (
    <Sheet title="Modifier le prénom" onClose={onClose}>
      <Label>Prénom</Label>
      <InputBase autoFocus value={v} onChange={(e) => setV(e.target.value)} />
      <div className="mt-4">
        <PrimaryButton
          disabled={saving || !v.trim()}
          onClick={async () => {
            setSaving(true);
            try {
              await onSave(v.trim());
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </PrimaryButton>
      </div>
    </Sheet>
  );
}

function EmailSheet({ onClose, currentEmail }: { onClose: () => void; currentEmail: string }) {
  const [newEmail, setNewEmail] = useState("");
  const [pw, setPw] = useState("");
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    setSaving(true);
    // Re-authenticate to confirm identity
    const { error: reErr } = await supabase.auth.signInWithPassword({
      email: currentEmail,
      password: pw,
    });
    if (reErr) {
      setSaving(false);
      toast.error("Mot de passe incorrect");
      return;
    }
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
  };

  return (
    <Sheet title="Modifier l'email" onClose={onClose}>
      {sent ? (
        <div className="space-y-4">
          <p className="text-[13px] text-foreground">
            Un lien de confirmation a été envoyé à votre nouvel email.
          </p>
          <PrimaryButton onClick={onClose}>Fermer</PrimaryButton>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <Label>Nouvel email</Label>
            <InputBase
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="vous@exemple.com"
              autoFocus
            />
          </div>
          <div>
            <Label>Mot de passe actuel</Label>
            <PasswordField value={pw} onChange={setPw} placeholder="Votre mot de passe" />
          </div>
          <PrimaryButton
            disabled={saving || !newEmail.trim() || !pw}
            onClick={submit}
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </PrimaryButton>
        </div>
      )}
    </Sheet>
  );
}

function passwordStrength(pw: string): { score: 0 | 1 | 2 | 3 | 4; label: string } {
  if (!pw) return { score: 0, label: "" };
  const hasUpper = /[A-Z]/.test(pw);
  const hasDigit = /\d/.test(pw);
  const hasSymbol = /[^A-Za-z0-9]/.test(pw);
  if (pw.length < 8) return { score: 1, label: "Faible" };
  if (pw.length >= 12 && hasUpper && hasDigit && hasSymbol)
    return { score: 4, label: "Très fort" };
  if (hasUpper && hasDigit) return { score: 3, label: "Fort" };
  if (hasUpper || hasDigit) return { score: 2, label: "Moyen" };
  return { score: 1, label: "Faible" };
}

function StrengthBar({ pw }: { pw: string }) {
  const { score, label } = passwordStrength(pw);
  const colors = ["bg-border", "bg-red-500", "bg-amber-500", "bg-lime-500", "bg-emerald-600"];
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full ${i <= score ? colors[score] : "bg-border"}`}
          />
        ))}
      </div>
      {label ? <p className="mt-1 text-[10px] text-muted-foreground">{label}</p> : null}
    </div>
  );
}

function PasswordSheet({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (next.length < 8) {
      toast.error("Le nouveau mot de passe doit contenir au moins 8 caractères");
      return;
    }
    if (next !== confirm) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    setSaving(true);
    const { data: userRes } = await supabase.auth.getUser();
    const email = userRes.user?.email;
    if (email) {
      const { error: reErr } = await supabase.auth.signInWithPassword({
        email,
        password: current,
      });
      if (reErr) {
        setSaving(false);
        toast.error("Mot de passe actuel incorrect");
        return;
      }
    }
    const { error } = await supabase.auth.updateUser({ password: next });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Mot de passe mis à jour");
    onClose();
  };

  return (
    <Sheet title="Modifier le mot de passe" onClose={onClose}>
      <div className="space-y-3">
        <div>
          <Label>Mot de passe actuel</Label>
          <PasswordField value={current} onChange={setCurrent} autoFocus />
        </div>
        <div>
          <Label>Nouveau mot de passe</Label>
          <PasswordField value={next} onChange={setNext} />
          <StrengthBar pw={next} />
        </div>
        <div>
          <Label>Confirmer le nouveau mot de passe</Label>
          <PasswordField value={confirm} onChange={setConfirm} />
        </div>
        <PrimaryButton disabled={saving || !current || !next || !confirm} onClick={submit}>
          {saving ? "Enregistrement…" : "Enregistrer"}
        </PrimaryButton>
      </div>
    </Sheet>
  );
}

function SessionsSheet({
  onClose,
  onSignOutOthers,
}: {
  onClose: () => void;
  onSignOutOthers: () => Promise<void>;
}) {
  return (
    <Sheet title="Sessions actives" onClose={onClose}>
      <div className="space-y-3">
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="text-[12px] font-medium text-foreground">Cet appareil</p>
          <p className="text-[10px] text-muted-foreground">Session active</p>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Pour votre sécurité, vous pouvez déconnecter toutes les autres sessions.
        </p>
        <button
          onClick={onSignOutOthers}
          className="w-full rounded-full border border-border px-4 py-3 text-sm font-medium text-foreground transition active:bg-secondary"
        >
          Déconnecter tous les autres appareils
        </button>
      </div>
    </Sheet>
  );
}

function ConfirmSheet({
  title,
  confirmLabel,
  onClose,
  onConfirm,
}: {
  title: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <Sheet title={title} onClose={onClose}>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 rounded-full border border-border px-4 py-3 text-sm font-medium"
        >
          Annuler
        </button>
        <button
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await onConfirm();
          }}
          className="flex-1 rounded-full bg-destructive px-4 py-3 text-sm font-medium text-destructive-foreground disabled:opacity-50"
        >
          {confirmLabel}
        </button>
      </div>
    </Sheet>
  );
}

function DeleteAccountSheet({
  isGoogle,
  email,
  onClose,
  onConfirmed,
}: {
  isGoogle: boolean;
  email: string;
  onClose: () => void;
  onConfirmed: () => Promise<void>;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <Sheet
      title={step === 1 ? "Supprimer votre compte ?" : "Confirmez votre identité"}
      onClose={onClose}
    >
      {step === 1 ? (
        <div className="space-y-4">
          <div className="text-[13px] leading-relaxed text-foreground/90">
            <p>Cette action supprimera définitivement :</p>
            <ul className="mt-2 space-y-1 text-[12px] text-muted-foreground">
              <li>· Votre compte et vos données</li>
              <li>· Toutes vos pages d'invitation</li>
              <li>· Vos listes d'invités et confirmations</li>
              <li>· Votre livre d'or</li>
            </ul>
            <p className="mt-3 text-[12px] text-muted-foreground">
              Vos pages publiées restent accessibles 30 jours, puis sont supprimées.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-full border border-border px-4 py-3 text-sm font-medium"
            >
              Annuler
            </button>
            <button
              onClick={() => setStep(2)}
              className="flex-1 rounded-full bg-destructive px-4 py-3 text-sm font-medium text-destructive-foreground"
            >
              Continuer
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {isGoogle ? (
            <>
              <p className="text-[12px] text-muted-foreground">
                Confirmez avec votre compte Google pour supprimer définitivement votre compte.
              </p>
              <button
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  await onConfirmed();
                }}
                className="w-full rounded-full bg-destructive px-4 py-3 text-sm font-medium text-destructive-foreground disabled:opacity-50"
              >
                Confirmer avec Google
              </button>
            </>
          ) : (
            <>
              <p className="text-[12px] text-muted-foreground">
                Entrez votre mot de passe pour confirmer.
              </p>
              <PasswordField value={pw} onChange={setPw} autoFocus placeholder="Mot de passe" />
              <button
                disabled={busy || !pw}
                onClick={async () => {
                  setBusy(true);
                  const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password: pw,
                  });
                  if (error) {
                    setBusy(false);
                    toast.error("Mot de passe incorrect");
                    return;
                  }
                  await onConfirmed();
                }}
                className="w-full rounded-[10px] bg-destructive px-4 py-3 text-sm font-medium text-destructive-foreground disabled:opacity-50"
              >
                {busy ? "Suppression…" : "Supprimer définitivement mon compte"}
              </button>
            </>
          )}
        </div>
      )}
    </Sheet>
  );
}

// Silence unused import (Link kept intentionally for future links out)
void Link;
