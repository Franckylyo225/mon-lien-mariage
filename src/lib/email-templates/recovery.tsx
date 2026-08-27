import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components'

import {
  body,
  brandTag,
  button,
  buttonWrap,
  container,
  divider,
  footer,
  footerBrand,
  h1,
  header,
  logo,
  logoUrl,
  main,
  smallText,
  text,
} from './_brand'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({ confirmationUrl }: RecoveryEmailProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Réinitialisez votre mot de passe MonInvit.com</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img src={logoUrl} alt="MonInvit.com" style={logo} />
          <Text style={brandTag}>Sécurité du compte</Text>
        </Section>

        <Section style={body}>
          <Heading as="h2" style={h1}>Réinitialiser votre mot de passe</Heading>
          <Text style={text}>
            Nous avons reçu une demande de réinitialisation de votre mot de
            passe. Cliquez sur le bouton ci-dessous pour en choisir un nouveau.
          </Text>

          <Section style={buttonWrap}>
            <Button href={confirmationUrl} style={button}>
              Choisir un nouveau mot de passe
            </Button>
          </Section>

          <Hr style={divider} />

          <Text style={smallText}>
            Si vous n'êtes pas à l'origine de cette demande, ignorez cet email :
            votre mot de passe restera inchangé.
          </Text>
        </Section>

        <Section style={footer}>
          <Text style={footerBrand}>MonInvit.com</Text>
          <Text style={{ margin: 0 }}>Vos mariages, vos invitations.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail
