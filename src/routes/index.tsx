import { createFileRoute, Link } from "@tanstack/react-router";
import { templateMeta, templateOrder } from "@/lib/ceremony-meta";
import heroCouple from "@/assets/home-couple.jpg";
import romanceImg from "@/assets/home-romance.jpg";
import tableImg from "@/assets/home-table.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MonMariage.ci — Votre page de mariage, en 10 minutes" },
      {
        name: "description",
        content:
          "Créez une page d'invitation romantique pour votre mariage en Côte d'Ivoire. 20+ modèles élégants, RSVP, programme, invités. Gratuit jusqu'à la publication.",
      },
      { property: "og:title", content: "MonMariage.ci — Célébrons votre union" },
      {
        property: "og:description",
        content:
          "Une page d'invitation stylée pour dot, civil, religieux et réception — prête en 10 minutes.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fdf7f3] text-[#2b1a14]">
      {/* Header */}
      <header className="relative z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Link to="/" className="font-serif text-lg italic">
            MonMariage<span className="text-[#c17c74]">.ci</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm text-[#6b4a3e] hover:text-[#2b1a14]"
            >
              Se connecter
            </Link>
            <Link
              to="/signup"
              className="hidden rounded-full bg-[#2b1a14] px-4 py-2 text-xs font-medium text-[#fdf7f3] hover:opacity-90 sm:inline-block"
            >
              Commencer
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative isolate">
        {/* Romantic gradient wash */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(1200px 600px at 50% -10%, #f6d9cb 0%, #fdf7f3 55%, #fdf7f3 100%)",
          }}
        />
        {/* Floating petals */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-60">
          <span className="absolute left-[8%] top-[18%] size-2 rounded-full bg-[#c17c74]/40" />
          <span className="absolute right-[12%] top-[10%] size-3 rounded-full bg-[#e8c5b6]/60" />
          <span className="absolute left-[20%] top-[38%] size-1.5 rounded-full bg-[#d97757]/50" />
          <span className="absolute right-[18%] top-[55%] size-2 rounded-full bg-[#c9a84c]/40" />
        </div>

        <div className="mx-auto max-w-5xl px-5 pt-10 text-center sm:pt-16">
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#c17c74]">
            Côte d'Ivoire · Depuis Abidjan
          </p>
          <h1 className="mt-6 font-serif text-[44px] leading-[1.02] italic sm:text-6xl md:text-7xl">
            Votre grand jour, <br />
            <span className="text-[#c17c74]">une page inoubliable.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-[#6b4a3e] sm:text-base">
            Créez une invitation romantique et élégante en <strong>10 minutes</strong>.
            Choisissez parmi 20+ modèles, ajoutez vos étapes, envoyez le lien —
            vos invités RSVP en un clic.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/signup"
              className="inline-block w-full rounded-full bg-[#2b1a14] px-8 py-4 text-sm font-medium tracking-wide text-[#fdf7f3] shadow-lg shadow-[#c17c74]/20 transition hover:-translate-y-0.5 hover:shadow-xl sm:w-auto"
            >
              Créer ma page — Gratuit
            </Link>
            <p className="text-xs text-[#8a6a5e]">
              Aucune carte bancaire · Payez à la publication
            </p>
          </div>
        </div>

        {/* Fan of template cards */}
        <TemplateFan />
      </section>

      {/* PROOF STRIP */}
      <section className="border-y border-[#e8c5b6]/40 bg-[#fbeee4]/60">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-5 py-8 text-center sm:grid-cols-4">
          {[
            ["10 min", "Pour créer votre page"],
            ["20+", "Modèles romantiques"],
            ["4 étapes", "Dot, civil, religieux, réception"],
            ["0 stress", "RSVP automatiques"],
          ].map(([n, l]) => (
            <div key={l}>
              <p className="font-serif text-2xl italic text-[#c17c74] sm:text-3xl">
                {n}
              </p>
              <p className="mt-1 text-xs text-[#6b4a3e] sm:text-sm">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY — TIME + ROMANCE */}
      <section className="mx-auto max-w-5xl px-5 py-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="relative">
            <img
              src={romanceImg}
              alt="Roses et alliances dorées"
              width={1024}
              height={1024}
              loading="lazy"
              className="aspect-[4/5] w-full rounded-[2rem] object-cover shadow-xl shadow-[#c17c74]/15"
            />
            <div className="absolute -bottom-6 -right-4 hidden rounded-2xl bg-[#fdf7f3] p-4 shadow-lg sm:block">
              <p className="font-serif text-xs italic text-[#6b4a3e]">
                « Prête en une soirée. »
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[#c17c74]">
                Aïcha & Stéphane
              </p>
            </div>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#c17c74]">
              Pourquoi MonMariage.ci
            </p>
            <h2 className="mt-4 font-serif text-4xl leading-[1.1] italic">
              Le temps de dire <br />
              <em className="text-[#c17c74]">« oui »</em>, et c'est prêt.
            </h2>
            <ul className="mt-8 space-y-6">
              {[
                {
                  t: "10 minutes chrono",
                  d: "Prénoms, date, lieu, quelques photos — votre page est en ligne. Pas de logiciel à installer, tout se fait depuis votre téléphone.",
                },
                {
                  t: "Modèles pensés pour l'Afrique",
                  d: "Terracotta, wax doré, kente royal, sahel, botanique… des ambiances qui vous ressemblent, loin des clichés.",
                },
                {
                  t: "Vos invités RSVP en un clic",
                  d: "Un lien à partager sur WhatsApp. Ils confirment, vous suivez tout dans votre tableau de bord.",
                },
              ].map((b) => (
                <li key={b.t} className="flex gap-4">
                  <span className="mt-2 h-px w-8 shrink-0 bg-[#c17c74]" />
                  <div>
                    <p className="font-serif text-lg italic">{b.t}</p>
                    <p className="mt-1 text-sm leading-relaxed text-[#6b4a3e]">
                      {b.d}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="border-t border-[#e8c5b6]/40 bg-[#fbeee4]/40 py-24">
        <div className="mx-auto max-w-5xl px-5">
          <div className="text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#c17c74]">
              4 étapes, c'est tout
            </p>
            <h2 className="mt-4 font-serif text-4xl italic sm:text-5xl">
              De l'idée à l'invitation
            </h2>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["01", "Vos prénoms", "Vous et votre moitié, c'est tout ce qu'il faut pour démarrer."],
              ["02", "Vos dates", "Une seule étape ou toutes : dot, civil, religieux, réception."],
              ["03", "Votre ambiance", "Un modèle qui vous ressemble, personnalisable en quelques clics."],
              ["04", "Partagez", "Un lien élégant à envoyer sur WhatsApp. Les RSVP arrivent tout seuls."],
            ].map(([n, t, d]) => (
              <div
                key={n}
                className="rounded-3xl border border-[#e8c5b6]/60 bg-[#fdf7f3] p-6 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#c17c74]">
                  Étape {n}
                </p>
                <p className="mt-3 font-serif text-xl italic">{t}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#6b4a3e]">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EDITORIAL COUPLE */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <div className="grid items-center gap-12 md:grid-cols-5">
          <div className="md:col-span-3">
            <img
              src={heroCouple}
              alt="Couple mariés à Abidjan"
              width={1024}
              height={1024}
              loading="lazy"
              className="aspect-[5/4] w-full rounded-[2rem] object-cover shadow-xl shadow-[#c17c74]/15"
            />
          </div>
          <div className="md:col-span-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#c17c74]">
              Pensé à Abidjan
            </p>
            <h2 className="mt-4 font-serif text-4xl italic leading-[1.1]">
              Chaque mariage <br />
              a son histoire.
            </h2>
            <p className="mt-6 text-[15px] leading-relaxed text-[#6b4a3e]">
              MonMariage.ci comprend nos traditions. Que vous célébriez une dot
              intime, un mariage à l'église, ou trois jours de fête — chaque
              étape a sa page, son programme et son lieu.
            </p>
            <Link
              to="/signup"
              className="mt-8 inline-block rounded-full border border-[#2b1a14] px-6 py-3 text-sm font-medium text-[#2b1a14] transition hover:bg-[#2b1a14] hover:text-[#fdf7f3]"
            >
              Créer notre page →
            </Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative isolate overflow-hidden bg-[#2b1a14] text-[#fdf7f3]">
        <img
          src={tableImg}
          alt=""
          width={1024}
          height={1024}
          loading="lazy"
          aria-hidden
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-20"
        />
        <div className="mx-auto max-w-3xl px-5 py-24 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#e8c5b6]">
            Il ne manque plus que vous
          </p>
          <h2 className="mt-6 font-serif text-4xl italic leading-[1.05] sm:text-6xl">
            Faisons de votre <em className="text-[#e8c5b6]">« oui »</em> <br />
            un souvenir partagé.
          </h2>
          <Link
            to="/signup"
            className="mt-10 inline-block rounded-full bg-[#fdf7f3] px-10 py-4 text-sm font-medium tracking-wide text-[#2b1a14] shadow-xl transition hover:-translate-y-0.5"
          >
            Commencer gratuitement
          </Link>
          <p className="mt-4 text-xs text-[#e8c5b6]/70">
            Créez votre page en 10 min · Payez uniquement à la publication
          </p>
        </div>
      </section>

      <footer className="border-t border-[#e8c5b6]/40 bg-[#fdf7f3] py-8 text-center text-xs text-[#8a6a5e]">
        © 2027 MonMariage.ci — Fait avec ♡ à Abidjan
      </footer>
    </main>
  );
}

/**
 * Fanned template cards, inspired by editorial "wedding invitation reveal"
 * layouts: 5 cards, center card upright and prominent, side cards rotated.
 */
function TemplateFan() {
  const cards = templateOrder.map((id) => ({ id, ...templateMeta[id] }));
  // Arrange: [outer-left, left, center, right, outer-right]
  const arranged = [cards[1], cards[3], cards[0], cards[2], cards[4]];
  const layout = [
    { rot: -14, x: -220, y: 40, z: 1, scale: 0.82 },
    { rot: -7, x: -115, y: 18, z: 2, scale: 0.9 },
    { rot: 0, x: 0, y: 0, z: 3, scale: 1 },
    { rot: 7, x: 115, y: 18, z: 2, scale: 0.9 },
    { rot: 14, x: 220, y: 40, z: 1, scale: 0.82 },
  ];

  return (
    <div className="relative mx-auto mt-14 h-[420px] w-full max-w-5xl sm:mt-20 sm:h-[520px]">
      <div className="absolute left-1/2 top-0 h-full w-full -translate-x-1/2">
        {arranged.map((c, i) => {
          const l = layout[i];
          return (
            <div
              key={c.id}
              className="absolute left-1/2 top-1/2 origin-bottom transition-transform duration-500 hover:-translate-y-2"
              style={{
                zIndex: l.z,
                transform: `translate(-50%, -50%) translate(${l.x}px, ${l.y}px) rotate(${l.rot}deg) scale(${l.scale})`,
              }}
            >
              <TemplateCard meta={c} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TemplateCard({
  meta,
}: {
  meta: { label: string; tagline: string; swatch: string[] };
}) {
  const [bg, accent1, accent2, ink] = meta.swatch;
  return (
    <div
      className="relative flex h-[340px] w-[210px] flex-col overflow-hidden rounded-[18px] shadow-[0_20px_60px_-20px_rgba(75,32,20,0.35)] ring-1 ring-black/5 sm:h-[420px] sm:w-[260px]"
      style={{ backgroundColor: bg, color: ink }}
    >
      {/* Top badge */}
      <div className="flex items-center justify-between px-4 pt-4">
        <span
          className="font-mono text-[8px] uppercase tracking-[0.25em]"
          style={{ color: ink, opacity: 0.6 }}
        >
          Save the date
        </span>
        <span
          className="size-1.5 rounded-full"
          style={{ backgroundColor: accent2 }}
        />
      </div>

      {/* Image band */}
      <div
        className="mx-4 mt-3 flex-1 rounded-md"
        style={{
          background: `linear-gradient(140deg, ${accent1} 0%, ${accent2} 55%, ${ink} 100%)`,
        }}
      />

      {/* Title */}
      <div className="px-4 py-4 text-center">
        <p
          className="font-serif text-[22px] italic leading-none sm:text-[26px]"
          style={{ color: ink }}
        >
          Aïcha
        </p>
        <p
          className="my-0.5 font-serif text-xs italic"
          style={{ color: accent2 }}
        >
          &
        </p>
        <p
          className="font-serif text-[22px] italic leading-none sm:text-[26px]"
          style={{ color: ink }}
        >
          Stéphane
        </p>
        <div
          className="mx-auto my-3 h-px w-8"
          style={{ backgroundColor: accent2 }}
        />
        <p
          className="font-mono text-[8px] uppercase tracking-[0.3em]"
          style={{ color: ink, opacity: 0.7 }}
        >
          14 · 08 · 2027 · Abidjan
        </p>
      </div>

      {/* Bottom label */}
      <div
        className="border-t px-4 py-2 text-center font-mono text-[8px] uppercase tracking-[0.25em]"
        style={{ borderColor: `${ink}22`, color: ink, opacity: 0.6 }}
      >
        {meta.label}
      </div>
    </div>
  );
}
