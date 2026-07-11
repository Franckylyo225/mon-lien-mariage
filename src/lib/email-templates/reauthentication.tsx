import * as React from 'react'

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

import {
  body,
  brandName,
  brandTag,
  codeBox,
  container,
  divider,
  footer,
  footerBrand,
  h1,
  header,
  main,
  smallText,
  text,
} from './_brand'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Votre code de vérification MonInvit.com</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading as="h1" style={brandName}>MonInvit.com</Heading>
          <Text style={brandTag}>Vérification d'identité</Text>
        </Section>

        <Section style={body}>
          <Heading as="h2" style={h1}>Votre code de sécurité</Heading>
          <Text style={text}>
            Utilisez le code ci-dessous pour confirmer votre identité. Il
            expirera dans quelques minutes.
          </Text>

          <Text style={codeBox}>{token}</Text>

          <Hr style={divider} />

          <Text style={smallText}>
            Vous n'êtes pas à l'origine de cette demande ? Ignorez cet email et
            envisagez de changer votre mot de passe.
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

export default ReauthenticationEmail
