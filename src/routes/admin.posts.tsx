import { createFileRoute } from "@tanstack/react-router";
import { AdminCrudManager } from "@/components/admin/AdminCrudManager";

export const Route = createFileRoute("/admin/posts")({
  component: () => <AdminCrudManager tableId="posts" />
});
