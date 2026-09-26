import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/invites")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard/guests" });
  },
});
