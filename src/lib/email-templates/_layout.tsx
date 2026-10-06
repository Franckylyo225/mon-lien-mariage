import * as React from "react";
import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { LEGAL_ENTITY } from "@/lib/legal-entity";
import {
  bandHeader,
  fonts,
  body as bodyStyle,
  brand,
  buttonCell,
  buttonLink,
  buttonWrap,
  container,
  eyebrow as eyebrowStyle,
  footer,
  footerBrand,
  footerText,
  logo,
  logoWhiteUrl,
  main,
} from "./_brand";

interface LayoutProps {
  /** Inbox preview line. Every email must set one. */
  preview: string;
  /** Small capital label naming the message: CONFIRMATION, RSVP, PUBLICATION… */
  eyebrow?: string;
  children: React.ReactNode;
}

/**
 * The single envelope every MonInvit email is rendered in — brand band,
 * body, footer. Templates supply their content and nothing else, so the
 * eleven of them can no longer drift apart.
 *
 * `renderAutomationShell` below is the string twin used by the automation
 * sender, which builds raw HTML from rows stored in the database.
 */
export function EmailLayout({ preview, eyebrow, children }: LayoutProps) {
  return (
    <Html lang="fr" dir="ltr">
      <Head>
        {/* Ask clients not to auto-invert: the design is light by intent. */}
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={bandHeader}>
            <Img src={logoWhiteUrl} alt={brand.name} width="200" style={logo} />
          </Section>

          <Section style={bodyStyle}>
            {eyebrow ? <Text style={eyebrowStyle}>{eyebrow}</Text> : null}
            {children}
          </Section>

          <Section style={footer}>
            <Text style={footerBrand}>{brand.tagline}</Text>
            <Text style={footerText}>
              <Link href="https://moninvit.com" style={{ color: brand.muted }}>
                moninvit.com
              </Link>
              {" · "}
              {LEGAL_ENTITY.name} {LEGAL_ENTITY.legalForm} · {LEGAL_ENTITY.address}
            </Text>
            <Text style={{ ...footerText, marginTop: "6px" }}>
              Vous recevez cet email parce que vous avez un compte MonInvit.com.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

/**
 * Bulletproof call to action. Outlook's Word engine drops border-radius and
 * mishandles padding on a bare <a>, so the colour lives on a table cell.
 */
export function EmailButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <table role="presentation" cellPadding={0} cellSpacing={0} style={buttonWrap}>
      <tbody>
        <tr>
          {/* bgcolor is the Outlook fallback; React's td typings omit it. */}
          <td
            align="center"
            style={buttonCell}
            {...({ bgcolor: brand.primary } as Record<string, string>)}
          >
            <a href={href} style={buttonLink}>
              {children}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * String twin of `EmailLayout`, for the automation sender: those emails are
 * assembled from HTML fragments stored in the database, so they cannot go
 * through React. Keeping both in this file is what stops the two chains from
 * drifting into two different brands again, which is exactly what happened
 * before — different width, border, fonts, ink and footer on each side.
 *
 * `contentHtml` is injected as-is; callers are responsible for escaping.
 */
export function renderShellHtml(opts: {
  contentHtml: string;
  eyebrow?: string;
  preheader?: string;
}): string {
  const { contentHtml, eyebrow = "", preheader = "" } = opts;
  const year = new Date().getFullYear();

  return `<!doctype html>
<html lang="fr"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="color-scheme" content="light"/>
<meta name="supported-color-schemes" content="light"/>
<style>
  body{margin:0;padding:32px 12px;background:${brand.pageBg};font-family:${fonts.sans}}
  .preheader{display:none;font-size:1px;color:${brand.pageBg};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden}
  .card{max-width:600px;margin:0 auto;background:#FFFFFF;border:1px solid ${brand.softBorder};border-radius:20px;overflow:hidden}
  .band{background:${brand.primary};border-bottom:2px solid ${brand.gold};padding:26px 32px;text-align:center}
  .band img{width:200px;height:auto;display:block;margin:0 auto}
  .content{padding:30px 32px 4px;font-family:${fonts.sans};font-size:16px;line-height:1.65;color:${brand.bodyInk}}
  .eyebrow{font-size:11px;font-weight:700;color:${brand.goldDeep};letter-spacing:.2em;text-transform:uppercase;margin:0 0 10px}
  .content h1{font-family:${fonts.serif};font-size:28px;font-weight:400;line-height:1.25;color:${brand.ink};margin:0 0 16px}
  .content p{margin:0 0 18px}
  .content a{color:${brand.primary}}
  .content .note{font-size:14px;color:${brand.muted};margin-top:4px}
  .content .box{background:${brand.panelBg};border:1px solid ${brand.softBorder};border-radius:14px;padding:20px 24px;margin:0 0 22px;font-size:15px;color:${brand.bodyInk}}
  .foot{padding:22px 32px 28px;text-align:center;border-top:1px solid ${brand.softBorder};font-family:${fonts.sans}}
  .foot .tag{font-size:11px;font-weight:700;color:${brand.goldDeep};letter-spacing:.2em;text-transform:uppercase;margin:0 0 8px}
  .foot p{font-size:12px;line-height:1.6;color:${brand.muted};margin:0}
</style></head>
<body>
<div class="preheader">${preheader}</div>
<div class="card">
  <div class="band"><img src="${logoWhiteUrl}" alt="${brand.name}" width="200"/></div>
  <div class="content">${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ""}${contentHtml}</div>
  <div class="foot">
    <p class="tag">${brand.tagline}</p>
    <p>moninvit.com · ${LEGAL_ENTITY.name} ${LEGAL_ENTITY.legalForm} · ${LEGAL_ENTITY.address}</p>
    <p style="margin-top:6px">Vous recevez cet email parce que vous avez un compte MonInvit.com. © ${year}</p>
  </div>
</div>
</body></html>`;
}
