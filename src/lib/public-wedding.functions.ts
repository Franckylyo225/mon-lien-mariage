import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const inputSchema = z.object({ slug: z.string().min(1).max(120) });

export const getPublicWedding = createServerFn({ method: "GET" })
  .inputValidator((input) => inputSchema.parse(input))
  .handler(async ({ data }) => {
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );

    const { data: wedding, error } = await supabase
      .from("weddings")
      .select(
        "id, bride_name, groom_name, wedding_date, city, intro_message, couple_story, hero_image_url, template_id, theme, event_type, accent, accent_color, background_base, hashtag, slug, is_published, has_envelope_animation, has_opening_effect, opening_effect_slug, contact_name, contact_phone, contact_email, dress_code_enabled, dress_code_title, dress_code_note, dress_code_colors, dress_code_images, custom_info_title, custom_info_body, caption, countdown_enabled, countdown_units, countdown_style, practical_info_enabled, practical_parking, practical_accommodation, practical_contact_name, practical_contact_phone, registry_enabled, registry_title, registry_note, registry_stores, share_title, share_description, share_image_url, particle_effect_slug, particle_intensity, particle_speed, particle_size, particle_color_mode, particle_trigger_open, particle_trigger_loop, particle_trigger_rsvp",
      )
      .eq("slug", data.slug)
      .eq("is_published", true)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!wedding) return { wedding: null, ceremonies: [] };

    const { data: ceremonies } = await supabase
      .from("ceremonies")
      .select(
        "id, type, label, name, date, time_start, time_end, venue, maps_url, dress_code, color, capacity, notes, program, status, public_slug",
      )
      .eq("wedding_id", wedding.id)
      .order("sort_order");

    return { wedding, ceremonies: ceremonies ?? [] };
  });

const slugCheckSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9][a-z0-9-]*$/),
  excludeId: z.string().uuid().optional(),
});

export const checkSlugAvailability = createServerFn({ method: "GET" })
  .inputValidator((input) => slugCheckSchema.parse(input))
  .handler(async ({ data }) => {
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );
    // Reads only slug of published weddings; anon can read via existing public policy
    const { data: rows, error } = await supabase
      .from("weddings")
      .select("id, slug")
      .eq("slug", data.slug)
      .limit(1);
    if (error) return { available: true }; // fail-open on read errors
    const taken = (rows ?? []).some((r) => r.id !== data.excludeId);
    return { available: !taken };
  });

const rsvpSchema = z.object({
  weddingId: z.string().uuid(),
  ceremonyId: z.string().uuid().nullable().optional(),
  guestName: z.string().trim().min(1).max(120),
  guestPhone: z.string().max(40).optional().nullable(),
  guestEmail: z.string().email().max(200).optional().nullable(),
  attending: z.boolean(),
  companions: z.number().int().min(0).max(9).default(0),
  message: z.string().max(600).optional().nullable(),
});

export const submitPublicRsvp = createServerFn({ method: "POST" })
  .inputValidator((input) => rsvpSchema.parse(input))
  .handler(async ({ data }) => {
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );

    const { error } = await supabase.from("rsvps").insert({
      wedding_id: data.weddingId,
      ceremony_id: data.ceremonyId ?? null,
      guest_name: data.guestName,
      guest_phone: data.guestPhone ?? null,
      guest_email: data.guestEmail ?? null,
      attending: data.attending,
      companions: data.companions,
      message: data.message ?? null,
    } as never);

    if (error) throw new Error(error.message);
    return { ok: true };
  });
