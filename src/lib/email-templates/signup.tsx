import * as React from 'react'

import {
  Body,
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
  codeBox,
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
  token?: string
}

export const SignupEmail = ({
  siteUrl,
  recipient,
  token,
}: SignupEmailProps) => {
  const verifyUrl = `https://moninvit.com/verify-email?email=${encodeURIComponent(recipient)}`
  return (
    <Html lang="fr" dir="ltr">
      <Head />
      <Preview>Votre code de confirmation MonInvit.com</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading as="h1" style={brandName}>MonInvit.com</Heading>
            <Text style={brandTag}>Invitations de mariage</Text>
          </Section>

          <Section style={body}>
            <Heading as="h2" style={h1}>Bienvenue parmi nous</Heading>
            <Text style={text}>
              Merci de rejoindre <strong>MonInvit.com</strong>. Pour activer
              votre compte <Link href={`mailto:${recipient}`} style={link}>{recipient}</Link>,
              saisissez ce code sur la page de confirmation :
            </Text>

            <Text style={codeBox}>{token ?? '------'}</Text>

            <Text style={smallText}>
              Rendez-vous sur{' '}
              <Link href={verifyUrl} style={link}>{verifyUrl}</Link>
              {' '}pour saisir votre code. Il expire dans 1 heure.
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
}

export default SignupEmail
