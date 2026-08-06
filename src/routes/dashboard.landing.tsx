import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/landing")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard/preview" });
  },
});
