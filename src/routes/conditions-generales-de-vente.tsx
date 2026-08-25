import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/SiteChrome";

export const Route = createFileRoute("/conditions-generales-de-vente")({
  head: () => ({
    meta: [
      { title: "Conditions générales de vente — MonInvit.com" },
      {
        name: "description",
        content:
          "CGV MonInvit.com : création gratuite, paiement unique à la publication de l'invitation, aucun remboursement après paiement. Tarifs et modalités.",
      },
      {
        property: "og:title",
        content: "Conditions générales de vente — MonInvit.com",
      },
      {
        property: "og:description",
        content:
          "Tout est gratuit jusqu'à la publication. Le paiement est unique et non remboursable.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/conditions-generales-de-vente" }],
  }),
  component: CgvPage,
});

function CgvPage() {
  return (
    <PageShell
      eyebrow="Légal"
      title={
        <>
          Conditions générales{" "}
          <span className="italic text-[#E82050]">de vente</span>
        </>
      }
      intro="Gratuit jusqu'à la publication, un paiement unique ensuite. Voici, en clair, ce que vous achetez et dans quelles conditions."
    >
      <LegalBody>
        <Meta>Dernière mise à jour&nbsp;: 6 août 2026</Meta>

        <Section title="1. Objet">
          <p>
            Les présentes conditions générales de vente (CGV) régissent la vente
            des services proposés par MonInvit.com : la publication d'une
            invitation de mariage digitale et ses options (notamment le livre
            d'or). Toute commande implique l'acceptation pleine et entière des
            présentes CGV.
          </p>
        </Section>

        <Section title="2. Gratuité jusqu'à la publication">
          <p>
            La création d'un compte, la personnalisation de l'invitation, l'ajout
            des cérémonies, des photos et de la liste d'invités sont{" "}
            <strong>entièrement gratuits</strong>. Vous pouvez travailler votre
            invitation aussi longtemps que vous le souhaitez, la prévisualiser et
            la modifier sans aucun engagement.
          </p>
          <p>
            Le paiement n'intervient qu'au moment où vous décidez de{" "}
            <strong>publier</strong> votre invitation, c'est-à-dire de la rendre
            accessible à vos invités via un lien public.
          </p>
        </Section>

        <Section title="3. Tarifs">
          <p>
            Les tarifs applicables sont ceux affichés sur le site au moment de la
            commande, en francs CFA (XOF), toutes taxes comprises. Le paiement de
            la publication est un <strong>paiement unique</strong> : il n'y a ni
            abonnement, ni prélèvement récurrent.
          </p>
          <p>
            Les options additionnelles (par exemple le livre d'or) sont facturées
            séparément et de la même manière : un paiement unique, affiché avant
            validation.
          </p>
        </Section>

        <Section title="4. Commande et paiement">
          <p>
            Le paiement s'effectue en ligne via notre prestataire de paiement
            sécurisé. Aucune donnée bancaire n'est stockée par MonInvit.com. La
            commande est considérée comme définitive dès la confirmation du
            paiement par le prestataire.
          </p>
          <p>
            Un code promotionnel valide peut réduire ou annuler le montant dû ;
            dans ce cas, la publication est activée sans paiement.
          </p>
        </Section>

        <Section title="5. Livraison du service">
          <p>
            La publication est activée immédiatement après confirmation du
            paiement. Votre invitation devient alors accessible via son lien
            public et vous pouvez la partager avec vos invités. Une facture au
            format PDF est disponible depuis votre tableau de bord, rubrique
            «&nbsp;Paiement &amp; facture&nbsp;».
          </p>
        </Section>

        <Section title="6. Absence de droit de rétractation et de remboursement">
          <p>
            Le service est un contenu numérique fourni immédiatement après le
            paiement, avec votre accord exprès. En conséquence,{" "}
            <strong>
              aucun remboursement n'est possible une fois le paiement effectué
            </strong>
            , la publication étant activée dans la foulée.
          </p>
          <p>
            Cette règle est acceptable parce que l'intégralité du parcours est
            gratuite avant le paiement : vous pouvez tester, prévisualiser et
            valider votre invitation dans son état final avant de payer quoi que
            ce soit. Le paiement ne survient qu'au moment où vous décidez de
            publier.
          </p>
          <p>
            Seule exception : en cas de double paiement pour une même publication
            ou d'échec technique imputable à MonInvit.com empêchant durablement la
            publication, nous procédons au remboursement du montant concerné après
            vérification.
          </p>
        </Section>

        <Section title="7. Durée de mise en ligne">
          <p>
            L'invitation publiée reste accessible pendant au moins douze (12) mois
            à compter de la date de publication. Passé ce délai, MonInvit.com peut
            archiver la page ; les données restent récupérables sur simple demande
            pendant trois (3) mois supplémentaires.
          </p>
        </Section>

        <Section title="8. Obligations du client">
          <p>
            Vous garantissez disposer des droits sur les contenus (textes, photos,
            noms) publiés et vous engagez à ne pas diffuser de contenu illégal ou
            portant atteinte aux droits de tiers. MonInvit.com peut suspendre une
            invitation manifestement contraire à ces règles, sans remboursement.
          </p>
        </Section>

        <Section title="9. Responsabilité">
          <p>
            La responsabilité de MonInvit.com est limitée au montant effectivement
            payé pour la publication concernée. Nous ne saurions être tenus
            responsables des dommages indirects (non-réception d'un RSVP par un
            invité, perte de chance, etc.).
          </p>
        </Section>

        <Section title="10. Droit applicable et litiges">
          <p>
            Les présentes CGV sont soumises au droit ivoirien. En cas de litige,
            une solution amiable sera recherchée en priorité ; à défaut, les
            tribunaux compétents d'Abidjan seront saisis.
          </p>
        </Section>

        <Section title="11. Contact">
          <p>
            Pour toute question relative à une commande&nbsp;:{" "}
            <a
              href="mailto:contact@moninvit.com"
              className="font-medium text-[#E82050] underline underline-offset-2"
            >
              contact@moninvit.com
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
      <div className="rounded-3xl border border-[#F1E3C6]/50 bg-white/60 p-6 shadow-sm backdrop-blur sm:p-10">
        <div className="space-y-8 text-[15px] leading-relaxed text-[#201A1C]">
          {children}
        </div>
      </div>
    </section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-[family-name:var(--font-display)] text-2xl text-[#201A1C]">
        {title}
      </h2>
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
