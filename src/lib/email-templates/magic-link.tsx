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
          <Img src={logoUrl} alt="MonInvit.com" style={logo} />
          <Text style={brandTag}>Connexion</Text>
        </Section>

        <Section style={body}>
          <Heading as="h2" style={h1}>Votre lien de connexion</Heading>
          <Text style={text}>
            Cliquez sur le bouton ci-dessous pour vous connecter à votre espace
            MonInvit.com. Ce lien expirera dans quelques minutes.
          </Text>

          <Section style={buttonWrap}>
            <Button href={confirmationUrl} style={button}>
              Se connecter
            </Button>
          </Section>

          <Hr style={divider} />

          <Text style={smallText}>
            Vous n'avez pas demandé ce lien ? Ignorez cet email.
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
