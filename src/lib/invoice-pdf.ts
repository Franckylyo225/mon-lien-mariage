import { jsPDF } from "jspdf";

export interface InvoiceLine {
  description: string;
  amountXof: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  issuedAt: string; // ISO
  paidAt: string; // ISO
  customerName: string;
  customerEmail: string | null;
  description: string;
  amountXof: number;
  slug: string | null;
  /** Optional detailed lines (publication, add-ons, discount). */
  lines?: InvoiceLine[];
}

/* Charte MonInvit v1.0 */
const FRAMBOISE: [number, number, number] = [232, 32, 80];
const CHAMPAGNE: [number, number, number] = [198, 161, 91];
const ENCRE: [number, number, number] = [32, 26, 28];
const GRIS: [number, number, number] = [122, 114, 117];
const CREME: [number, number, number] = [253, 246, 245];

const LOGO_URL = "/media/logo-moninvit-invoice.png";
const LOGO_RATIO = 1920 / 406;

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

async function loadLogo(): Promise<string | null> {
  try {
    const res = await fetch(LOGO_URL);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generateInvoicePdf(data: InvoiceData): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 48;
  const contentW = pageW - marginX * 2;

  /* ---------- Bandeau d'en-tête ---------- */
  const headerH = 132;
  doc.setFillColor(...ENCRE);
  doc.rect(0, 0, pageW, headerH, "F");
  doc.setFillColor(...FRAMBOISE);
  doc.rect(0, headerH - 5, pageW, 5, "F");
  doc.setFillColor(...CHAMPAGNE);
  doc.rect(0, headerH - 5, pageW * 0.32, 5, "F");

  const logo = await loadLogo();
  let brandBottom = 62;
  if (logo) {
    const logoW = 150;
    const logoH = logoW / LOGO_RATIO;
    const padX = 14;
    const padY = 10;
    try {
      doc.addImage(logo, "PNG", marginX, 30, logoW, logoH);
      brandBottom = 30 + logoH + 10;
    } catch {
      /* ignore */
    }
  }
  if (!logo) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text("MonInvit.com", marginX, 58);
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(200, 194, 196);
  doc.text("Invitations digitales — Abidjan, Côte d'Ivoire", marginX, brandBottom + 20);
  doc.text("contact@moninvit.com · moninvit.com", marginX, brandBottom + 33);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text("FACTURE", pageW - marginX, 58, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...CHAMPAGNE);
  doc.text(`N° ${data.invoiceNumber}`, pageW - marginX, 76, { align: "right" });
  doc.setTextColor(200, 194, 196);
  doc.text(`Émise le ${fmtDate(data.issuedAt)}`, pageW - marginX, 90, { align: "right" });

  /* ---------- Blocs client / paiement ---------- */
  let y = headerH + 34;
  const boxH = 84;
  const gap = 16;
  const boxW = (contentW - gap) / 2;

  doc.setFillColor(...CREME);
  doc.roundedRect(marginX, y, boxW, boxH, 8, 8, "F");
  doc.setFillColor(...CREME);
  doc.roundedRect(marginX + boxW + gap, y, boxW, boxH, 8, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...FRAMBOISE);
  doc.text("FACTURÉ À", marginX + 16, y + 22);
  doc.text("PAIEMENT", marginX + boxW + gap + 16, y + 22);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...ENCRE);
  doc.text(data.customerName || "Client", marginX + 16, y + 42);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...GRIS);
  if (data.customerEmail) doc.text(data.customerEmail, marginX + 16, y + 58);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...ENCRE);
  doc.text(`Payé le ${fmtDate(data.paidAt)}`, marginX + boxW + gap + 16, y + 42);

  // Badge "PAYÉ"
  const badgeX = marginX + boxW + gap + 16;
  doc.setFillColor(...FRAMBOISE);
  doc.roundedRect(badgeX, y + 50, 54, 18, 9, 9, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("PAYÉ", badgeX + 27, y + 62, { align: "center" });

  y += boxH + 34;

  /* ---------- Tableau ---------- */
  const colQty = pageW - marginX - 170;
  const colUnit = pageW - marginX - 90;
  const colTotal = pageW - marginX - 14;

  doc.setFillColor(...ENCRE);
  doc.roundedRect(marginX, y, contentW, 28, 6, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("DESCRIPTION", marginX + 14, y + 18);
  doc.text("QTÉ", colQty, y + 18, { align: "right" });
  doc.text("PRIX UNITAIRE", colUnit, y + 18, { align: "right" });
  doc.text("TOTAL", colTotal, y + 18, { align: "right" });
  y += 28;

  const lines: InvoiceLine[] =
    data.lines && data.lines.length > 0
      ? data.lines
      : [{ description: data.description, amountXof: data.amountXof }];

  doc.setFontSize(10);
  lines.forEach((line, i) => {
    const descLines = doc.splitTextToSize(line.description, contentW - 250);
    const rowH = Math.max(32, descLines.length * 14 + 16);
    if (i % 2 === 1) {
      doc.setFillColor(250, 249, 249);
      doc.rect(marginX, y, contentW, rowH, "F");
    }
    const negative = line.amountXof < 0;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...(negative ? FRAMBOISE : ENCRE));
    doc.text(descLines, marginX + 14, y + 20);
    doc.setTextColor(...GRIS);
    doc.text("1", colQty, y + 20, { align: "right" });
    doc.text(fmtXof(line.amountXof), colUnit, y + 20, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...(negative ? FRAMBOISE : ENCRE));
    doc.text(fmtXof(line.amountXof), colTotal, y + 20, { align: "right" });
    y += rowH;
    doc.setDrawColor(238, 234, 235);
    doc.line(marginX, y, pageW - marginX, y);
  });

  y += 26;

  /* ---------- Totaux ---------- */
  const subtotal = lines.reduce((s, l) => s + l.amountXof, 0);
  const labelX = pageW - marginX - 190;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...GRIS);
  doc.text("Sous-total", labelX, y);
  doc.text(fmtXof(subtotal), colTotal, y, { align: "right" });
  y += 17;
  doc.text("TVA", labelX, y);
  doc.text("Incluse", colTotal, y, { align: "right" });
  y += 14;

  const totalBoxH = 42;
  doc.setFillColor(...FRAMBOISE);
  doc.roundedRect(labelX - 16, y, pageW - marginX - (labelX - 16), totalBoxH, 8, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL PAYÉ", labelX, y + 26);
  doc.setFontSize(13);
  doc.text(fmtXof(data.amountXof), colTotal, y + 26, { align: "right" });

  /* ---------- Pied de page ---------- */
  const footerY = pageH - 78;
  doc.setDrawColor(...CHAMPAGNE);
  doc.setLineWidth(1);
  doc.line(marginX, footerY, pageW - marginX, footerY);
  doc.setLineWidth(0.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...ENCRE);
  doc.text("Merci pour votre confiance.", marginX, footerY + 20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRIS);
  doc.text(
    "Cette facture est générée automatiquement par MonInvit.com.",
    marginX,
    footerY + 34,
  );
  if (data.slug) {
    doc.setTextColor(...FRAMBOISE);
    doc.text(`moninvit.com/e/${data.slug}`, pageW - marginX, footerY + 34, { align: "right" });
  }

  return doc;
}

export async function downloadInvoicePdf(data: InvoiceData, filename: string): Promise<void> {
  const doc = await generateInvoicePdf(data);
  doc.save(filename);
}
