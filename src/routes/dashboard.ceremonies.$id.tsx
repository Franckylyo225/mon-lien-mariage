import { createFileRoute, redirect } from "@tanstack/react-router";

// The edit sheet on /dashboard/ceremonies replaced the standalone edit page; this keeps old links working.
export const Route = createFileRoute("/dashboard/ceremonies/$id")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/dashboard/ceremonies", search: { edit: params.id } });
  },
});
