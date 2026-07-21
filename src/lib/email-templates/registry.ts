import type { ComponentType } from 'react'
import { template as rsvpMilestoneTemplate } from './rsvp-milestone'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string
}

export const TEMPLATES: Record<string, TemplateEntry> = {
  'rsvp-milestone': rsvpMilestoneTemplate,
}
