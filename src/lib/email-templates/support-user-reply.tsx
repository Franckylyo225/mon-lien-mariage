import * as React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'
import {
  brand,
  body as bodyStyle,
  brandTag,
  button,
  buttonWrap,
  container,
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

interface Props {
  subject?: string
  message?: string
  firstName?: string
}

const SupportUserReplyEmail = ({ subject = '', message = '', firstName = '' }: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Le support MonInvit a répondu à votre message</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img src={logoUrl} alt="MonInvit.com" style={logo} />
          <Text style={brandTag}>Support</Text>
        </Section>

        <Section style={bodyStyle}>
          <Heading as="h2" style={h1}>Nouvelle réponse du support</Heading>
          <Text style={text}>
            {firstName ? `Bonjour ${firstName},` : 'Bonjour,'} notre équipe vient de répondre
            {subject ? ` à votre demande « ${subject} »` : ' à votre demande'}.
          </Text>

          <Section
            style={{
              backgroundColor: brand.accentBg,
              border: `1px solid ${brand.softBorder}`,
              borderRadius: '12px',
              padding: '16px 20px',
              margin: '0 0 20px',
              whiteSpace: 'pre-wrap' as const,
            }}
          >
            <Text style={{ ...smallText, margin: 0 }}>{message}</Text>
          </Section>

          <Section style={buttonWrap}>
            <Button href="https://moninvit.com/app/support" style={button}>
              Répondre dans l'application
            </Button>
          </Section>
        </Section>

        <Section style={footer}>
          <Text style={footerBrand}>MonInvit.com</Text>
          <Text style={{ margin: 0 }}>Vous recevez cet email suite à votre demande de support.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: SupportUserReplyEmail,
  subject: (data: Record<string, any>) =>
    data?.['subject'] ? `Réponse du support — ${data['subject']}` : 'Réponse du support MonInvit',
  displayName: 'Support — réponse au client',
  previewData: {
    subject: 'Problème de paiement',
    message: 'Bonjour, votre paiement a bien été enregistré. Votre page est active.',
    firstName: 'Awa',
  },
} satisfies TemplateEntry

export default SupportUserReplyEmail
