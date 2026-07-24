import { createFileRoute, notFound } from "@tanstack/react-router";

export const Route = createFileRoute("/courses/engineering/$dept/faculty")({
  loader: () => { throw notFound(); },
  notFoundComponent: () => (
    <div className="container-page py-32 text-center">
      <h1 className="font-display text-4xl font-bold text-navy">Page not found</h1>
    </div>
  ),
  component: () => null,
});
