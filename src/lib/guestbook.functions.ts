import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? "";
const SUPABASE_PUBLISHABLE_KEY =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ?? "";

function getPublicSupabase() {
  const url = process.env.SUPABASE_URL || SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase env missing.");
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

const submitSchema = z.object({
  weddingId: z.string().uuid(),
  authorName: z.string().trim().min(1).max(80),
  message: z.string().trim().min(1).max(600),
});

export const submitGuestbookMessage = createServerFn({ method: "POST" })
  .inputValidator((input) => submitSchema.parse(input))
  .handler(async ({ data }) => {
    const supabase = getPublicSupabase();
    const { error } = await supabase.from("guestbook_messages").insert({
      wedding_id: data.weddingId,
      author_name: data.authorName,
      message: data.message,
    } as never);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const listPublicSchema = z.object({ weddingId: z.string().uuid() });

export const listPublicGuestbook = createServerFn({ method: "GET" })
  .inputValidator((input) => listPublicSchema.parse(input))
  .handler(async ({ data }) => {
    const supabase = getPublicSupabase();
    const { data: rows, error } = await supabase
      .from("guestbook_messages")
      .select("id, author_name, message, created_at")
      .eq("wedding_id", data.weddingId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return { messages: rows ?? [] };
  });

const ownerListSchema = z.object({ weddingId: z.string().uuid() });

export const listOwnGuestbook = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => ownerListSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("guestbook_messages")
      .select("id, author_name, message, created_at")
      .eq("wedding_id", data.weddingId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { messages: rows ?? [] };
  });

const deleteSchema = z.object({ id: z.string().uuid() });

export const deleteGuestbookMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => deleteSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("guestbook_messages")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
