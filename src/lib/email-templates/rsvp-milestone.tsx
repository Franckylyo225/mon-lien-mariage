import * as React from "react";
import { Heading, Hr, Link, Section, Text } from "@react-email/components";
import type { TemplateEntry } from "./registry";
import { EmailButton, EmailLayout } from "./_layout";
import { brand, divider, fonts, h1, panel, smallText, text } from "./_brand";

interface Props {
  milestone?: number;
  coupleLabel?: string;
  slug?: string;
}

const MILESTONE_MESSAGES: Record<number, string> = {
  1: "La toute première confirmation vient d'arriver — l'aventure commence !",
  5: "Cinq personnes ont déjà confirmé leur présence. Ça prend forme !",
  10: "Dix confirmations : votre événement fait déjà parler de lui.",
  25: "25 confirmations : le cercle proche se dessine.",
  50: "50 invités confirmés. Un beau chiffre, une belle énergie.",
  100: "Cap des 100 franchi ! Votre événement s'annonce inoubliable.",
  200: "200 confirmations : une célébration mémorable en vue.",
  500: "500 invités confirmés — un rassemblement d'exception.",
  1000: "1000 confirmations. Un événement à couper le souffle.",
  2000: "Plus de 2000 personnes ont dit oui. Historique.",
};

/** The figure is the message, so it is set large inside the panel. */
const figure: React.CSSProperties = {
  fontFamily: fonts.serif,
  fontSize: "44px",
  lineHeight: "1.1",
  color: brand.primary,
  textAlign: "center",
  margin: "0 0 4px",
};

const figureLabel: React.CSSProperties = {
  fontSize: "12px",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: brand.muted,
  textAlign: "center",
  margin: 0,
};

const Email = ({ milestone = 10, coupleLabel = "", slug = "" }: Props) => {
  const message =
    MILESTONE_MESSAGES[milestone] ?? `Vous avez atteint ${milestone} confirmations de présence.`;

  const dashboardUrl = "https://moninvit.com/dashboard/guests";
  const publicUrl = slug ? `https://moninvit.com/e/${slug}` : dashboardUrl;
  const heading = coupleLabel ? `Bravo ${coupleLabel} !` : "Félicitations !";

  return (
    <EmailLayout
      preview={`${milestone} confirmations RSVP — ${message}`}
      eyebrow="Palier RSVP atteint"
    >
      <Heading as="h1" style={h1}>
        {heading}
      </Heading>

      <Section style={panel}>
        <Text style={figure}>{milestone}</Text>
        <Text style={figureLabel}>confirmation{milestone > 1 ? "s" : ""} de présence</Text>
      </Section>

      <Text style={text}>{message}</Text>

      <EmailButton href={dashboardUrl}>Voir mes invités</EmailButton>

      <Hr style={divider} />

      <Text style={smallText}>
        Partagez à nouveau votre invitation pour continuer à collecter des réponses :{" "}
        <Link href={publicUrl} style={{ color: brand.primary }}>
          {publicUrl.replace("https://", "")}
        </Link>
      </Text>
    </EmailLayout>
  );
};

export const template = {
  component: Email,
  subject: (data: Record<string, any>) => `${data?.milestone ?? 10} confirmations RSVP !`,
  displayName: "Palier RSVP atteint",
  previewData: { milestone: 50, coupleLabel: "Amina & Kwame", slug: "amina-kwame" },
} satisfies TemplateEntry;

export default Email;
