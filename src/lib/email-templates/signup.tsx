import * as React from 'react'

import {
  Body,
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
  token: string
}

const codeBox: React.CSSProperties = {
  margin: '0 auto',
  padding: '14px 20px',
  borderRadius: '14px',
  border: '1px solid #F1E3C6',
  backgroundColor: '#FBF8F8',
  fontSize: '28px',
  letterSpacing: '8px',
  fontWeight: 700,
  color: '#201A1C',
  textAlign: 'center',
}

export const SignupEmail = ({ token }: SignupEmailProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Votre code de confirmation MonInvit.com</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img src={logoUrl} alt="MonInvit.com" style={logo} />
          <Text style={brandTag}>Bienvenue</Text>
        </Section>

        <Section style={body}>
          <Heading as="h2" style={h1}>Votre code de confirmation</Heading>
          <Text style={text}>
            Merci d'avoir créé votre compte MonInvit.com. Saisissez ce code sur
            la page de confirmation (moninvit.com/verify-email) pour activer
            votre compte :
          </Text>

          <Text style={codeBox}>{token}</Text>

          <Text style={smallText}>
            Ce code est valable pendant une heure et ne doit être partagé avec
            personne.
          </Text>

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
