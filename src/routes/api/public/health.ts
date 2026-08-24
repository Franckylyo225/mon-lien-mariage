import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/health")({
  server: {
    handlers: {
      GET: async () =>
        Response.json({
          ok: true,
          env: {
            SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
            SUPABASE_PUBLISHABLE_KEY: Boolean(process.env.SUPABASE_PUBLISHABLE_KEY),
            SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
            PAYSTACK_SECRET_KEY: Boolean(process.env["PAYSTACK_SECRET_KEY"]),
            PAYMENT_ACTIVATION_SECRET: Boolean(process.env["PAYMENT_ACTIVATION_SECRET"]),
          },
        }),
    },
  },
});
