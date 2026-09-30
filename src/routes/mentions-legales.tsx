import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/SiteChrome";
import { LEGAL_ENTITY, LEGAL_ENTITY_PHONE_HREF } from "@/lib/legal-entity";

export const Route = createFileRoute("/mentions-legales")({
  head: () => ({
    meta: [
      { title: "Mentions légales — MonInvit.com" },
      {
        name: "description",
        content:
          "Mentions légales de MonInvit.com : éditeur du site, coordonnées, immatriculation et conditions d'utilisation du contenu.",
      },
      { property: "og:title", content: "Mentions légales — MonInvit.com" },
      {
        property: "og:description",
        content: `MonInvit.com est édité par ${LEGAL_ENTITY.name}, ${LEGAL_ENTITY.legalForm} basée à Abidjan.`,
      },
    ],
    links: [{ rel: "canonical", href: "/mentions-legales" }],
  }),
  component: LegalNoticePage,
});

function LegalNoticePage() {
  return (
    <PageShell
      eyebrow="Légal"
      title={
        <>
          Mentions <span className="italic text-[#E82050]">légales</span>
        </>
      }
      intro="Qui édite MonInvit.com, comment nous joindre et ce que vous pouvez faire du contenu du site."
    >
      <LegalBody>
        <Meta>Dernière mise à jour&nbsp;: 30 septembre 2026</Meta>

        <Section title="1. Éditeur du site">
          <p>Le site {LEGAL_ENTITY.serviceName} est édité par&nbsp;:</p>
          <dl className="mt-4 divide-y divide-[#F1E3C6]/60 rounded-2xl border border-[#F1E3C6]/60 bg-[#FBF8F8]/60">
            <Row label="Dénomination sociale" value={LEGAL_ENTITY.name} />
            <Row label="Forme juridique" value={LEGAL_ENTITY.legalForm} />
            <Row label="Capital social" value={LEGAL_ENTITY.capital} />
            <Row label="Siège social" value={LEGAL_ENTITY.address} />
            <Row label="RCCM" value={LEGAL_ENTITY.rccm} />
            <Row label="Compte contribuable" value={LEGAL_ENTITY.taxId} />
            <Row
              label="Téléphone"
              value={
                <a
                  href={LEGAL_ENTITY_PHONE_HREF}
                  className="font-medium text-[#E82050] underline underline-offset-2"
                >
                  {LEGAL_ENTITY.phone}
                </a>
              }
            />
            <Row
              label="Adresse électronique"
              value={
                <a
                  href={`mailto:${LEGAL_ENTITY.email}`}
                  className="font-medium text-[#E82050] underline underline-offset-2"
                >
                  {LEGAL_ENTITY.email}
                </a>
              }
            />
          </dl>
        </Section>

        <Section title="2. Nous contacter">
          <p>
            Pour toute question sur votre compte, une commande ou une invitation en cours, écrivez à{" "}
            <a
              href="mailto:contact@moninvit.com"
              className="font-medium text-[#E82050] underline underline-offset-2"
            >
              contact@moninvit.com
            </a>
            . Les demandes qui concernent la société éditrice peuvent être adressées à{" "}
            <a
              href={`mailto:${LEGAL_ENTITY.email}`}
              className="font-medium text-[#E82050] underline underline-offset-2"
            >
              {LEGAL_ENTITY.email}
            </a>
            .
          </p>
        </Section>

        <Section title="3. Propriété intellectuelle">
          <p>
            La structure du site, son identité visuelle, ses textes et ses modèles d'invitation sont
            la propriété de {LEGAL_ENTITY.name}. Toute reproduction ou réutilisation, totale ou
            partielle, sans autorisation écrite préalable est interdite.
          </p>
          <p>
            Les photos, textes et contenus que vous ajoutez à votre invitation restent votre
            propriété. Vous nous autorisez uniquement à les héberger et à les afficher pour faire
            fonctionner le service.
          </p>
        </Section>

        <Section title="4. Données personnelles">
          <p>
            {LEGAL_ENTITY.name} est responsable du traitement des données collectées sur{" "}
            {LEGAL_ENTITY.serviceName}. Les finalités, les durées de conservation et vos droits sont
            détaillés dans notre{" "}
            <a
              href="/politique-de-confidentialite"
              className="font-medium text-[#E82050] underline underline-offset-2"
            >
              politique de confidentialité
            </a>
            .
          </p>
        </Section>

        <Section title="5. Conditions d'utilisation">
          <p>
            L'utilisation du service est encadrée par nos{" "}
            <a
              href="/termes-et-conditions"
              className="font-medium text-[#E82050] underline underline-offset-2"
            >
              termes &amp; conditions
            </a>{" "}
            et, pour les achats, par nos{" "}
            <a
              href="/conditions-generales-de-vente"
              className="font-medium text-[#E82050] underline underline-offset-2"
            >
              conditions générales de vente
            </a>
            .
          </p>
        </Section>

        <Section title="6. Droit applicable">
          <p>
            Les présentes mentions légales sont régies par le droit ivoirien. En cas de litige, et à
            défaut d'accord amiable, les tribunaux compétents d'Abidjan seront saisis.
          </p>
        </Section>
      </LegalBody>
    </PageShell>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:gap-4 sm:px-5">
      <dt className="shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] text-[#7A6D70] sm:w-56">
        {label}
      </dt>
      <dd className="text-[15px] text-[#201A1C]">{value}</dd>
    </div>
  );
}

function LegalBody({ children }: { children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-3xl px-5 pb-24">
      <div className="rounded-3xl border border-[#F1E3C6]/50 bg-white/60 p-6 shadow-sm backdrop-blur sm:p-10">
        <div className="space-y-8 text-[15px] leading-relaxed text-[#201A1C]">{children}</div>
      </div>
    </section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-[family-name:var(--font-display)] text-2xl text-[#201A1C]">{title}</h2>
      <div className="mt-3 space-y-3 text-[#5A4F52]">{children}</div>
    </div>
  );
}

function Meta({ children }: { children: React.ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 rounded-full bg-[#FDF0F3] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-[#7A6D70]">
      <span className="inline-block size-1.5 rounded-full bg-[#E82050]" />
      {children}
    </p>
  );
}
