import { createFileRoute, redirect } from "@tanstack/react-router";

// Adding a guest now happens in a sheet on the list page; this keeps old links working.
export const Route = createFileRoute("/dashboard/guests/new")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard/guests", search: { add: true } });
  },
});
