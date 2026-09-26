import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { requireAuth as requireSupabaseAuth } from "@/lib/auth-middleware";

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

export interface OwnerGuestbookMessage {
  id: string;
  author_name: string;
  author_relation: string | null;
  is_favorite?: boolean;
  message: string;
  created_at: string;
}

export const listOwnGuestbook = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => ownerListSchema.parse(input))
  .handler(async ({ data, context }) => {
    const query = (columns: string) =>
      context.supabase
        .from("guestbook_messages")
        .select(columns)
        .eq("wedding_id", data.weddingId)
        .order("created_at", { ascending: false });

    const withFavorite = await query(
      "id, author_name, author_relation, is_favorite, message, created_at",
    );
    if (!withFavorite.error) {
      return {
        messages: (withFavorite.data ?? []) as unknown as OwnerGuestbookMessage[],
        favoritesEnabled: true,
      };
    }
    // The is_favorite column ships with a migration: until it is applied, keep the page working without hearts.
    if (!/is_favorite/.test(withFavorite.error.message))
      throw new Error(withFavorite.error.message);
    const legacy = await query("id, author_name, author_relation, message, created_at");
    if (legacy.error) throw new Error(legacy.error.message);
    return {
      messages: (legacy.data ?? []) as unknown as OwnerGuestbookMessage[],
      favoritesEnabled: false,
    };
  });

const favoriteSchema = z.object({ id: z.string().uuid(), isFavorite: z.boolean() });

export const setGuestbookFavorite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => favoriteSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("guestbook_messages")
      .update({ is_favorite: data.isFavorite })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const deleteSchema = z.object({ id: z.string().uuid() });

export const deleteGuestbookMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => deleteSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("guestbook_messages").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
