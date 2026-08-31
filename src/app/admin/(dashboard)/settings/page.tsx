import { redirect } from "next/navigation";
import { requireAdmin, getScopeLevel } from "@/app/lib/auth/admin";
import { isRouteAllowedForScope } from "@/lib/admin-sections";
import { getContactInfo } from "@/lib/pages.functions";
import { getMiscSettings } from "@/lib/site-settings.functions";
import { AdminSettingsPage } from "@/components/admin-next/pages/AdminSettingsPage";
import { DEFAULT_CONTACT, type ContactInfoSettings } from "@/lib/site-settings-types";

export default async function SettingsPage() {
  const admin = await requireAdmin();
  const level = getScopeLevel(admin);

  if (!isRouteAllowedForScope("/admin/settings", level)) {
    redirect("/admin");
  }

  const [contact, misc] = await Promise.all([
    getContactInfo().catch(() => null),
    getMiscSettings().catch(() => null),
  ]);

  const initialContact: ContactInfoSettings | null = contact
    ? {
        phone: contact.phone ?? DEFAULT_CONTACT.phone,
        email: contact.email ?? DEFAULT_CONTACT.email,
        address: contact.address ?? DEFAULT_CONTACT.address,
        full_name: contact.full_name || DEFAULT_CONTACT.full_name,
        institute_name: contact.institute_name || DEFAULT_CONTACT.institute_name,
        website_url: contact.website_url ?? DEFAULT_CONTACT.website_url,
        map_iframe_url: contact.map_iframe_url,
        office_hours: contact.office_hours,
        social_links: contact.social_links,
      }
    : null;

  return <AdminSettingsPage initialContact={initialContact} initialMisc={misc} />;
}
