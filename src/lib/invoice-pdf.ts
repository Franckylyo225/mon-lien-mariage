import { jsPDF } from "jspdf";

export interface InvoiceData {
  invoiceNumber: string;
  issuedAt: string; // ISO
  paidAt: string; // ISO
  customerName: string;
  customerEmail: string | null;
  description: string;
  amountXof: number;
  slug: string | null;
}

function fmtXof(n: number): string {
  return n.toLocaleString("fr-FR").replace(/\u202f|\u00a0/g, " ") + " F CFA";
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function generateInvoicePdf(data: InvoiceData): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const marginX = 48;
  let y = 56;

  // Brand
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(20, 20, 20);
  doc.text("MonInvit.com", marginX, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(110, 110, 110);
  doc.text("Invitations digitales — Abidjan, Côte d'Ivoire", marginX, y + 14);
  doc.text("contact@moninvit.com", marginX, y + 26);

  // Invoice title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(20, 20, 20);
  doc.text("FACTURE", pageW - marginX, y, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(110, 110, 110);
  doc.text(`N° ${data.invoiceNumber}`, pageW - marginX, y + 14, { align: "right" });
  doc.text(`Émise le ${fmtDate(data.issuedAt)}`, pageW - marginX, y + 26, { align: "right" });

  y += 60;
  doc.setDrawColor(230, 230, 230);
  doc.line(marginX, y, pageW - marginX, y);
  y += 24;

  // Client
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text("Facturé à", marginX, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(data.customerName || "Client", marginX, y + 16);
  if (data.customerEmail) doc.text(data.customerEmail, marginX, y + 30);

  // Statut
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text("Paiement", pageW - marginX, y, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.text(`Payé le ${fmtDate(data.paidAt)}`, pageW - marginX, y + 16, { align: "right" });
  doc.setTextColor(4, 120, 87);
  doc.text("Statut : PAYÉ", pageW - marginX, y + 30, { align: "right" });

  y += 60;

  // Table header
  doc.setFillColor(245, 245, 245);
  doc.rect(marginX, y, pageW - marginX * 2, 26, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text("DESCRIPTION", marginX + 12, y + 17);
  doc.text("QTÉ", pageW - marginX - 170, y + 17, { align: "right" });
  doc.text("PRIX UNITAIRE", pageW - marginX - 90, y + 17, { align: "right" });
  doc.text("TOTAL", pageW - marginX - 12, y + 17, { align: "right" });
  y += 26;

  // Row
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  const descLines = doc.splitTextToSize(data.description, pageW - marginX * 2 - 250);
  const rowH = Math.max(30, descLines.length * 14 + 12);
  doc.text(descLines, marginX + 12, y + 18);
  doc.text("1", pageW - marginX - 170, y + 18, { align: "right" });
  doc.text(fmtXof(data.amountXof), pageW - marginX - 90, y + 18, { align: "right" });
  doc.text(fmtXof(data.amountXof), pageW - marginX - 12, y + 18, { align: "right" });
  y += rowH;

  doc.setDrawColor(230, 230, 230);
  doc.line(marginX, y, pageW - marginX, y);
  y += 20;

  // Totals
  const totalsX = pageW - marginX - 12;
  const labelX = pageW - marginX - 160;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text("Sous-total", labelX, y);
  doc.text(fmtXof(data.amountXof), totalsX, y, { align: "right" });
  y += 16;
  doc.text("TVA", labelX, y);
  doc.text("Incluse", totalsX, y, { align: "right" });
  y += 22;

  doc.setDrawColor(230, 230, 230);
  doc.line(labelX - 8, y - 12, totalsX, y - 12);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(20, 20, 20);
  doc.text("Total payé", labelX, y);
  doc.text(fmtXof(data.amountXof), totalsX, y, { align: "right" });

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 60;
  doc.setDrawColor(230, 230, 230);
  doc.line(marginX, footerY, pageW - marginX, footerY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text(
    "Merci pour votre confiance. Cette facture est générée automatiquement par MonInvit.com.",
    marginX,
    footerY + 18,
  );
  if (data.slug) {
    doc.text(`Publication : moninvit.com/e/${data.slug}`, marginX, footerY + 32);
  }

  return doc;
}

export function downloadInvoicePdf(data: InvoiceData, filename: string): void {
  const doc = generateInvoicePdf(data);
  doc.save(filename);
}
