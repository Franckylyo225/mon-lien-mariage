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

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({ confirmationUrl }: InviteEmailProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Vous êtes invité à rejoindre MonInvit.com</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img src={logoUrl} alt="MonInvit.com" style={logo} />
          <Text style={brandTag}>Invitation</Text>
        </Section>

        <Section style={body}>
          <Heading as="h2" style={h1}>Vous êtes invité</Heading>
          <Text style={text}>
            Vous avez été invité à rejoindre MonInvit.com. Cliquez sur le bouton
            ci-dessous pour accepter l'invitation et créer votre compte.
          </Text>

          <Section style={buttonWrap}>
            <Button href={confirmationUrl} style={button}>
              Accepter l'invitation
            </Button>
          </Section>

          <Hr style={divider} />

          <Text style={smallText}>
            Si vous n'attendiez pas cette invitation, ignorez cet email.
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

export default InviteEmail
