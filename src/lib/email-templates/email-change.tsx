import * as React from "react";
import { Heading, Hr, Text } from "@react-email/components";
import { EmailButton, EmailLayout } from "./_layout";
import { divider, h1, smallText, text } from "./_brand";

interface EmailChangeEmailProps {
  siteName: string;
  // oldEmail is the user's current address (HookData.OldEmail). For the
  // NEW-recipient half of a secure email_change fanout, `email` equals the
  // recipient (NEW), so the "from" line must render oldEmail.
  oldEmail: string;
  email: string;
  newEmail: string;
  confirmationUrl: string;
}

export const EmailChangeEmail = ({
  oldEmail,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <EmailLayout
    preview="Confirmez votre nouvelle adresse email MonInvit.com"
    eyebrow="Changement d'email"
  >
    <Heading as="h1" style={h1}>
      Confirmez votre nouvelle adresse
    </Heading>
    <Text style={text}>
      Vous avez demandé à changer l'adresse email de votre compte MonInvit.com de{" "}
      <strong>{oldEmail}</strong> vers <strong>{newEmail}</strong>.
    </Text>

    <EmailButton href={confirmationUrl}>Confirmer le changement</EmailButton>

    <Hr style={divider} />

    <Text style={smallText}>
      Si vous n'êtes pas à l'origine de cette demande, sécurisez votre compte immédiatement.
    </Text>
  </EmailLayout>
);

export default EmailChangeEmail;
