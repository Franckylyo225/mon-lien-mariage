import * as React from "react";
import { Heading, Hr, Section, Text } from "@react-email/components";
import { EmailLayout } from "./_layout";
import { codeBox, divider, h1, panel, smallText, text } from "./_brand";

interface SignupEmailProps {
  siteName: string;
  siteUrl: string;
  recipient: string;
  token: string;
}

export const SignupEmail = ({ token }: SignupEmailProps) => (
  <EmailLayout preview="Votre code de confirmation MonInvit.com" eyebrow="Bienvenue">
    <Heading as="h1" style={h1}>
      Votre code de confirmation
    </Heading>
    <Text style={text}>
      Merci d'avoir créé votre compte MonInvit.com. Saisissez ce code sur la page de confirmation
      (moninvit.com/verify-email) pour activer votre compte :
    </Text>

    <Section style={panel}>
      <Text style={codeBox}>{token}</Text>
    </Section>

    <Text style={smallText}>
      Ce code est valable pendant une heure et ne doit être partagé avec personne.
    </Text>

    <Hr style={divider} />

    <Text style={smallText}>
      Vous n'êtes pas à l'origine de cette inscription ? Vous pouvez ignorer cet email en toute
      sécurité.
    </Text>
  </EmailLayout>
);

export default SignupEmail;
