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

interface EmailChangeEmailProps {
  siteName: string
  // oldEmail is the user's current address (HookData.OldEmail). For the
  // NEW-recipient half of a secure email_change fanout, `email` equals the
  // recipient (NEW), so the "from" line must render oldEmail.
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  oldEmail,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Confirmez votre nouvelle adresse email MonInvit.com</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img src={logoUrl} alt="MonInvit.com" style={logo} />
          <Text style={brandTag}>Changement d'email</Text>
        </Section>

        <Section style={body}>
          <Heading as="h2" style={h1}>Confirmez votre nouvelle adresse</Heading>
          <Text style={text}>
            Vous avez demandé à changer l'adresse email de votre compte
            MonInvit.com de <strong>{oldEmail}</strong> vers{' '}
            <strong>{newEmail}</strong>.
          </Text>

          <Section style={buttonWrap}>
            <Button href={confirmationUrl} style={button}>
              Confirmer le changement
            </Button>
          </Section>

          <Hr style={divider} />

          <Text style={smallText}>
            Si vous n'êtes pas à l'origine de cette demande, sécurisez votre
            compte immédiatement.
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

export default EmailChangeEmail
