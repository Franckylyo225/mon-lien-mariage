import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

export const checkEmailAvailability = createServerFn({ method: "GET" })
  .inputValidator((data) =>
    z.object({ email: z.string().email() }).parse(data)
  )
  .handler(async ({ data }) => {
    // Appel public (publishable key) : pas besoin de service_role pour cette vérification anonyme.
    const supabase = createClient(
      process.env['SUPABASE_URL']!,
      process.env['SUPABASE_PUBLISHABLE_KEY']!,
      { auth: { persistSession: false } }
    );
    const { data: exists, error } = await supabase.rpc("email_exists", {
      _email: data.email,
    });
    if (error) {
      console.error("checkEmailAvailability error", error);
      throw new Error("Impossible de vérifier cette adresse.");
    }
    return { available: !exists };
  });
