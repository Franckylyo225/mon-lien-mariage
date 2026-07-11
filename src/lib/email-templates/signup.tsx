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

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Confirmez votre adresse email pour activer MonInvit.com</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading as="h1" style={brandName}>MonInvit.com</Heading>
          <Text style={brandTag}>Invitations de mariage</Text>
        </Section>

        <Section style={body}>
          <Heading as="h2" style={h1}>Bienvenue parmi nous</Heading>
          <Text style={text}>
            Merci de rejoindre <strong>MonInvit.com</strong>. Confirmez votre
            adresse{' '}
            <Link href={`mailto:${recipient}`} style={link}>
              {recipient}
            </Link>{' '}
            pour commencer à créer votre page d'invitation.
          </Text>

          <Section style={buttonWrap}>
            <Button style={button} href={confirmationUrl}>
              Confirmer mon email
            </Button>
          </Section>

          <Text style={smallText}>
            Ou copiez ce lien dans votre navigateur :<br />
            <Link href={confirmationUrl} style={link}>{confirmationUrl}</Link>
          </Text>

          <Hr style={divider} />

          <Text style={smallText}>
            Vous n'êtes pas à l'origine de cette inscription ? Ignorez
            simplement cet email, aucun compte ne sera créé.
          </Text>
        </Section>

        <Section style={footer}>
          <Text style={footerBrand}>MonInvit.com</Text>
          <Text style={{ margin: 0 }}>
            <Link href={siteUrl} style={{ color: '#6B6B6B', textDecoration: 'none' }}>
              moninvit.com
            </Link>
            {' · '}
            Vos mariages, vos invitations.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail
