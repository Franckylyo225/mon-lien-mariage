import type { ComponentType } from 'react'
import { template as rsvpMilestoneTemplate } from './rsvp-milestone'
import { template as adminNewUserTemplate } from './admin-new-user'
import { template as supportUserReplyTemplate } from './support-user-reply'
import { template as supportAdminMessageTemplate } from './support-admin-message'

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
  'admin-new-user': adminNewUserTemplate,
  'support-user-reply': supportUserReplyTemplate,
  'support-admin-message': supportAdminMessageTemplate,
}
