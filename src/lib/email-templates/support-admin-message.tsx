import * as React from "react";
import { Heading, Section, Text } from "@react-email/components";
import type { TemplateEntry } from "./registry";
import { EmailButton, EmailLayout } from "./_layout";
import { h1, panel, smallText, text } from "./_brand";

interface Props {
  subject?: string;
  message?: string;
  userEmail?: string;
  userName?: string;
  isNewTicket?: boolean;
}

const quote: React.CSSProperties = { ...smallText, margin: 0, whiteSpace: "pre-wrap" };

const SupportAdminMessageEmail = ({
  subject = "",
  message = "",
  userEmail = "",
  userName = "",
  isNewTicket = false,
}: Props) => (
  <EmailLayout
    preview={isNewTicket ? "Nouveau ticket support" : "Nouveau message support"}
    eyebrow="Notification administrateur"
  >
    <Heading as="h1" style={h1}>
      {isNewTicket ? "Nouveau ticket support" : "Nouveau message support"}
    </Heading>
    <Text style={text}>
      {userName || userEmail || "Un utilisateur"} vient d'envoyer un message
      {subject ? ` — « ${subject} »` : ""}.
    </Text>

    <Section style={panel}>
      <Text style={quote}>{message}</Text>
    </Section>

    {userEmail ? (
      <Text style={{ ...smallText, margin: "0 0 12px" }}>
        <strong>Email :</strong> {userEmail}
      </Text>
    ) : null}

    <EmailButton href="https://moninvit.com/admin/support">Ouvrir le ticket</EmailButton>
  </EmailLayout>
);

export const template = {
  component: SupportAdminMessageEmail,
  subject: (data: Record<string, any>) =>
    data?.["subject"]
      ? `[Support] ${data["isNewTicket"] ? "Nouveau ticket" : "Nouveau message"} — ${data["subject"]}`
      : "[Support] Nouveau message",
  displayName: "Support — message client (admin)",
  previewData: {
    subject: "Problème de paiement",
    message: "Bonjour, je n'arrive pas à publier ma page après paiement.",
    userEmail: "awa@example.com",
    userName: "Awa Koné",
    isNewTicket: true,
  },
} satisfies TemplateEntry;

export default SupportAdminMessageEmail;
