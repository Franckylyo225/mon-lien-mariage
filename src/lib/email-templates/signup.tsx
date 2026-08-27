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

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({ confirmationUrl }: SignupEmailProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Confirmez votre adresse email MonInvit.com</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img src={logoUrl} alt="MonInvit.com" style={logo} />
          <Text style={brandTag}>Bienvenue</Text>
        </Section>

        <Section style={body}>
          <Heading as="h2" style={h1}>Confirmez votre email</Heading>
          <Text style={text}>
            Merci d'avoir créé votre compte MonInvit.com. Confirmez votre adresse
            email pour commencer à préparer votre plus beau jour.
          </Text>

          <Section style={buttonWrap}>
            <Button href={confirmationUrl} style={button}>
              Confirmer mon email
            </Button>
          </Section>

          <Hr style={divider} />

          <Text style={smallText}>
            Vous n'êtes pas à l'origine de cette inscription ? Vous pouvez
            ignorer cet email en toute sécurité.
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

export default SignupEmail
