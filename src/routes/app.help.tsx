import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  IconArrowLeft,
  IconSearch,
  IconMessageCircle,
  IconHelpCircle,
  IconSparkles,
  IconShare,
  IconUsers,
  IconCreditCard,
  IconShieldLock,
  IconPhoto,
  IconMusic,
  IconDeviceMobile,
} from "@tabler/icons-react";

export const Route = createFileRoute("/app/help")({
  head: () => ({
    meta: [
      { title: "Aide & FAQ — MonInvit.com" },
      {
        name: "description",
        content:
          "Centre d'aide MonInvit : créez, personnalisez et publiez votre invitation de mariage en Afrique de l'Ouest.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HelpPage,
});

const CATEGORIES = [
  {
    key: "creation",
    label: "Création & édition",
    Icon: IconSparkles,
    faqs: [
      {
        q: "Comment créer mon invitation de mariage ?",
        a: "Depuis votre tableau de bord, cliquez sur « Nouvel événement », choisissez le type de cérémonie (mariage civil, coutumier, religieux, etc.), renseignez les noms des mariés, la date et le lieu. Vous accéderez ensuite à l'éditeur visuel pour personnaliser le texte, les couleurs, la photo de couple et le programme.",
      },
      {
        q: "Puis-je modifier le thème, les couleurs et la typographie ?",
        a: "Oui. Dans l'éditeur, ouvrez l'onglet « Thème » pour choisir un style, puis l'onglet « Couleurs » pour régler la couleur d'accent, la couleur de fond et la couleur secondaire. Toutes les modifications sont visibles en temps réel dans l'aperçu.",
      },
      {
        q: "Quelle taille et format d'image utiliser pour la photo de couple ?",
        a: "Nous recommandons une image au format JPEG ou PNG, en paysage (16:9 ou 4:3), et d'au moins 1200 px de large. Le système compresse automatiquement les fichiers pour un affichage rapide sur mobile.",
      },
      {
        q: "Comment ajouter ou supprimer un bloc (story, galerie, programme, musique) ?",
        a: "Chaque bloc est géré dans l'éditeur inline. Activez ou désactivez les sections, glissez-les pour réorganiser l'ordre d'affichage, et remplissez le contenu directement dans le panneau de configuration.",
      },
    ],
  },
  {
    key: "publication",
    label: "Publication & code promo",
    Icon: IconPhoto,
    faqs: [
      {
        q: "Comment publier mon invitation pour la rendre accessible aux invités ?",
        a: "Rendez-vous sur la page « Publier ». Une fois votre événement complété, appliquez un code promo valide (par exemple TIANA100 pour une publication 100 % gratuite en période de test) puis cliquez sur « Publier mon invitation ». Le lien public sera généré immédiatement.",
      },
      {
        q: "L'invitation reste-t-elle modifiable après publication ?",
        a: "Oui, vous pouvez continuer à modifier le contenu, les photos, le programme et les options. Les modifications sont appliquées en temps réel sur la page publique partagée avec vos invités.",
      },
      {
        q: "Que se passe-t-il si je repasse mon événement en brouillon ?",
        a: "Le lien public devient inaccessible tant que l'événement n'est pas republié. Les invités verront alors un message « Invitation introuvable ». Republiez à tout moment pour réactiver le lien.",
      },
    ],
  },
  {
    key: "partage",
    label: "Liens & partage",
    Icon: IconShare,
    faqs: [
      {
        q: "Comment partager mon invitation avec mes invités ?",
        a: "Après publication, copiez le lien public depuis la page « Partage ». Vous pouvez l'envoyer par WhatsApp, SMS, email ou réseaux sociaux. Les invités n'ont pas besoin de créer un compte pour confirmer leur présence.",
      },
      {
        q: "Puis-je personnaliser l'URL de mon invitation ?",
        a: "Le lien est généré automatiquement à partir d'un identifiant unique. Pour le moment, les URLs personnalisées ne sont pas disponibles. Nous travaillons à ajouter cette option prochainement.",
      },
      {
        q: "Comment connaître le nombre de personnes ayant vu mon invitation ?",
        a: "La page « Statistiques RSVP » affiche le nombre de vues, de confirmations, de refus et de réponses en attente, mis à jour en temps réel.",
      },
    ],
  },
  {
    key: "rsvp",
    label: "Invités & RSVP",
    Icon: IconUsers,
    faqs: [
      {
        q: "Comment ajouter des invités à ma liste ?",
        a: "Dans « Liste des invités », cliquez sur « Ajouter un invité » ou importez un fichier Excel. Vous pouvez renseigner le nom, le prénom, le numéro de téléphone (avec indicatif international), et le nombre de places attribuées.",
      },
      {
        q: "Les invités peuvent-ils confirmer leur présence en ligne ?",
        a: "Oui, depuis la page publique, chaque invité remplit un formulaire RSVP simple avec son nom, son numéro de téléphone et le nombre de personnes. Vous recevez une notification dans votre tableau de bord et les statistiques sont mises à jour instantanément.",
      },
      {
        q: "Comment exporter la liste des invités ?",
        a: "Depuis la page « Liste des invités », cliquez sur le bouton « Exporter Excel ». Le fichier contient les noms, statuts de présence, numéros de téléphone et les auto-inscriptions reçues via le formulaire public.",
      },
      {
        q: "Puis-je envoyer des rappels automatiques aux invités ?",
        a: "Les notifications et rappels par email sont configurés par étapes (milestones). Dès que vous atteignez certains seuils de confirmations, nous vous proposons d'envoyer des messages de relance aux invités non confirmés.",
      },
    ],
  },
  {
    key: "musique",
    label: "Musique & ambiance",
    Icon: IconMusic,
    faqs: [
      {
        q: "Comment ajouter une musique d'ambiance à ma page publique ?",
        a: "Dans l'éditeur, activez la section « Musique d'ambiance » et choisissez un morceau dans le catalogue. Les visiteurs peuvent lancer la lecture manuellement depuis la page publique.",
      },
      {
        q: "La musique se démarre-t-elle automatiquement sur mobile ?",
        a: "Pour respecter les règles des navigateurs mobiles, la lecture démarre uniquement après une interaction de l'utilisateur (appui sur le bouton lecture).",
      },
    ],
  },
  {
    key: "compte",
    label: "Compte & sécurité",
    Icon: IconShieldLock,
    faqs: [
      {
        q: "Comment confirmer mon adresse email ?",
        a: "Lors de l'inscription, un code à 6 chiffres est envoyé à votre adresse email. Saisissez-le sur la page de confirmation. Si vous ne le recevez pas, vérifiez vos spams ou cliquez sur « Renvoyer le code ».",
      },
      {
        q: "J'ai oublié mon mot de passe, comment le réinitialiser ?",
        a: "Sur la page de connexion, cliquez sur « Mot de passe oublié ». Vous recevrez un lien sécurisé par email pour définir un nouveau mot de passe. Le lien redirige vers moninvit.com.",
      },
      {
        q: "Comment modifier mon nom, prénom ou email ?",
        a: "Rendez-vous sur « Mon profil » dans le menu. Vous pouvez mettre à jour vos informations personnelles et gérer vos préférences de notification.",
      },
      {
        q: "Mon compte est-il sécurisé ?",
        a: "Oui, nous utilisons le chiffrement SSL, une authentification sécurisée, et des règles de sécurité au niveau de la base de données (RLS) pour protéger vos données et celles de vos invités.",
      },
    ],
  },
  {
    key: "paiement",
    label: "Paiement & facturation",
    Icon: IconCreditCard,
    faqs: [
      {
        q: "Quels sont les tarifs de MonInvit ?",
        a: "MonInvit propose différentes formules adaptées au marché ouest-africain. En période de test, la publication est gratuite via un code promo. Les options payantes (livre d'or digital, export PDF souvenir, etc.) seront activées progressivement.",
      },
      {
        q: "Comment obtenir une facture après paiement ?",
        a: "Après chaque paiement, un bouton « Télécharger la facture » est disponible dans la page « Paiement & facture ». Le PDF est généré au nom des mariés et peut être conservé pour vos comptes.",
      },
      {
        q: "Les paiements sont-ils sécurisés ?",
        a: "Les transactions sont traitées par des prestataires certifiés et conformes aux standards de sécurité. Nous ne stockons jamais les numéros de carte bancaire sur nos serveurs.",
      },
    ],
  },
  {
    key: "mobile",
    label: "Mobile & compatibilité",
    Icon: IconDeviceMobile,
    faqs: [
      {
        q: "MonInvit fonctionne-t-il sur Android et iPhone ?",
        a: "Oui, la page publique et le tableau de bord sont conçus pour être responsives et fonctionnent sur tous les navigateurs modernes, y compris Chrome, Safari, Samsung Internet et Opera Mini.",
      },
      {
        q: "Pourquoi certaines images ne s'affichent pas sur mon téléphone ?",
        a: "Les images trop lourdes peuvent poser problème sur les appareils à faible mémoire. Notre outil compresse automatiquement les photos. Si le problème persiste, vérifiez votre connexion internet ou réessayez avec une image plus légère.",
      },
    ],
  },
];

function HelpPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredCategories = useMemo(() => {
    return CATEGORIES.map((cat) => ({
      ...cat,
      faqs: cat.faqs.filter(
        (faq) =>
          faq.q.toLowerCase().includes(normalizedQuery) ||
          faq.a.toLowerCase().includes(normalizedQuery),
      ),
    })).filter(
      (cat) =>
        cat.faqs.length > 0 &&
        (activeCategory === null || activeCategory === cat.key),
    );
  }, [normalizedQuery, activeCategory]);

  const totalFaqs = useMemo(
    () => filteredCategories.reduce((sum, cat) => sum + cat.faqs.length, 0),
    [filteredCategories],
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 pb-24">
      <Link
        to="/dashboard"
        className="mb-5 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"
      >
        <IconArrowLeft size={14} /> Retour au tableau de bord
      </Link>

      <div className="mb-6">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-[11px] font-medium text-secondary-foreground">
          <IconHelpCircle size={14} /> Centre d'aide
        </div>
        <h1 className="font-serif text-2xl text-foreground">
          Aide & FAQ
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Retrouvez les réponses aux questions les plus fréquentes sur MonInvit.
        </p>
      </div>

      <div className="relative mb-6">
        <IconSearch
          size={18}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une question (ex. : publication, mot de passe, RSVP)…"
          className="w-full rounded-2xl border border-border bg-background py-3 pl-10 pr-4 text-[14px] shadow-sm transition focus-visible:border-primary focus-visible:outline-none"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground hover:text-foreground"
          >
            Effacer
          </button>
        )}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition ${
            activeCategory === null
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-background text-foreground hover:bg-secondary"
          }`}
        >
          Tout
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() =>
              setActiveCategory((prev) =>
                prev === cat.key ? null : cat.key,
              )
            }
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition ${
              activeCategory === cat.key
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-background text-foreground hover:bg-secondary"
            }`}
          >
            <cat.Icon size={14} strokeWidth={1.75} />
            {cat.label}
          </button>
        ))}
      </div>

      {normalizedQuery && (
        <p className="mb-4 text-[12px] text-muted-foreground">
          {totalFaqs} résultat{totalFaqs > 1 ? "s" : ""} pour « {query} »
        </p>
      )}

      <div className="space-y-6">
        {filteredCategories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center">
            <IconHelpCircle
              size={40}
              strokeWidth={1.5}
              className="mx-auto mb-3 text-muted-foreground"
            />
            <h2 className="mb-1 font-serif text-lg text-foreground">
              Aucune réponse trouvée
            </h2>
            <p className="mb-5 text-[13px] text-muted-foreground">
              Reformulez votre recherche ou contactez directement le support.
            </p>
            <Link
              to="/app/support"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground"
            >
              <IconMessageCircle size={16} />
              Contacter le support
            </Link>
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <section
              key={cat.key}
              className="rounded-2xl border border-border bg-background p-4 shadow-sm"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-full bg-secondary text-secondary-foreground">
                  <cat.Icon size={18} strokeWidth={1.75} />
                </span>
                <h2 className="font-serif text-base text-foreground">
                  {cat.label}
                </h2>
              </div>
              <Accordion type="multiple" className="w-full">
                {cat.faqs.map((faq, index) => (
                  <AccordionItem
                    key={`${cat.key}-${index}`}
                    value={`${cat.key}-${index}`}
                  >
                    <AccordionTrigger className="text-[14px] font-medium text-foreground">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-[13px] leading-relaxed text-muted-foreground">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))
        )}
      </div>

      <div className="mt-8 rounded-2xl bg-primary p-5 text-primary-foreground">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-serif text-base">Vous ne trouvez pas de réponse ?</h3>
            <p className="mt-1 text-[13px] opacity-90">
              Notre équipe vous répond sous 24h ouvrées.
            </p>
          </div>
          <Link
            to="/app/support"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-foreground px-4 py-2 text-[13px] font-medium text-primary"
          >
            <IconMessageCircle size={16} />
            Ouvrir un ticket
          </Link>
        </div>
      </div>
    </div>
  );
}
