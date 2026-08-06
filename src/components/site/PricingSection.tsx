import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Globe,
  Link2,
  QrCode,
  Users,
  CalendarHeart,
  Music,
  Clock,
  BookHeart,
  Infinity as InfinityIcon,
  Lock,
} from "lucide-react";

const ITEMS: {
  icon: typeof Globe;
  title: string;
  sub?: string;
  addon?: boolean;
}[] = [
  { icon: Globe, title: "Page publique et partageable", sub: "Via WhatsApp en un tap" },
  { icon: Link2, title: "Lien personnalisé", sub: "moninvit.com/e/vos-prénoms" },
  { icon: QrCode, title: "QR code à imprimer", sub: "Pour vos cartons et l'entrée" },
  { icon: Users, title: "RSVP illimités", sub: "Tableau de bord en temps réel" },
  { icon: CalendarHeart, title: "Toutes vos cérémonies", sub: "Dot, civil, religieux, réception…" },
  { icon: Music, title: "Musique d'ambiance", sub: "26 titres · ou votre propre chanson" },
  { icon: Clock, title: "Compte à rebours", sub: "Automatique dès la publication" },
  { icon: BookHeart, title: "Livre d'or", sub: "Option activable avant ou après", addon: true },
  { icon: InfinityIcon, title: "Accès à vie", sub: "Vos données protégées" },
];

const PREVIEW_URL = "https://www.moninvit.com/e/basile-et-armelle1";

export function PricingSection() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="tarifs"
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: "opacity .5s ease, transform .5s ease",
      }}
      className="scroll-mt-24 border-t border-[#e8c5b6]/40 bg-[#FAF8F5] py-20 sm:py-24"
    >
      <div className="mx-auto max-w-[1100px] px-5 md:px-10">
        {/* Header */}
        <div className="text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#993556]">
            Tarification
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-[32px] italic leading-tight text-[#1A1A1A] sm:text-[38px]">
            Simple. Transparent.
            <br />
            Sans surprise.
          </h2>
          <p className="mx-auto mt-4 max-w-[520px] text-[16px] leading-relaxed text-[#6B6B6B]">
            Voici ce que reçoivent vos invités quand vous publiez.
            <br />
            Vous créez gratuitement. Vous payez à la publication.
          </p>
        </div>

        <div className="mt-12 grid items-start gap-8 md:grid-cols-2 md:gap-10">

          {/* Left column — live invitation preview */}
          <div className="order-2 min-w-0 md:order-1 md:sticky md:top-[100px]">
            <div className="relative mx-auto w-full max-w-[280px] sm:max-w-[340px]">
              <div
                className="rounded-[44px] bg-[#1A1A1A] p-2.5"
                style={{
                  boxShadow:
                    "0 32px 80px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(255,255,255,0.06)",
                }}
              >
                <div className="relative h-[420px] overflow-hidden rounded-[36px] bg-white sm:h-[580px]">
                  <span
                    aria-hidden
                    className="absolute left-1/2 top-0 z-10 h-7 w-[100px] -translate-x-1/2 rounded-b-[18px] bg-[#1A1A1A]"
                  />
                  {visible ? (
                    <iframe
                      src={PREVIEW_URL}
                      title="Aperçu d'une invitation MonInvit — Basile & Armelle"
                      loading="lazy"
                      className="pricing-preview-iframe pointer-events-none absolute left-0 top-0 border-0"
                    />
                  ) : null}
                </div>
              </div>

              <span className="absolute -bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#1A1A1A] px-3.5 py-1.5 text-[11px] font-medium text-[#FAF8F5] shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
                <span className="pricing-preview-dot size-1.5 rounded-full bg-[#059669]" />
                Vraie invitation · Basile &amp; Armelle
              </span>
            </div>

            <a
              href={PREVIEW_URL}
              target="_blank"
              rel="noopener"
              className="mt-8 block text-center text-[12px] font-medium tracking-[0.02em] text-[#993556] hover:underline"
            >
              Voir la page complète →
            </a>
          </div>


        {/* Card */}
        <div
          className="relative order-1 w-full min-w-0 overflow-hidden rounded-[20px] border-[0.5px] border-[#E5E5E5] bg-white p-6 sm:p-[36px_32px] md:order-2"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)" }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -right-5 -top-5 size-[120px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(153,53,86,0.06) 0%, transparent 70%)",
            }}
          />

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-[#9CA3AF]">
                Formule unique
              </p>
              <p className="mt-1 font-[family-name:var(--font-display)] text-[22px] italic text-[#1A1A1A]">
                Publication complète
              </p>
            </div>
            <div className="text-right">
              <p className="font-[family-name:var(--font-display)] text-[32px] italic leading-none text-[#1A1A1A] sm:text-[38px]">
                24 900{" "}
                <span className="align-super text-[14px] font-normal not-italic text-[#6B6B6B]">
                  XOF
                </span>
              </p>
              <p className="mt-1 text-[10px] text-[#9CA3AF]">Paiement unique</p>
            </div>
          </div>

          <hr className="my-6 border-0 border-t-[0.5px] border-[#F0F0F0]" />

          <ul>
            {ITEMS.map(({ icon: Icon, title, sub, addon }) => (
              <li
                key={title}
                className={
                  addon
                    ? "my-1 -mx-1 flex items-start gap-3 rounded-lg border-[0.5px] border-dashed border-[#E5E5E5] bg-[#FAFAFA] px-2.5 py-2"
                    : "flex items-start gap-3 border-b-[0.5px] border-[#F9F9F9] py-[7px]"
                }
              >
                <span className="mt-0.5 grid size-[22px] shrink-0 place-items-center rounded-full bg-[#FBEAF0]">
                  <Icon size={12} className="text-[#993556]" aria-hidden />
                </span>
                <span className="text-[13px] font-medium leading-snug text-[#1A1A1A]">
                  {title}
                  {addon ? (
                    <span className="ml-1.5 rounded-full bg-[#F3F4F6] px-[7px] py-0.5 text-[10px] font-normal text-[#6B6B6B]">
                      + 1 990 XOF
                    </span>
                  ) : null}
                  {sub ? (
                    <span className="ml-2 text-[11px] font-normal text-[#9CA3AF]">{sub}</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>

          <Link
            to="/signup"
            className="mt-7 block w-full rounded-xl bg-[#4B1528] px-4 py-[14px] text-center text-[15px] font-semibold text-[#FBEAF0] transition hover:opacity-[0.88] sm:py-4"
          >
            Commencer gratuitement →
          </Link>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {["Wave", "Orange Money", "MTN", "Moov", "Carte"].map((p) => (
              <span
                key={p}
                className="whitespace-nowrap rounded-full border-[0.5px] border-[#E5E5E5] bg-[#F3F4F6] px-2.5 py-1 text-[10px] text-[#6B6B6B]"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
        </div>

        {/* Guarantee */}
        <div className="mx-auto mt-12 flex max-w-[680px] items-start gap-3.5 rounded-[14px] border-[0.5px] border-[#EDE8E0] bg-[#F9F6F2] px-6 py-5">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#FBEAF0]">
            <Lock size={18} className="text-[#993556]" aria-hidden />
          </span>
          <div>
            <p className="mb-1.5 text-[13px] font-semibold text-[#1A1A1A]">
              Vous ne payez que quand vous êtes prêt
            </p>
            <p className="text-[12px] leading-[1.6] text-[#6B6B6B]">
              Créez, personnalisez, prévisualisez autant que vous voulez. La publication —
              et le paiement — se font uniquement quand votre invitation vous rend fier.
            </p>
          </div>
        </div>

        {/* Mini FAQ */}
        <div className="mt-8">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className="mx-auto max-w-[680px] border-t-[0.5px] border-[#F0F0F0] py-3.5"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-3 text-left text-[13px] font-medium text-[#1A1A1A]"
                >
                  <span>{f.q}</span>
                  <Plus
                    size={16}
                    aria-hidden
                    className={
                      "shrink-0 text-[#9CA3AF] transition-transform duration-200 " +
                      (isOpen ? "rotate-45" : "")
                    }
                  />
                </button>
                {isOpen ? (
                  <p className="mt-2.5 pr-6 text-[12px] leading-[1.65] text-[#6B6B6B]">
                    {f.a}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
