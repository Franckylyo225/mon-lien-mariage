import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/SiteChrome";

export const Route = createFileRoute("/politique-de-confidentialite")({
  head: () => ({
    meta: [
      { title: "Politique de confidentialité — MonInvit.com" },
      {
        name: "description",
        content:
          "Comment MonInvit.com collecte, utilise et protège vos données personnelles ainsi que celles de vos invités.",
      },
      { property: "og:title", content: "Politique de confidentialité — MonInvit.com" },
      {
        property: "og:description",
        content:
          "Transparence sur la collecte et la protection de vos données sur MonInvit.com.",
      },
    ],
    links: [{ rel: "canonical", href: "/politique-de-confidentialite" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <PageShell
      eyebrow="Légal"
      title={
        <>
          Politique de <span className="italic text-[#c17c74]">confidentialité</span>
        </>
      }
      intro="Vos données et celles de vos invités sont précieuses. Voici comment nous les protégeons, en toute transparence."
    >
      <LegalBody>
        <Meta>Dernière mise à jour&nbsp;: 11 juillet 2026</Meta>

        <Section title="1. Qui sommes-nous ?">
          <p>
            MonInvit.com est édité depuis Abidjan, Côte d'Ivoire. Nous sommes
            responsables du traitement de vos données personnelles au sens de la loi
            n°2013-450 relative à la protection des données à caractère personnel.
          </p>
        </Section>

        <Section title="2. Données que nous collectons">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Compte :</strong> adresse e-mail, nom, mot de passe (chiffré).
            </li>
            <li>
              <strong>Invitation :</strong> prénoms des mariés, date, lieu, photos,
              programme, thème choisi.
            </li>
            <li>
              <strong>Invités :</strong> noms et numéros de téléphone que vous
              ajoutez à votre liste.
            </li>
            <li>
              <strong>Paiement :</strong> traité par notre prestataire ; nous ne
              stockons jamais vos coordonnées bancaires.
            </li>
            <li>
              <strong>Usage :</strong> pages visitées, appareil, pour améliorer le
              service.
            </li>
          </ul>
        </Section>

        <Section title="3. Comment nous utilisons vos données">
          <ul className="list-disc space-y-2 pl-5">
            <li>Vous permettre de créer et publier votre invitation.</li>
            <li>Envoyer les liens WhatsApp / SMS à vos invités à votre demande.</li>
            <li>Enregistrer les RSVP et vous en tenir informés.</li>
            <li>Améliorer nos modèles et notre service.</li>
            <li>Vous contacter en cas de problème technique ou de facturation.</li>
          </ul>
        </Section>

        <Section title="4. Partage des données">
          <p>
            Nous ne vendons jamais vos données. Nous les partageons uniquement
            avec&nbsp;:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Notre hébergeur, pour stocker et servir la plateforme.</li>
            <li>Notre prestataire de paiement, pour traiter votre publication.</li>
            <li>
              Les autorités, uniquement si la loi ivoirienne l'exige.
            </li>
          </ul>
        </Section>

        <Section title="5. Conservation">
          <p>
            Vos données sont conservées tant que votre compte est actif. Après
            suppression, elles sont effacées sous 30 jours, sauf obligation légale
            de conservation (facturation).
          </p>
        </Section>

        <Section title="6. Vos droits">
          <p>Vous pouvez à tout moment :</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Accéder à vos données et en demander une copie.</li>
            <li>Les corriger ou les mettre à jour.</li>
            <li>Demander leur suppression.</li>
            <li>Retirer votre consentement.</li>
          </ul>
          <p>
            Pour exercer ces droits, écrivez-nous à{" "}
            <a
              href="mailto:contact@moninvit.com"
              className="font-medium text-[#c17c74] underline underline-offset-2"
            >
              contact@moninvit.com
            </a>
            .
          </p>
        </Section>

        <Section title="7. Sécurité">
          <p>
            Les mots de passe sont chiffrés, les échanges se font en HTTPS et
            l'accès à vos données est restreint. Malgré nos efforts, aucun système
            n'est infaillible : en cas d'incident, nous vous notifierons rapidement.
          </p>
        </Section>

        <Section title="8. Cookies">
          <p>
            Nous utilisons uniquement les cookies techniques nécessaires au
            fonctionnement du site (session, préférences). Aucun cookie publicitaire.
          </p>
        </Section>

        <Section title="9. Enfants">
          <p>
            Le Service n'est pas destiné aux mineurs de moins de 16 ans. Nous ne
            collectons pas sciemment leurs données.
          </p>
        </Section>

        <Section title="10. Contact">
          <p>
            Une question sur vos données ? Écrivez-nous à{" "}
            <a
              href="mailto:contact@moninvit.com"
              className="font-medium text-[#c17c74] underline underline-offset-2"
            >
              contact@moninvit.com
            </a>
            . Nous répondons sous 5 jours ouvrés.
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
