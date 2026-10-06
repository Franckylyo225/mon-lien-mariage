import * as React from "react";
import { Heading, Hr, Text } from "@react-email/components";
import { EmailButton, EmailLayout } from "./_layout";
import { divider, h1, smallText, text } from "./_brand";

interface InviteEmailProps {
  siteName: string;
  siteUrl: string;
  confirmationUrl: string;
}

export const InviteEmail = ({ confirmationUrl }: InviteEmailProps) => (
  <EmailLayout preview="Vous êtes invité à rejoindre MonInvit.com" eyebrow="Invitation">
    <Heading as="h1" style={h1}>
      Vous êtes invité
    </Heading>
    <Text style={text}>
      Vous avez été invité à rejoindre MonInvit.com. Cliquez sur le bouton ci-dessous pour accepter
      l'invitation et créer votre compte.
    </Text>

    <EmailButton href={confirmationUrl}>Accepter l'invitation</EmailButton>

    <Hr style={divider} />

    <Text style={smallText}>Si vous n'attendiez pas cette invitation, ignorez cet email.</Text>
  </EmailLayout>
);

export default InviteEmail;
