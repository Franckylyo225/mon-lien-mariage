import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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
    const { error: mErr } = await context.supabase.from("support_messages").insert({
      ticket_id: ticket.id,
      author_id: context.userId,
      author_role: "user",
      body: data.message,
    });
    if (mErr) throw new Error(mErr.message);
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
    const { error } = await context.supabase.from("support_messages").insert({
      ticket_id: data.ticketId,
      author_id: context.userId,
      author_role: admin ? "admin" : "user",
      body: data.body,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListTickets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { status?: string } | undefined) => data ?? {})
  .handler(async ({ data, context }) => {
    if (!(await isAdmin(context))) throw new Error("Accès refusé");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
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
