import { createServerFn } from "@tanstack/react-start";
import { requireAuth as requireSupabaseAuth } from "@/lib/auth-middleware";

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  category: string;
  status: "open" | "pending" | "resolved" | "closed";
  priority: "low" | "normal" | "high" | "urgent";
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  author_id: string;
  author_role: "user" | "admin";
  body: string;
  created_at: string;
}

async function isAdmin(context: { supabase: any; userId: string }) {
  const [a, o] = await Promise.all([
    context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" }),
    context.supabase.rpc("has_role", { _user_id: context.userId, _role: "owner" }),
  ]);
  return Boolean(a.data || o.data);
}

/** Emails des administrateurs (repli sur l'adresse de l'équipe). */
async function adminEmails(): Promise<string[]> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .in("role", ["admin", "owner"]);
    const ids = Array.from(new Set((roles ?? []).map((r: any) => r.user_id)));
    if (ids.length) {
      const { data: profiles } = await supabaseAdmin.from("profiles").select("email").in("id", ids);
      const emails = (profiles ?? [])
        .map((p: any) => p.email)
        .filter((e: string | null): e is string => !!e);
      if (emails.length) return Array.from(new Set(emails));
    }
  } catch (error) {
    console.error("support: admin lookup failed", error);
  }
  return ["franck@nwc-agency.com"];
}

/** Envoi best-effort : ne jamais casser la conversation à cause d'un email. */
async function safeSend(
  templateName: string,
  to: string,
  templateData: Record<string, unknown>,
  idempotencyKey: string,
) {
  try {
    const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
    await sendTemplateEmail(templateName, to, { templateData, idempotencyKey });
  } catch (error) {
    console.error("support: email send failed", error);
  }
}

async function markRead(ticketId: string, column: "user_read_at" | "admin_read_at") {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("support_tickets")
      .update({ [column]: new Date().toISOString() })
      .eq("id", ticketId);
  } catch (error) {
    console.error("support: mark read failed", error);
  }
}

/** Compte les tickets ayant au moins un message non lu du camp opposé. */
async function unreadTickets(
  supabase: any,
  tickets: { id: string; read_at: string | null }[],
  authorRole: "user" | "admin",
) {
  const ids = tickets.map((t) => t.id);
  if (!ids.length) return 0;
  const { data: messages } = await supabase
    .from("support_messages")
    .select("ticket_id, created_at")
    .in("ticket_id", ids)
    .eq("author_role", authorRole);
  const latest = new Map<string, string>();
  for (const m of (messages ?? []) as { ticket_id: string; created_at: string }[]) {
    const current = latest.get(m.ticket_id);
    if (!current || m.created_at > current) latest.set(m.ticket_id, m.created_at);
  }
  return tickets.filter((t) => {
    const last = latest.get(t.id);
    if (!last) return false;
    return !t.read_at || last > t.read_at;
  }).length;
}

export const supportUnreadCount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("support_tickets")
      .select("id, user_read_at")
      .eq("user_id", context.userId);
    const tickets = ((data ?? []) as any[]).map((t) => ({ id: t.id, read_at: t.user_read_at }));
    return { count: await unreadTickets(context.supabase, tickets, "admin") };
  });

export const adminSupportUnreadCount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!(await isAdmin(context))) return { count: 0 };
    const { data } = await context.supabase
      .from("support_tickets")
      .select("id, admin_read_at")
      .order("last_message_at", { ascending: false })
      .limit(300);
    const tickets = ((data ?? []) as any[]).map((t) => ({ id: t.id, read_at: t.admin_read_at }));
    return { count: await unreadTickets(context.supabase, tickets, "user") };
  });

export const listMyTickets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", context.userId)
      .order("last_message_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { tickets: (data ?? []) as SupportTicket[] };
  });

export const getTicket = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { ticketId: string }) => data)
  .handler(async ({ data, context }) => {
    const { data: ticket, error } = await context.supabase
      .from("support_tickets")
      .select("*")
      .eq("id", data.ticketId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!ticket) throw new Error("Ticket introuvable.");
    const { data: messages, error: mErr } = await context.supabase
      .from("support_messages")
      .select("*")
      .eq("ticket_id", data.ticketId)
      .order("created_at", { ascending: true });
    if (mErr) throw new Error(mErr.message);
    if ((ticket as any).user_id === context.userId) await markRead(data.ticketId, "user_read_at");
    return {
      ticket: ticket as SupportTicket,
      messages: (messages ?? []) as SupportMessage[],
    };
  });

export const createTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { subject: string; category?: string; message: string; priority?: string }) => {
    const subject = (data.subject || "").trim();
    const message = (data.message || "").trim();
    if (subject.length < 3 || subject.length > 140) throw new Error("Sujet invalide (3 à 140 caractères).");
    if (message.length < 5 || message.length > 5000) throw new Error("Message invalide (5 à 5000 caractères).");
    const category = (data.category || "general").trim().slice(0, 40);
    const priority = ["low", "normal", "high", "urgent"].includes(data.priority || "")
      ? (data.priority as string)
      : "normal";
    return { subject, message, category, priority };
  })
  .handler(async ({ data, context }) => {
    const { data: ticket, error } = await context.supabase
      .from("support_tickets")
      .insert({
        user_id: context.userId,
        subject: data.subject,
        category: data.category,
        priority: data.priority,
        status: "open",
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    const { data: message, error: mErr } = await context.supabase
      .from("support_messages")
      .insert({
        ticket_id: ticket.id,
        author_id: context.userId,
        author_role: "user",
        body: data.message,
      })
      .select("id")
      .single();
    if (mErr) throw new Error(mErr.message);

    const { data: profile } = await context.supabase
      .from("profiles")
      .select("email, display_name")
      .eq("id", context.userId)
      .maybeSingle();
    const recipients = await adminEmails();
    await Promise.all(
      recipients.map((to) =>
        safeSend(
          "support-admin-message",
          to,
          {
            subject: data.subject,
            message: data.message,
            userEmail: (profile as any)?.email ?? "",
            userName: (profile as any)?.display_name ?? "",
            isNewTicket: true,
          },
          `support-admin-${(message as any)?.id ?? ticket.id}-${to}`,
        ),
      ),
    );
    return { ticket: ticket as SupportTicket };
  });

export const replyToTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { ticketId: string; body: string }) => {
    const body = (data.body || "").trim();
    if (body.length < 1 || body.length > 5000) throw new Error("Message invalide.");
    return { ticketId: data.ticketId, body };
  })
  .handler(async ({ data, context }) => {
    const admin = await isAdmin(context);
    const { data: inserted, error } = await context.supabase
      .from("support_messages")
      .insert({
        ticket_id: data.ticketId,
        author_id: context.userId,
        author_role: admin ? "admin" : "user",
        body: data.body,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await markRead(data.ticketId, admin ? "admin_read_at" : "user_read_at");

    const { data: ticket } = await context.supabase
      .from("support_tickets")
      .select("subject, user_id")
      .eq("id", data.ticketId)
      .maybeSingle();
    const msgId = (inserted as any)?.id ?? data.ticketId;

    if (admin) {
      const { data: profile } = await context.supabase
        .from("profiles")
        .select("email, user_first_name, display_name")
        .eq("id", (ticket as any)?.user_id)
        .maybeSingle();
      const to = (profile as any)?.email as string | undefined;
      if (to) {
        await safeSend(
          "support-user-reply",
          to,
          {
            subject: (ticket as any)?.subject ?? "",
            message: data.body,
            firstName: (profile as any)?.user_first_name ?? (profile as any)?.display_name ?? "",
          },
          `support-user-${msgId}`,
        );
      }
    } else {
      const { data: profile } = await context.supabase
        .from("profiles")
        .select("email, display_name")
        .eq("id", context.userId)
        .maybeSingle();
      const recipients = await adminEmails();
      await Promise.all(
        recipients.map((to) =>
          safeSend(
            "support-admin-message",
            to,
            {
              subject: (ticket as any)?.subject ?? "",
              message: data.body,
              userEmail: (profile as any)?.email ?? "",
              userName: (profile as any)?.display_name ?? "",
              isNewTicket: false,
            },
            `support-admin-${msgId}-${to}`,
          ),
        ),
      );
    }
    return { ok: true };
  });

export const adminListTickets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { status?: string } | undefined) => data ?? {})
  .handler(async ({ data, context }) => {
    if (!(await isAdmin(context))) throw new Error("Accès refusé");
    const supabaseAdmin = context.supabase;
    let q = supabaseAdmin
      .from("support_tickets")
      .select("*")
      .order("last_message_at", { ascending: false })
      .limit(200);
    if (data.status && data.status !== "all") q = q.eq("status", data.status);
    const { data: tickets, error } = await q;
    if (error) throw new Error(error.message);
    const userIds = Array.from(new Set((tickets ?? []).map((t: any) => t.user_id)));
    let profiles: Record<string, { email: string | null; display_name: string | null }> = {};
    if (userIds.length) {
      const { data: profs } = await supabaseAdmin
        .from("profiles")
        .select("id, email, display_name")
        .in("id", userIds);
      profiles = Object.fromEntries(
        (profs ?? []).map((p: any) => [p.id, { email: p.email, display_name: p.display_name }]),
      );
    }
    return {
      tickets: (tickets ?? []).map((t: any) => ({
        ...(t as SupportTicket),
        user_email: profiles[t.user_id]?.email ?? null,
        user_name: profiles[t.user_id]?.display_name ?? null,
      })),
    };
  });

export const adminGetTicket = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { ticketId: string }) => data)
  .handler(async ({ data, context }) => {
    if (!(await isAdmin(context))) throw new Error("Accès refusé");
    const supabaseAdmin = context.supabase;
    const { data: ticket, error } = await supabaseAdmin
      .from("support_tickets")
      .select("*")
      .eq("id", data.ticketId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!ticket) throw new Error("Ticket introuvable.");
    const { data: messages } = await supabaseAdmin
      .from("support_messages")
      .select("*")
      .eq("ticket_id", data.ticketId)
      .order("created_at", { ascending: true });
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("email, display_name, user_first_name, user_last_name")
      .eq("id", (ticket as any).user_id)
      .maybeSingle();
    await markRead(data.ticketId, "admin_read_at");
    return {
      ticket: ticket as SupportTicket,
      messages: (messages ?? []) as SupportMessage[],
      profile: profile as any,
    };
  });

export const adminUpdateTicketStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { ticketId: string; status: string }) => {
    if (!["open", "pending", "resolved", "closed"].includes(data.status))
      throw new Error("Statut invalide.");
    return data;
  })
  .handler(async ({ data, context }) => {
    if (!(await isAdmin(context))) throw new Error("Accès refusé");
    const { error } = await context.supabase
      .from("support_tickets")
      .update({ status: data.status })
      .eq("id", data.ticketId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
