import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { PageShell } from "@/components/site/SiteChrome";
import { fbq } from "@/lib/facebook-pixel";


export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — MonInvit.com" },
      {
        name: "description",
        content:
          "Une question sur votre invitation de mariage digitale ? Écrivez-nous à contact@moninvit.com ou utilisez le formulaire de contact MonInvit.",
      },
      { property: "og:title", content: "Contact — MonInvit.com" },
      {
        property: "og:description",
        content:
          "Contactez l'équipe MonInvit.com : questions, assistance et partenariats.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Merci d'indiquer votre nom." })
    .max(100, { message: "Nom trop long (100 caractères max)." }),
  email: z
    .string()
    .trim()
    .email({ message: "Adresse e-mail invalide." })
    .max(255, { message: "E-mail trop long." }),
  subject: z
    .string()
    .trim()
    .min(1, { message: "Merci d'indiquer un sujet." })
    .max(150, { message: "Sujet trop long (150 caractères max)." }),
  message: z
    .string()
    .trim()
    .min(10, { message: "Votre message doit faire au moins 10 caractères." })
    .max(2000, { message: "Message trop long (2000 caractères max)." }),
});

const CONTACT_EMAIL = "contact@moninvit.com";

function ContactPage() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  function update(key: keyof typeof values, v: string) {
    setValues((s) => ({ ...s, [key]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const k = String(issue.path[0]);
        if (!next[k]) next[k] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    const d = parsed.data;
    const body = `Nom : ${d.name}\nE-mail : ${d.email}\n\n${d.message}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      d.subject,
    )}&body=${encodeURIComponent(body)}`;
    fbq("track", "Contact", { subject: d.subject });
    setSent(true);
  }


  return (
    <PageShell
      eyebrow="Contact"
      title={
        <>
          Parlons de <span className="italic text-[#E82050]">votre mariage</span>
        </>
      }
      intro="Une question, une hésitation, une idée ? Notre équipe basée à Abidjan vous répond sous 24 heures ouvrées."
    >
      <section className="mx-auto max-w-4xl px-5 pb-24">
        <div className="grid gap-6 md:grid-cols-[1fr_1.3fr]">
          <div className="rounded-3xl border border-[#F1E3C6]/50 bg-white/60 p-6 shadow-sm backdrop-blur">
            <h2 className="font-[family-name:var(--font-display)] text-2xl text-[#201A1C]">
              Nous écrire
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#5A4F52]">
              Le plus simple, c'est un e-mail. Nous lisons tout, et nous répondons
              à tout.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-4 inline-flex min-h-11 items-center rounded-full bg-[#201A1C] px-5 text-sm font-medium text-[#FBF8F8] transition hover:opacity-90"
            >
              {CONTACT_EMAIL}
            </a>
            <dl className="mt-6 space-y-3 text-sm text-[#5A4F52]">
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#7A6D70]">
                  Délai de réponse
                </dt>
                <dd className="mt-1">Sous 24 h ouvrées</dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#7A6D70]">
                  Localisation
                </dt>
                <dd className="mt-1">Abidjan, Côte d'Ivoire</dd>
              </div>
            </dl>
          </div>

          <form
            onSubmit={onSubmit}
            noValidate
            className="rounded-3xl border border-[#F1E3C6]/50 bg-white/60 p-6 shadow-sm backdrop-blur sm:p-8"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Nom complet"
                id="name"
                value={values.name}
                error={errors.name}
                onChange={(v) => update("name", v)}
                maxLength={100}
              />
              <Field
                label="E-mail"
                id="email"
                type="email"
                value={values.email}
                error={errors.email}
                onChange={(v) => update("email", v)}
                maxLength={255}
              />
            </div>
            <div className="mt-4">
              <Field
                label="Sujet"
                id="subject"
                value={values.subject}
                error={errors.subject}
                onChange={(v) => update("subject", v)}
                maxLength={150}
              />
            </div>
            <div className="mt-4">
              <label
                htmlFor="message"
                className="block text-sm font-medium text-[#201A1C]"
              >
                Message
              </label>
              <textarea
                id="message"
                rows={6}
                maxLength={2000}
                value={values.message}
                onChange={(e) => update("message", e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-[#F1E3C6] bg-white/80 px-4 py-3 text-base text-[#201A1C] outline-none transition focus:border-[#E82050] focus:ring-2 focus:ring-[#E82050]/30"
              />
              {errors.message ? (
                <p className="mt-1.5 text-xs text-[#D33A3A]">{errors.message}</p>
              ) : null}
            </div>

            <button
              type="submit"
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#201A1C] px-6 text-sm font-medium text-[#FBF8F8] transition hover:opacity-90 sm:w-auto"
            >
              Envoyer le message
            </button>

            {sent ? (
              <p className="mt-4 rounded-2xl bg-[#FDF0F3] px-4 py-3 text-sm text-[#5A4F52]">
                Votre logiciel de messagerie s'ouvre avec le message pré-rempli.
                Si rien ne se passe, écrivez-nous directement à{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="font-medium text-[#E82050] underline underline-offset-2"
                >
                  {CONTACT_EMAIL}
                </a>
                .
              </p>
            ) : null}
          </form>
        </div>
      </section>
    </PageShell>
  );
}

function Field({
  label,
  id,
  value,
  onChange,
  error,
  type = "text",
  maxLength,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[#201A1C]">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-full border border-[#F1E3C6] bg-white/80 px-4 py-3 text-base text-[#201A1C] outline-none transition focus:border-[#E82050] focus:ring-2 focus:ring-[#E82050]/30"
      />
      {error ? <p className="mt-1.5 text-xs text-[#D33A3A]">{error}</p> : null}
    </div>
  );
}
