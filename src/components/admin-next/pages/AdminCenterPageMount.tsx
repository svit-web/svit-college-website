"use client";

import { Award, Shield } from "lucide-react";
import { AdminCenterPage } from "@/components/admin-next/pages/AdminCenterPage";
import { COE_PATH, COE_SLUG, NSS_NCC_PATH, NSS_NCC_SLUG } from "@/lib/center-paths";

// Server pages can't pass the icon component across the client boundary, so
// they pick a centre by key and this client wrapper supplies the rest.
export function AdminCenterPageMount({ page }: { page: "coe" | "nss-ncc" }) {
  return page === "coe" ? (
    <AdminCenterPage
      slug={COE_SLUG}
      title="Centre of Excellence"
      publicPath={COE_PATH}
      icon={Award}
    />
  ) : (
    <AdminCenterPage
      slug={NSS_NCC_SLUG}
      title="NSS / NCC"
      publicPath={NSS_NCC_PATH}
      icon={Shield}
      hideTabs={["lab", "equipment"]}
    />
  );
}
