import * as React from "react";
import { Heading, Hr, Section, Text } from "@react-email/components";
import { EmailButton, EmailLayout } from "./_layout";
import { codeBox, divider, h1, panel, smallText, text } from "./_brand";

interface RecoveryEmailProps {
  siteName: string;
  confirmationUrl: string;
  token?: string;
}

export const RecoveryEmail = ({ confirmationUrl, token }: RecoveryEmailProps) => (
  <EmailLayout preview="Réinitialisez votre mot de passe MonInvit.com" eyebrow="Sécurité du compte">
    <Heading as="h1" style={h1}>
      Réinitialiser votre mot de passe
    </Heading>
    <Text style={text}>
      Nous avons reçu une demande de réinitialisation de votre mot de passe. Cliquez sur le bouton
      ci-dessous pour en choisir un nouveau.
    </Text>

    <EmailButton href={confirmationUrl}>Choisir un nouveau mot de passe</EmailButton>

    {token ? (
      <>
        <Text style={smallText}>
          Le bouton ne fonctionne pas ? Rendez-vous sur moninvit.com/reset-password et saisissez ce
          code :
        </Text>
        <Section style={panel}>
          <Text style={codeBox}>{token}</Text>
        </Section>
      </>
    ) : null}

    <Hr style={divider} />

    <Text style={smallText}>
      Si vous n'êtes pas à l'origine de cette demande, ignorez cet email : votre mot de passe
      restera inchangé.
    </Text>
  </EmailLayout>
);

export default RecoveryEmail;
