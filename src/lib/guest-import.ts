import { parsePhoneNumber } from "react-phone-number-input";
import { guestTypeMeta, guestTypeOrder, type GuestType } from "@/lib/guest-meta";
import type { Guest } from "@/lib/wedding-store";

/** A guest read from a pasted list, a spreadsheet or the phone's contacts. */
export interface ImportRow {
  name: string;
  /** What was found in the source, before normalisation (shown when it can't be read). */
  rawPhone?: string;
  /** E.164 number, only when the raw value is a valid phone number. */
  phone?: string;
  email?: string;
  guestType?: GuestType;
  group?: string;
}

export type ReviewStatus = "ok" | "no_phone" | "bad_phone" | "duplicate";

export interface ReviewRow {
  id: number;
  row: ImportRow;
  status: ReviewStatus;
}

/** E.164 number, assuming Côte d'Ivoire when no country code is given. */
export function normalizePhone(raw: string | undefined): string | undefined {
  const s = raw?.trim().replace(/^00/, "+");
  if (!s) return undefined;
  const attempt = (value: string) => {
    try {
      const parsed = parsePhoneNumber(value, "CI");
      return parsed?.isValid() ? parsed.number : undefined;
    } catch {
      return undefined;
    }
  };
  const direct = attempt(s);
  if (direct) return direct;

  // Spreadsheets store numbers as numbers: the "+" of "+233…" or the leading 0 of "07…" is lost.
  const digits = s.replace(/\D/g, "");
  if (digits === s.replace(/\s/g, "")) {
    if (digits.length >= 11 && !digits.startsWith("0")) return attempt(`+${digits}`);
    if (digits.length === 9) return attempt(`0${digits}`);
  }
  return undefined;
}

const PHONE_RE = /\+?\d[\d\s().-]{6,}\d/;
const EMAIL_RE = /[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+/;

/** One guest per line: "Awa Koné, 07 12 34 56 78", "Awa Koné 0712345678", "0712345678 Awa Koné"… */
export function parsePastedList(text: string): ImportRow[] {
  const rows: ImportRow[] = [];
  for (const line of text.split(/\r?\n/)) {
    let rest = line.trim();
    if (!rest) continue;

    let email: string | undefined;
    const emailMatch = rest.match(EMAIL_RE);
    if (emailMatch) {
      email = emailMatch[0];
      rest = rest.replace(emailMatch[0], " ");
    }
    let rawPhone: string | undefined;
    const phoneMatch = rest.match(PHONE_RE);
    if (phoneMatch) {
      rawPhone = phoneMatch[0].trim();
      rest = rest.replace(phoneMatch[0], " ");
    }
    const name = rest
      .replace(/[\t;|,()[\]:]+/g, " ")
      .replace(/^[\s\-–—]+|[\s\-–—]+$/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!name) continue;
    rows.push({ name, rawPhone, phone: normalizePhone(rawPhone), email });
  }
  return rows;
}

const HEADER = {
  name: /^(nom|name|pr[ée]nom|first ?name|last ?name|invit[ée]?s?|guest)/i,
  phone: /(t[ée]l|phone|whatsapp|mobile|portable)/i,
  email: /(mail|courriel)/i,
  type: /^type/i,
  group: /(groupe|group|famille|cat[ée]gorie)/i,
};

const cell = (v: unknown) => (v === null || v === undefined ? "" : String(v).trim());

function matchGuestType(value: string): GuestType | undefined {
  const v = value.trim().toLowerCase();
  if (!v) return undefined;
  return guestTypeOrder.find((t) => {
    const m = guestTypeMeta[t];
    return m.label.toLowerCase() === v || m.short.toLowerCase() === v;
  });
}

/** Rows of a sheet. A header row is detected (French or English); otherwise columns are Nom, Téléphone, Email. */
export function rowsFromMatrix(matrix: unknown[][]): ImportRow[] {
  if (matrix.length === 0) return [];
  const first = matrix[0].map(cell);
  const hasHeader = first.some(
    (c) => HEADER.name.test(c) || HEADER.phone.test(c) || HEADER.email.test(c),
  );

  let nameCols = [0];
  let phoneCol = 1;
  let emailCol = 2;
  let typeCol = -1;
  let groupCol = -1;
  if (hasHeader) {
    const named = first.flatMap((c, i) => (HEADER.name.test(c) ? [i] : []));
    nameCols = named.length > 0 ? named : [0];
    phoneCol = first.findIndex((c) => HEADER.phone.test(c));
    emailCol = first.findIndex((c) => HEADER.email.test(c));
    typeCol = first.findIndex((c) => HEADER.type.test(c));
    groupCol = first.findIndex((c) => HEADER.group.test(c));
  }

  const rows: ImportRow[] = [];
  for (const r of matrix.slice(hasHeader ? 1 : 0)) {
    const name = nameCols
      .map((i) => cell(r[i]))
      .filter(Boolean)
      .join(" ");
    if (!name) continue;
    const rawPhone = phoneCol >= 0 ? cell(r[phoneCol]) : "";
    rows.push({
      name,
      rawPhone: rawPhone || undefined,
      phone: normalizePhone(rawPhone),
      email: emailCol >= 0 ? cell(r[emailCol]) || undefined : undefined,
      guestType: typeCol >= 0 ? matchGuestType(cell(r[typeCol])) : undefined,
      group: groupCol >= 0 ? cell(r[groupCol]) || undefined : undefined,
    });
  }
  return rows;
}

export async function rowsFromFile(file: File): Promise<ImportRow[]> {
  const XLSX = await import("xlsx");
  const workbook = XLSX.read(await file.arrayBuffer());
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) return [];
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, blankrows: false });
  return rowsFromMatrix(matrix);
}

type ContactsApi = {
  select: (
    props: string[],
    opts?: { multiple?: boolean },
  ) => Promise<{ name?: string[]; tel?: string[] }[]>;
};

/** Contact Picker API: Chrome on Android (HTTPS). Not available on iOS or desktop. */
export function contactsSupported(): boolean {
  return typeof navigator !== "undefined" && "contacts" in navigator && "ContactsManager" in window;
}

export async function pickContacts(): Promise<ImportRow[]> {
  const api = (navigator as unknown as { contacts: ContactsApi }).contacts;
  const picked = await api.select(["name", "tel"], { multiple: true });
  return picked.flatMap((c) => {
    const name = c.name?.[0]?.trim();
    if (!name) return [];
    const rawPhone = c.tel?.[0]?.trim();
    return [{ name, rawPhone, phone: normalizePhone(rawPhone) }];
  });
}

/** Flags what needs the user's attention: unreadable numbers, missing numbers and guests already in the list. */
export function reviewRows(rows: ImportRow[], existing: Guest[]): ReviewRow[] {
  const seenNames = new Set(existing.map((g) => g.name.trim().toLowerCase()));
  const seenPhones = new Set(existing.flatMap((g) => (g.phone ? [g.phone] : [])));
  return rows.map((row, id) => {
    const key = row.name.trim().toLowerCase();
    const duplicate = seenNames.has(key) || (!!row.phone && seenPhones.has(row.phone));
    seenNames.add(key);
    if (row.phone) seenPhones.add(row.phone);
    const status: ReviewStatus = duplicate
      ? "duplicate"
      : row.phone
        ? "ok"
        : row.rawPhone
          ? "bad_phone"
          : "no_phone";
    return { id, row, status };
  });
}
