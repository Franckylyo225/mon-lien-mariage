import { useMemo } from "react";

export type PasswordCheck = {
  length: boolean;
  upper: boolean;
  lower: boolean;
  digit: boolean;
  valid: boolean;
};

export function validatePassword(pw: string): PasswordCheck {
  const length = pw.length >= 8;
  const upper = /[A-Z]/.test(pw);
  const lower = /[a-z]/.test(pw);
  const digit = /\d/.test(pw);
  return { length, upper, lower, digit, valid: length && upper && lower && digit };
}

export function PasswordChecklist({ password }: { password: string }) {
  const c = useMemo(() => validatePassword(password), [password]);
  const items: Array<{ ok: boolean; label: string }> = [
    { ok: c.length, label: "Au moins 8 caractères" },
    { ok: c.upper, label: "Une lettre majuscule (A-Z)" },
    { ok: c.lower, label: "Une lettre minuscule (a-z)" },
    { ok: c.digit, label: "Un chiffre (0-9)" },
  ];
  return (
    <ul
      aria-label="Critères du mot de passe"
      className="space-y-1.5 rounded-xl border border-[#F1E3C6]/60 bg-white/50 px-4 py-3"
    >
      {items.map((it) => (
        <li
          key={it.label}
          className={`flex items-center gap-2 text-xs transition ${
            it.ok ? "text-[#4d7a3a]" : "text-[#7A6D70]"
          }`}
        >
          <span
            aria-hidden
            className={`inline-flex size-4 shrink-0 items-center justify-center rounded-full border text-[10px] leading-none ${
              it.ok
                ? "border-[#4d7a3a] bg-[#e6f0dc] text-[#4d7a3a]"
                : "border-[#F1E3C6] bg-white text-[#7A6D70]"
            }`}
          >
            {it.ok ? "✓" : "•"}
          </span>
          <span>{it.label}</span>
        </li>
      ))}
    </ul>
  );
}
