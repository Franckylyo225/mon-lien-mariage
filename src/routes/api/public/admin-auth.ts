import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { executeAdminAuthAction } from "@/lib/admin-auth-actions.server";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("set_password"), userId: z.string().uuid(), password: z.string().min(8).max(128) }),
  z.object({ action: z.literal("set_disabled"), userId: z.string().uuid(), disabled: z.boolean() }),
  z.object({ action: z.literal("delete_user"), userId: z.string().uuid() }),
  z.object({ action: z.literal("reset_email"), email: z.string().email() }),
]);

const json = (body: unknown, status = 200) => Response.json(body, { status });

export const Route = createFileRoute("/api/public/admin-auth")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = request.headers.get("authorization") ?? "";
        const token = auth.replace(/^Bearer /, "");
        if (!token || token.split(".").length !== 3) return json({ error: "Non autorisé" }, 401);

        const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data: userData, error: userErr } = await supabase.auth.getUser(token);
        if (userErr || !userData.user) return json({ error: "Non autorisé" }, 401);
        const uid = userData.user.id;
        const [a, o] = await Promise.all([
          supabase.rpc("has_role", { _user_id: uid, _role: "admin" }),
          supabase.rpc("has_role", { _user_id: uid, _role: "owner" as never }),
        ]);
        if (!a.data && !o.data) return json({ error: "Accès refusé" }, 403);

        const parsed = schema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return json({ error: "Requête invalide" }, 400);
        if ("userId" in parsed.data && parsed.data.userId === uid && parsed.data.action !== "set_password") {
          return json({ error: "Action impossible sur votre propre compte." }, 400);
        }
        try {
          await executeAdminAuthAction(parsed.data);
          return json({ ok: true });
        } catch (e) {
          return json({ error: e instanceof Error ? e.message : "Erreur" }, 500);
        }
      },
    },
  },
});
