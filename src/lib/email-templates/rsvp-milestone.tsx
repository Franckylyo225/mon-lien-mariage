import * as React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'
import {
  brand,
  body as bodyStyle,
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
  main,
  smallText,
  text,
} from './_brand'

interface Props {
  milestone?: number
  coupleLabel?: string
  slug?: string
}

const MILESTONE_MESSAGES: Record<number, string> = {
  1: "La toute première confirmation vient d'arriver — l'aventure commence !",
  5: 'Cinq personnes ont déjà confirmé leur présence. Ça prend forme !',
  10: 'Dix confirmations : votre événement fait déjà parler de lui.',
  25: '25 confirmations : le cercle proche se dessine.',
  50: '50 invités confirmés. Un beau chiffre, une belle énergie.',
  100: 'Cap des 100 franchi ! Votre événement s\'annonce inoubliable.',
  200: '200 confirmations : une célébration mémorable en vue.',
  500: '500 invités confirmés — un rassemblement d\'exception.',
  1000: '1000 confirmations. Un événement à couper le souffle.',
  2000: 'Plus de 2000 personnes ont dit oui. Historique.',
}

const Email = ({ milestone = 10, coupleLabel = '', slug = '' }: Props) => {
  const message =
    MILESTONE_MESSAGES[milestone] ??
    `Vous avez atteint ${milestone} confirmations de présence.`

  const dashboardUrl = 'https://moninvit.com/dashboard/guests'
  const publicUrl = slug ? `https://moninvit.com/e/${slug}` : dashboardUrl
  const heading = coupleLabel
    ? `Bravo ${coupleLabel} !`
    : 'Félicitations !'

  return (
    <Html lang="fr" dir="ltr">
      <Head />
      <Preview>{`🎉 ${milestone} confirmations RSVP — ${message}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading as="h1" style={brandName}>
              {brand.name}
            </Heading>
            <Text style={brandTag}>Palier RSVP atteint</Text>
          </Section>

          <Section style={bodyStyle}>
            <Heading as="h2" style={h1}>
              {heading}
            </Heading>
            <Text style={text}>
              Vous venez d'atteindre <strong style={{ color: brand.primary }}>{milestone} confirmation{milestone > 1 ? 's' : ''}</strong> de présence sur votre événement.
            </Text>
            <Text style={text}>{message}</Text>

            <Section style={buttonWrap}>
              <Button href={dashboardUrl} style={button}>
                Voir mes invités
              </Button>
            </Section>

            <hr style={divider} />
            <Text style={smallText}>
              Vous pouvez partager à nouveau votre invitation pour continuer à collecter des réponses :{' '}
              <a href={publicUrl} style={{ color: brand.primary }}>
                {publicUrl.replace('https://', '')}
              </a>
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerBrand}>MonInvit.com</Text>
            <Text style={{ margin: 0 }}>
              Le suivi RSVP simple et élégant pour vos événements.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `🎉 ${data?.milestone ?? 10} confirmations RSVP !`,
  displayName: 'Palier RSVP atteint',
  previewData: { milestone: 50, coupleLabel: 'Amina & Kwame', slug: 'amina-kwame' },
} satisfies TemplateEntry
