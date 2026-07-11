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

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({ siteUrl, confirmationUrl }: InviteEmailProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Vous êtes invité(e) à rejoindre MonInvit.com</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading as="h1" style={brandName}>MonInvit.com</Heading>
          <Text style={brandTag}>Vous avez une invitation</Text>
        </Section>

        <Section style={body}>
          <Heading as="h2" style={h1}>On vous invite à nous rejoindre</Heading>
          <Text style={text}>
            Vous avez été invité(e) à rejoindre{' '}
            <Link href={siteUrl} style={link}><strong>MonInvit.com</strong></Link>{' '}
            pour co-créer une page d'invitation. Cliquez sur le bouton
            ci-dessous pour accepter et créer votre compte.
          </Text>

          <Section style={buttonWrap}>
            <Button style={button} href={confirmationUrl}>
              Accepter l'invitation
            </Button>
          </Section>

          <Text style={smallText}>
            Ou copiez ce lien dans votre navigateur :<br />
            <Link href={confirmationUrl} style={link}>{confirmationUrl}</Link>
          </Text>

          <Hr style={divider} />

          <Text style={smallText}>
            Vous n'attendiez pas cette invitation ? Vous pouvez ignorer cet
            email en toute sécurité.
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
