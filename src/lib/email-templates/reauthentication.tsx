import * as React from "react";
import { Heading, Hr, Section, Text } from "@react-email/components";
import { EmailLayout } from "./_layout";
import { codeBox, divider, h1, panel, smallText, text } from "./_brand";

interface ReauthenticationEmailProps {
  token: string;
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <EmailLayout preview="Votre code de vérification MonInvit.com" eyebrow="Vérification d'identité">
    <Heading as="h1" style={h1}>
      Votre code de sécurité
    </Heading>
    <Text style={text}>
      Utilisez le code ci-dessous pour confirmer votre identité. Il expirera dans quelques minutes.
    </Text>

    <Section style={panel}>
      <Text style={codeBox}>{token}</Text>
    </Section>

    <Hr style={divider} />

    <Text style={smallText}>
      Vous n'êtes pas à l'origine de cette demande ? Ignorez cet email et envisagez de changer votre
      mot de passe.
    </Text>
  </EmailLayout>
);

export default ReauthenticationEmail;
