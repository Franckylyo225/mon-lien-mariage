import type { Ceremony, Couple } from "@/lib/wedding-store";

export interface TemplateProps {
  couple: Couple;
  ceremonies: Ceremony[];
  rsvpSlot: React.ReactNode;
}
