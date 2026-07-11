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

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({ confirmationUrl }: MagicLinkEmailProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Votre lien de connexion MonInvit.com</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading as="h1" style={brandName}>MonInvit.com</Heading>
          <Text style={brandTag}>Connexion sécurisée</Text>
        </Section>

        <Section style={body}>
          <Heading as="h2" style={h1}>Votre lien magique</Heading>
          <Text style={text}>
            Cliquez sur le bouton ci-dessous pour vous connecter à votre espace
            MonInvit.com. Ce lien expirera dans quelques minutes.
          </Text>

          <Section style={buttonWrap}>
            <Button style={button} href={confirmationUrl}>
              Me connecter
            </Button>
          </Section>

          <Text style={smallText}>
            Ou copiez ce lien dans votre navigateur :<br />
            <Link href={confirmationUrl} style={link}>{confirmationUrl}</Link>
          </Text>

          <Hr style={divider} />

          <Text style={smallText}>
            Vous n'avez pas demandé ce lien ? Ignorez cet email en toute
            sécurité.
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

export default MagicLinkEmail
