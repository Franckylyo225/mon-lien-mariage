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

interface AdminNewUserProps {
  userEmail?: string
  userName?: string
  signedUpAt?: string
  totalUsers?: number
}

const AdminNewUserEmail = ({
  userEmail = 'nouvel.utilisateur@example.com',
  userName = '',
  signedUpAt = '',
  totalUsers,
}: AdminNewUserProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Nouvelle inscription sur MonInvit.com</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img src={logoUrl} alt="MonInvit.com" style={logo} />
          <Text style={brandTag}>Notification administrateur</Text>
        </Section>

        <Section style={bodyStyle}>
          <Heading as="h2" style={h1}>Nouvelle inscription</Heading>
          <Text style={text}>
            Un nouvel utilisateur vient de créer un compte sur MonInvit.com.
          </Text>

          <Section
            style={{
              backgroundColor: brand.accentBg,
              border: `1px solid ${brand.softBorder}`,
              borderRadius: '12px',
              padding: '16px 20px',
              margin: '0 0 20px',
            }}
          >
            {userName ? (
              <Text style={{ ...smallText, margin: '0 0 6px' }}>
                <strong>Nom :</strong> {userName}
              </Text>
            ) : null}
            <Text style={{ ...smallText, margin: '0 0 6px' }}>
              <strong>Email :</strong> {userEmail}
            </Text>
            {signedUpAt ? (
              <Text style={{ ...smallText, margin: 0 }}>
                <strong>Inscrit le :</strong> {signedUpAt}
              </Text>
            ) : null}
            {typeof totalUsers === 'number' ? (
              <Text style={{ ...smallText, margin: '6px 0 0' }}>
                <strong>Total comptes :</strong> {totalUsers}
              </Text>
            ) : null}
          </Section>

          <Section style={buttonWrap}>
            <Button href="https://moninvit.com/admin/users" style={button}>
              Voir dans l'admin
            </Button>
          </Section>
        </Section>

        <Section style={footer}>
          <Text style={footerBrand}>MonInvit.com</Text>
          <Text style={{ margin: 0 }}>Notification interne — tableau de bord administrateur.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AdminNewUserEmail,
  subject: 'Nouvelle inscription sur MonInvit.com',
  displayName: 'Admin — nouvelle inscription',
  previewData: {
    userEmail: 'awa@example.com',
    userName: 'Awa Koné',
    signedUpAt: '26/08/2026 14:30',
    totalUsers: 128,
  },
} satisfies TemplateEntry

export default AdminNewUserEmail
