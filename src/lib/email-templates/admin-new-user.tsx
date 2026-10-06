import * as React from "react";
import { Heading, Section, Text } from "@react-email/components";
import type { TemplateEntry } from "./registry";
import { EmailButton, EmailLayout } from "./_layout";
import { h1, panel, smallText, text } from "./_brand";

interface AdminNewUserProps {
  userEmail?: string;
  userName?: string;
  signedUpAt?: string;
  totalUsers?: number;
}

const row: React.CSSProperties = { ...smallText, margin: "0 0 6px" };

const AdminNewUserEmail = ({
  userEmail = "nouvel.utilisateur@example.com",
  userName = "",
  signedUpAt = "",
  totalUsers,
}: AdminNewUserProps) => (
  <EmailLayout
    preview="Nouvelle inscription sur MonInvit.com"
    eyebrow="Notification administrateur"
  >
    <Heading as="h1" style={h1}>
      Nouvelle inscription
    </Heading>
    <Text style={text}>Un nouvel utilisateur vient de créer un compte sur MonInvit.com.</Text>

    <Section style={panel}>
      {userName ? (
        <Text style={row}>
          <strong>Nom :</strong> {userName}
        </Text>
      ) : null}
      <Text style={row}>
        <strong>Email :</strong> {userEmail}
      </Text>
      {signedUpAt ? (
        <Text style={{ ...row, margin: 0 }}>
          <strong>Inscrit le :</strong> {signedUpAt}
        </Text>
      ) : null}
      {typeof totalUsers === "number" ? (
        <Text style={{ ...row, margin: "6px 0 0" }}>
          <strong>Total comptes :</strong> {totalUsers}
        </Text>
      ) : null}
    </Section>

    <EmailButton href="https://moninvit.com/admin/users">Voir dans l'admin</EmailButton>
  </EmailLayout>
);

export const template = {
  component: AdminNewUserEmail,
  subject: "Nouvelle inscription sur MonInvit.com",
  displayName: "Admin — nouvelle inscription",
  previewData: {
    userEmail: "awa@example.com",
    userName: "Awa Koné",
    signedUpAt: "26/08/2026 14:30",
    totalUsers: 128,
  },
} satisfies TemplateEntry;

export default AdminNewUserEmail;
