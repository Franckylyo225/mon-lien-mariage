import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

import {
  body,
  brandName,
  brandTag,
  button,
  buttonWrap,
  container,
  divider,
  footer,
  footerBrand,
  h1,
  header,
  link,
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
          <Heading as="h1" style={brandName}>MonInvit.com</Heading>
          <Text style={brandTag}>Sécurité du compte</Text>
        </Section>

        <Section style={body}>
          <Heading as="h2" style={h1}>Nouveau mot de passe</Heading>
          <Text style={text}>
            Nous avons reçu une demande de réinitialisation de votre mot de
            passe. Cliquez sur le bouton ci-dessous pour en choisir un nouveau.
            Ce lien est valable pendant une heure.
          </Text>

          <Section style={buttonWrap}>
            <Button style={button} href={confirmationUrl}>
              Réinitialiser mon mot de passe
            </Button>
          </Section>

          <Text style={smallText}>
            Ou copiez ce lien dans votre navigateur :<br />
            <Link href={confirmationUrl} style={link}>{confirmationUrl}</Link>
          </Text>

          <Hr style={divider} />

          <Text style={smallText}>
            Vous n'avez pas demandé ce changement ? Ignorez cet email, votre mot
            de passe restera inchangé.
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
