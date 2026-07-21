import { createFileRoute } from "@tanstack/react-router";
import { AdminCrudManager } from "@/components/admin/AdminCrudManager";

export const Route = createFileRoute("/admin/colleges")({
  component: () => <AdminCrudManager tableId="colleges" />
});
