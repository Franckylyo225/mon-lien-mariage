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

interface EmailChangeEmailProps {
  siteName: string
  // oldEmail is the user's current address (HookData.OldEmail). For the
  // NEW-recipient half of a secure email_change fanout, `email` equals the
  // recipient (NEW), so the "from" line must render oldEmail to read
  // "from OLD to NEW" instead of "from NEW to NEW".
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
          <Heading as="h1" style={brandName}>MonInvit.com</Heading>
          <Text style={brandTag}>Changement d'adresse</Text>
        </Section>

        <Section style={body}>
          <Heading as="h2" style={h1}>Confirmer votre nouvel email</Heading>
          <Text style={text}>
            Vous avez demandé à changer l'adresse email de votre compte
            MonInvit.com :<br />
            de{' '}
            <Link href={`mailto:${oldEmail}`} style={link}>{oldEmail}</Link>{' '}
            vers{' '}
            <Link href={`mailto:${newEmail}`} style={link}>{newEmail}</Link>.
          </Text>

          <Section style={buttonWrap}>
            <Button style={button} href={confirmationUrl}>
              Confirmer le changement
            </Button>
          </Section>

          <Text style={smallText}>
            Ou copiez ce lien dans votre navigateur :<br />
            <Link href={confirmationUrl} style={link}>{confirmationUrl}</Link>
          </Text>

          <Hr style={divider} />

          <Text style={smallText}>
            Vous n'avez pas demandé ce changement ? Sécurisez votre compte dès
            maintenant en changeant votre mot de passe.
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
