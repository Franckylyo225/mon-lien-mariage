import * as React from "react";
import { Heading, Hr, Text } from "@react-email/components";
import { EmailButton, EmailLayout } from "./_layout";
import { divider, h1, smallText, text } from "./_brand";

interface MagicLinkEmailProps {
  siteName: string;
  confirmationUrl: string;
}

export const MagicLinkEmail = ({ confirmationUrl }: MagicLinkEmailProps) => (
  <EmailLayout preview="Votre lien de connexion MonInvit.com" eyebrow="Connexion">
    <Heading as="h1" style={h1}>
      Votre lien de connexion
    </Heading>
    <Text style={text}>
      Cliquez sur le bouton ci-dessous pour vous connecter à votre espace MonInvit.com. Ce lien
      expirera dans quelques minutes.
    </Text>

    <EmailButton href={confirmationUrl}>Se connecter</EmailButton>

    <Hr style={divider} />

    <Text style={smallText}>Vous n'avez pas demandé ce lien ? Ignorez cet email.</Text>
  </EmailLayout>
);

export default MagicLinkEmail;
