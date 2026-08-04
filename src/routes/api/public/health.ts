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
            STRIPE_TEST_API_KEY: Boolean(process.env["STRIPE_TEST_API_KEY"]),
            VITE_PAYSTACK_SECRET_KEY: Boolean(process.env["VITE_PAYSTACK_SECRET_KEY"]),
          },
        }),
    },
  },
});
