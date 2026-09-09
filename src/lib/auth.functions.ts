import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const checkEmailAvailability = createServerFn({ method: "GET" })
  .inputValidator((data) =>
    z.object({ email: z.string().email() }).parse(data)
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: exists, error } = await (supabaseAdmin as any).rpc(
      "email_exists",
      { _email: data.email }
    );
    if (error) {
      console.error("checkEmailAvailability error", error);
      throw new Error("Impossible de vérifier cette adresse.");
    }
    return { available: !exists };
  });
