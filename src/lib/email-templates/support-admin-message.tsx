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
  userEmail?: string
  userName?: string
  isNewTicket?: boolean
}

const SupportAdminMessageEmail = ({
  subject = '',
  message = '',
  userEmail = '',
  userName = '',
  isNewTicket = false,
}: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>{isNewTicket ? 'Nouveau ticket support' : 'Nouveau message support'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img src={logoUrl} alt="MonInvit.com" style={logo} />
          <Text style={brandTag}>Notification administrateur</Text>
        </Section>

        <Section style={bodyStyle}>
          <Heading as="h2" style={h1}>
            {isNewTicket ? 'Nouveau ticket support' : 'Nouveau message support'}
          </Heading>
          <Text style={text}>
            {userName || userEmail || 'Un utilisateur'} vient d'envoyer un message
            {subject ? ` — « ${subject} »` : ''}.
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

          {userEmail ? (
            <Text style={{ ...smallText, margin: '0 0 12px' }}>
              <strong>Email :</strong> {userEmail}
            </Text>
          ) : null}

          <Section style={buttonWrap}>
            <Button href="https://moninvit.com/admin/support" style={button}>
              Ouvrir le ticket
            </Button>
          </Section>
        </Section>

        <Section style={footer}>
          <Text style={footerBrand}>MonInvit.com</Text>
          <Text style={{ margin: 0 }}>Notification interne — console support.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: SupportAdminMessageEmail,
  subject: (data: Record<string, any>) =>
    data?.['subject']
      ? `[Support] ${data['isNewTicket'] ? 'Nouveau ticket' : 'Nouveau message'} — ${data['subject']}`
      : '[Support] Nouveau message',
  displayName: 'Support — message client (admin)',
  previewData: {
    subject: 'Problème de paiement',
    message: "Bonjour, je n'arrive pas à publier ma page après paiement.",
    userEmail: 'awa@example.com',
    userName: 'Awa Koné',
    isNewTicket: true,
  },
} satisfies TemplateEntry

export default SupportAdminMessageEmail
