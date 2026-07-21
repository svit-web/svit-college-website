import { createFileRoute } from "@tanstack/react-router";
import { AdminCrudManager } from "@/components/admin/AdminCrudManager";

export const Route = createFileRoute("/admin/tables/$tableId")({
  component: AdminTableCrudPage
});

function AdminTableCrudPage() {
  const { tableId } = Route.useParams();
  return <AdminCrudManager tableId={tableId} />;
}
