import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — SVIT Vasad" },
      { name: "description", content: "Photo gallery of SVIT Vasad campus, events, and student work." },
    ],
  }),
  component: () => <Outlet />,
});
