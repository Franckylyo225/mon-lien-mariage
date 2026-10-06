import * as React from "react";
import { Heading, Section, Text } from "@react-email/components";
import type { TemplateEntry } from "./registry";
import { EmailButton, EmailLayout } from "./_layout";
import { h1, panel, smallText, text } from "./_brand";

interface Props {
  subject?: string;
  message?: string;
  firstName?: string;
}

/** The agent's words are quoted verbatim, so line breaks are preserved. */
const quote: React.CSSProperties = { ...smallText, margin: 0, whiteSpace: "pre-wrap" };

const SupportUserReplyEmail = ({ subject = "", message = "", firstName = "" }: Props) => (
  <EmailLayout preview="Le support MonInvit a répondu à votre message" eyebrow="Support">
    <Heading as="h1" style={h1}>
      Nouvelle réponse du support
    </Heading>
    <Text style={text}>
      {firstName ? `Bonjour ${firstName},` : "Bonjour,"} notre équipe vient de répondre
      {subject ? ` à votre demande « ${subject} »` : " à votre demande"}.
    </Text>

    <Section style={panel}>
      <Text style={quote}>{message}</Text>
    </Section>

    <EmailButton href="https://moninvit.com/app/support">Répondre dans l'application</EmailButton>
  </EmailLayout>
);

export const template = {
  component: SupportUserReplyEmail,
  subject: (data: Record<string, any>) =>
    data?.["subject"] ? `Réponse du support — ${data["subject"]}` : "Réponse du support MonInvit",
  displayName: "Support — réponse au client",
  previewData: {
    subject: "Problème de paiement",
    message: "Bonjour, votre paiement a bien été enregistré. Votre page est active.",
    firstName: "Awa",
  },
} satisfies TemplateEntry;

export default SupportUserReplyEmail;
