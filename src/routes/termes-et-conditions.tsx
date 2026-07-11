import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/SiteChrome";

export const Route = createFileRoute("/termes-et-conditions")({
  head: () => ({
    meta: [
      { title: "Termes & conditions — MonInvit.com" },
      {
        name: "description",
        content:
          "Conditions générales d'utilisation de MonInvit.com : création d'invitations, paiement, publication et responsabilités.",
      },
      { property: "og:title", content: "Termes & conditions — MonInvit.com" },
      {
        property: "og:description",
        content:
          "Les règles d'utilisation de MonInvit.com pour les mariés et leurs invités.",
      },
    ],
    links: [{ rel: "canonical", href: "/termes-et-conditions" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <PageShell
      eyebrow="Légal"
      title={
        <>
          Termes <span className="italic text-[#c17c74]">& conditions</span>
        </>
      }
      intro="Les règles qui encadrent l'utilisation de MonInvit.com — écrites simplement, pour que tout soit clair avant votre grand jour."
    >
      <LegalBody>
        <Meta>Dernière mise à jour&nbsp;: 11 juillet 2026</Meta>

        <Section title="1. Acceptation des conditions">
          <p>
            En créant un compte ou en utilisant MonInvit.com (« le Service »), vous
            acceptez les présentes conditions. Si vous n'êtes pas d'accord avec l'une
            d'elles, merci de ne pas utiliser le Service.
          </p>
        </Section>

        <Section title="2. Description du service">
          <p>
            MonInvit.com permet de créer, personnaliser et partager des invitations
            de mariage digitales, de gérer une liste d'invités et de recevoir les
            confirmations de présence (RSVP).
          </p>
        </Section>

        <Section title="3. Compte utilisateur">
          <p>
            Vous êtes responsable de la confidentialité de vos identifiants et de
            toute activité effectuée depuis votre compte. Vous devez fournir des
            informations exactes lors de l'inscription.
          </p>
        </Section>

        <Section title="4. Paiement et publication">
          <p>
            La création et la personnalisation d'une invitation sont gratuites. La
            publication (rendre l'invitation accessible via un lien public) est
            payante. Le tarif est indiqué au moment du paiement.
          </p>
          <p>
            Les paiements sont non-remboursables une fois l'invitation publiée, sauf
            dans les cas prévus par la loi ivoirienne.
          </p>
        </Section>

        <Section title="5. Contenu utilisateur">
          <p>
            Vous conservez la propriété des contenus (textes, photos, noms) que vous
            ajoutez à votre invitation. Vous nous accordez une licence limitée pour
            les héberger et les afficher aux personnes disposant du lien.
          </p>
          <p>
            Vous vous engagez à ne pas publier de contenu illégal, offensant ou
            portant atteinte aux droits de tiers.
          </p>
        </Section>

        <Section title="6. Disponibilité du service">
          <p>
            Nous faisons de notre mieux pour maintenir le Service disponible 24h/24.
            MonInvit.com ne peut être tenu responsable d'une interruption temporaire
            liée à la maintenance ou à un cas de force majeure.
          </p>
        </Section>

        <Section title="7. Limitation de responsabilité">
          <p>
            MonInvit.com ne saurait être tenu responsable des dommages indirects
            liés à l'utilisation du Service (perte de données, non-réception d'un
            RSVP par un invité, etc.). Notre responsabilité est limitée au montant
            payé pour la publication.
          </p>
        </Section>

        <Section title="8. Modification des conditions">
          <p>
            Nous pouvons faire évoluer ces conditions. En cas de changement
            significatif, vous serez notifié par e-mail ou depuis votre tableau de
            bord.
          </p>
        </Section>

        <Section title="9. Droit applicable">
          <p>
            Les présentes conditions sont régies par le droit ivoirien. Tout litige
            sera soumis aux tribunaux compétents d'Abidjan.
          </p>
        </Section>

        <Section title="10. Contact">
          <p>
            Une question ? Écrivez-nous à{" "}
            <a
              href="mailto:contact@moninvit.ci"
              className="font-medium text-[#c17c74] underline underline-offset-2"
            >
              contact@moninvit.ci
            </a>
            .
          </p>
        </Section>
      </LegalBody>
    </PageShell>
  );
}

function LegalBody({ children }: { children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-3xl px-5 pb-24">
      <div className="rounded-3xl border border-[#e8c5b6]/50 bg-white/60 p-6 shadow-sm backdrop-blur sm:p-10">
        <div className="space-y-8 text-[15px] leading-relaxed text-[#3a2620]">
          {children}
        </div>
      </div>
    </section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-[family-name:var(--font-display)] text-2xl text-[#2b1a14]">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-[#4b342c]">{children}</div>
    </div>
  );
}

function Meta({ children }: { children: React.ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 rounded-full bg-[#fbeee4] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-[#8a5a4d]">
      <span className="inline-block size-1.5 rounded-full bg-[#c17c74]" />
      {children}
    </p>
  );
}
