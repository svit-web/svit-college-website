import { createFileRoute } from "@tanstack/react-router";
import { TnpMasterHub } from "./admin.tnp-hub";

export const Route = createFileRoute("/admin/placement-cells")({
  component: TnpMasterHub,
});
