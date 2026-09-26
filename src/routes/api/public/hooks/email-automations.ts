import { createFileRoute } from "@tanstack/react-router";
import { createHash, timingSafeEqual } from "crypto";

// Moteur d'emails automatiques — appelé toutes les heures par la planification
// de la base (pg_cron + pg_net). Protégé par un jeton partagé dont seule
// l'empreinte est stockée en base (table app_secrets, clé "email_automation").
export const Route = createFileRoute("/api/public/hooks/email-automations")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = request.headers.get("Authorization") || "";
        const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
        if (token.length < 16) {
          return Response.json({ error: "unauthorized" }, { status: 401 });
        }

        // La planification transmet les identifiants (stockés dans le coffre
        // de la base) car l'hébergeur du domaine principal ne les expose pas en
        // variables d'environnement.
        try {
          const { setRuntimeCredentials, getServiceRoleKey, getSupabaseUrl } =
            await import("@/lib/server-credentials.server");

          // The project URL is never taken from the caller: an attacker-chosen URL would turn
          // this endpoint into an SSRF and let them "authenticate" against their own database.
          const pinnedUrl = getSupabaseUrl()?.replace(/\/+$/, "");
          const headerUrl = request.headers.get("x-supabase-url")?.trim().replace(/\/+$/, "");
          if (headerUrl && pinnedUrl && headerUrl !== pinnedUrl) {
            return Response.json({ error: "unauthorized" }, { status: 401 });
          }

          // Credentials from the headers stay local until the token has been verified.
          const headerKey = request.headers.get("x-service-key")?.trim() || undefined;
          const headerResend = request.headers.get("x-resend-key")?.trim() || undefined;
          const serviceKey = getServiceRoleKey() || headerKey;

          const { createServiceClient, runEmailAutomations } =
            await import("@/lib/email-automation.server");
          const supabase = createServiceClient(serviceKey);
          const { data: secret } = await supabase
            .from("app_secrets")
            .select("value_hash")
            .eq("key", "email_automation")
            .maybeSingle();

          const hash = createHash("sha256").update(token).digest("hex");
          const expected = Buffer.from(secret?.value_hash ?? "");
          const given = Buffer.from(hash);
          if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
            return Response.json({ error: "unauthorized" }, { status: 401 });
          }

          setRuntimeCredentials({ serviceRoleKey: headerKey, resendApiKey: headerResend });

          const summary = await runEmailAutomations(serviceKey);
          return Response.json({ success: true, ...summary });
        } catch (error) {
          console.error("[automations] run failed", error);
          const message = error instanceof Error ? error.message : "";
          return Response.json(
            {
              error: "run_failed",
              ...(message.startsWith("server_misconfigured") ? { reason: message } : {}),
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
