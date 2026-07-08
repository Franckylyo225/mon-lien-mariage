export type GuestType =
  | "parent_mariee"
  | "parent_marie"
  | "ami_mariee"
  | "ami_marie"
  | "collegue"
  | "autre";

export const guestTypeOrder: GuestType[] = [
  "parent_mariee",
  "parent_marie",
  "ami_mariee",
  "ami_marie",
  "collegue",
  "autre",
];

export const guestTypeMeta: Record<
  GuestType,
  { label: string; short: string; bg: string; fg: string; ring: string }
> = {
  parent_mariee: {
    label: "Parent de la mariée",
    short: "Parent mariée",
    bg: "#FBEAF0",
    fg: "#7A2440",
    ring: "#F0C9D6",
  },
  parent_marie: {
    label: "Parent du marié",
    short: "Parent marié",
    bg: "#E6EEF7",
    fg: "#264C7A",
    ring: "#C4D6EA",
  },
  ami_mariee: {
    label: "Amie de la mariée",
    short: "Amie mariée",
    bg: "#EFE7F5",
    fg: "#523278",
    ring: "#D8C6E5",
  },
  ami_marie: {
    label: "Ami du marié",
    short: "Ami marié",
    bg: "#E5F1EA",
    fg: "#265B3B",
    ring: "#C4E1CE",
  },
  collegue: {
    label: "Collègue",
    short: "Collègue",
    bg: "#F5EEE0",
    fg: "#6E5322",
    ring: "#E4D3AC",
  },
  autre: {
    label: "Autre",
    short: "Autre",
    bg: "#EEEEEE",
    fg: "#3A3A3A",
    ring: "#D8D8D8",
  },
};
