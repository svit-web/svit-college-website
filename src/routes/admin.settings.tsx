import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Settings as SettingsIcon, ShieldAlert, Phone, Mail, MapPin, Globe, Building2, Calendar, Shield, Headphones, Share2, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useImageCompressionMode, IMAGE_COMPRESSION_MODE_QUERY_KEY } from "@/hooks/useImageCompressionMode";
import { setImageCompressionMode } from "@/lib/app-settings.functions";
import { Switch } from "@/components/ui/switch";
import { contactInfoQuery, miscSettingsQuery } from "@/lib/homepage";
import {
  saveContactInfo,
  saveMiscSettings,
  DEFAULT_CONTACT,
  DEFAULT_MISC,
  type ContactInfoSettings,
  type MiscSettings,
} from "@/lib/site-settings.functions";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const { roles, loading } = useAdminAuth();
  const isAdmin = roles.some((r) => r.code === "admin");
  const { mode } = useImageCompressionMode();
  const [compressionSaving, setCompressionSaving] = useState(false);
  const queryClient = useQueryClient();

  const { data: contactInfo } = useQuery(contactInfoQuery);
  const { data: miscSettings } = useQuery(miscSettingsQuery);

  const [contact, setContact] = useState<ContactInfoSettings | null>(null);
  const [misc, setMisc] = useState<MiscSettings | null>(null);
  const [contactSaving, setContactSaving] = useState(false);
  const [miscSaving, setMiscSaving] = useState(false);

  // Initialize form state from loaded data (once)
  const c = contact ?? (contactInfo as ContactInfoSettings | null) ?? DEFAULT_CONTACT;
  const m = misc ?? miscSettings ?? DEFAULT_MISC;

  if (!loading && !isAdmin) {
    return (
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">
        <p className="flex items-center gap-2 text-sm font-semibold text-amber-600">
          <ShieldAlert className="h-4 w-4" />
          Global Admin access required
        </p>
        <p className="mt-1 text-sm text-slate-500">
          You don't have permission to view or change system settings.
        </p>
      </div>
    );
  }

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined;
  };

  const handleCompressionToggle = async (checked: boolean) => {
    const nextMode = checked ? "server" : "client";
    setCompressionSaving(true);
    try {
      await setImageCompressionMode({ data: nextMode, headers: await getToken() });
      await queryClient.invalidateQueries({ queryKey: IMAGE_COMPRESSION_MODE_QUERY_KEY });
      toast.success(`Image compression now runs ${checked ? "server-side" : "in the browser"}.`);
    } catch (err: any) {
      toast.error(`Failed: ${err.message}`);
    } finally {
      setCompressionSaving(false);
    }
  };

  const handleSaveContact = async () => {
    setContactSaving(true);
    try {
      await saveContactInfo({ data: c, headers: await getToken() });
      await queryClient.invalidateQueries({ queryKey: ["contact_info"] });
      toast.success("Contact info saved.");
    } catch (err: any) {
      toast.error(`Failed: ${err.message}`);
    } finally {
      setContactSaving(false);
    }
  };

  const handleSaveMisc = async () => {
    setMiscSaving(true);
    try {
      await saveMiscSettings({ data: m, headers: await getToken() });
      await queryClient.invalidateQueries({ queryKey: ["misc_settings"] });
      toast.success("Site settings saved.");
    } catch (err: any) {
      toast.error(`Failed: ${err.message}`);
    } finally {
      setMiscSaving(false);
    }
  };

  const setC = (patch: Partial<ContactInfoSettings>) =>
    setContact((prev) => ({ ...(prev ?? c), ...patch }));
  const setM = (patch: Partial<MiscSettings>) =>
    setMisc((prev) => ({ ...(prev ?? m), ...patch }));

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-navy md:text-3xl flex items-center gap-3">
          <SettingsIcon className="h-8 w-8 text-crimson" />
          Settings
        </h1>
        <p className="text-sm text-slate-500">System-wide configuration. Global Admin only.</p>
      </div>

      {/* ── Contact Information ── */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <h2 className="font-display text-base font-bold text-navy flex items-center gap-2">
          <Building2 className="h-4 w-4 text-crimson" /> Contact Information
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Institute Short Name" icon={<Building2 className="h-3.5 w-3.5" />}>
            <input value={c.institute_name} onChange={(e) => setC({ institute_name: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Full Name" icon={<Building2 className="h-3.5 w-3.5" />}>
            <input value={c.full_name} onChange={(e) => setC({ full_name: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Phone" icon={<Phone className="h-3.5 w-3.5" />}>
            <input value={c.phone} onChange={(e) => setC({ phone: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Email" icon={<Mail className="h-3.5 w-3.5" />}>
            <input type="email" value={c.email} onChange={(e) => setC({ email: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Website URL" icon={<Globe className="h-3.5 w-3.5" />}>
            <input type="url" value={c.website_url} onChange={(e) => setC({ website_url: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Google Maps Embed URL" icon={<MapPin className="h-3.5 w-3.5" />}>
            <input value={c.map_iframe_url ?? ""} onChange={(e) => setC({ map_iframe_url: e.target.value || null })} className={inputCls} />
          </Field>
        </div>

        <Field label="Address" icon={<MapPin className="h-3.5 w-3.5" />} full>
          <textarea rows={2} value={c.address} onChange={(e) => setC({ address: e.target.value })} className={inputCls} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Weekday Hours">
            <input value={c.office_hours?.weekdays ?? ""} onChange={(e) => setC({ office_hours: { ...c.office_hours, weekdays: e.target.value } })} className={inputCls} placeholder="9:00 – 17:00" />
          </Field>
          <Field label="Saturday Hours">
            <input value={c.office_hours?.saturday ?? ""} onChange={(e) => setC({ office_hours: { ...c.office_hours, saturday: e.target.value } })} className={inputCls} placeholder="9:00 – 13:00" />
          </Field>
          <Field label="Sunday Hours">
            <input value={c.office_hours?.sunday ?? ""} onChange={(e) => setC({ office_hours: { ...c.office_hours, sunday: e.target.value } })} className={inputCls} placeholder="Closed" />
          </Field>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Share2 className="h-3.5 w-3.5" /> Social Links
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {["Facebook", "Instagram", "LinkedIn", "Twitter", "Youtube"].map((platform) => (
              <Field key={platform} label={platform}>
                <input
                  type="url"
                  value={c.social_links?.[platform] ?? ""}
                  onChange={(e) => setC({ social_links: { ...c.social_links, [platform]: e.target.value } })}
                  className={inputCls}
                  placeholder={`https://${platform.toLowerCase()}.com/...`}
                />
              </Field>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button onClick={handleSaveContact} disabled={contactSaving} className={saveBtnCls}>
            {contactSaving ? "Saving…" : "Save Contact Info"}
          </button>
        </div>
      </section>

      {/* ── Misc / General Settings ── */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <h2 className="font-display text-base font-bold text-navy flex items-center gap-2">
          <Globe className="h-4 w-4 text-crimson" /> General Settings
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Current Admission Year" icon={<Calendar className="h-3.5 w-3.5" />}>
            <input value={m.admission_year} onChange={(e) => setM({ admission_year: e.target.value })} className={inputCls} placeholder="2026-27" />
          </Field>
          <Field label="Year Established" icon={<Calendar className="h-3.5 w-3.5" />}>
            <input type="number" value={m.year_established} onChange={(e) => setM({ year_established: Number(e.target.value) })} className={inputCls} />
          </Field>
          <Field label="Anti-Ragging Email" icon={<Shield className="h-3.5 w-3.5" />}>
            <input type="email" value={m.antiragging_email} onChange={(e) => setM({ antiragging_email: e.target.value })} className={inputCls} />
          </Field>
          <Field label="IT Support Email" icon={<Mail className="h-3.5 w-3.5" />}>
            <input type="email" value={m.it_support_email} onChange={(e) => setM({ it_support_email: e.target.value })} className={inputCls} />
          </Field>
          <Field label="UGC Helpline" icon={<Headphones className="h-3.5 w-3.5" />}>
            <input value={m.ugc_helpline} onChange={(e) => setM({ ugc_helpline: e.target.value })} className={inputCls} />
          </Field>
          <Field label="OG Image URL" icon={<Globe className="h-3.5 w-3.5" />}>
            <input type="url" value={m.og_image_url ?? ""} onChange={(e) => setM({ og_image_url: e.target.value || null })} className={inputCls} placeholder="https://..." />
          </Field>
          <Field label="Placement %" icon={<BarChart3 className="h-3.5 w-3.5" />}>
            <input type="number" value={m.placement_percentage} onChange={(e) => setM({ placement_percentage: Number(e.target.value) })} className={inputCls} />
          </Field>
          <Field label="Recruiter Count" icon={<Building2 className="h-3.5 w-3.5" />}>
            <input type="number" value={m.recruiter_count} onChange={(e) => setM({ recruiter_count: Number(e.target.value) })} className={inputCls} />
          </Field>
          <Field label="Campus Size (acres)" icon={<MapPin className="h-3.5 w-3.5" />}>
            <input type="number" value={m.campus_size_acres} onChange={(e) => setM({ campus_size_acres: Number(e.target.value) })} className={inputCls} />
          </Field>
        </div>

        <Field label="Site Meta Description" full>
          <textarea rows={2} value={m.meta_description} onChange={(e) => setM({ meta_description: e.target.value })} className={inputCls} />
        </Field>

        <Field label="OG / Social Description" full>
          <textarea rows={2} value={m.og_description} onChange={(e) => setM({ og_description: e.target.value })} className={inputCls} />
        </Field>

        <div className="flex justify-end pt-2">
          <button onClick={handleSaveMisc} disabled={miscSaving} className={saveBtnCls}>
            {miscSaving ? "Saving…" : "Save General Settings"}
          </button>
        </div>
      </section>

      {/* ── System / Technical ── */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-display text-base font-bold text-navy mb-4 flex items-center gap-2">
          <SettingsIcon className="h-4 w-4 text-crimson" /> Technical
        </h2>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-navy">Server-side image compression</p>
            <p className="mt-1 text-sm text-slate-500 max-w-md">
              When on, uploaded images are compressed by a server function instead of in the browser.
            </p>
            <p className="mt-2 text-xs text-amber-600">
              Temporarily unavailable: WASM codecs don't yet load under the Cloudflare Workers runtime. Uploads always use browser-side compression until fixed.
            </p>
          </div>
          <Switch checked={mode === "server"} onCheckedChange={handleCompressionToggle} disabled={compressionSaving} />
        </div>
      </section>
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-crimson/30 focus:border-crimson";
const saveBtnCls = "rounded-lg bg-navy px-5 py-2 text-sm font-semibold text-white hover:bg-navy/90 disabled:opacity-50 transition-colors";

function Field({ label, icon, children, full }: { label: string; icon?: React.ReactNode; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "col-span-full" : ""}>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
        {icon} {label}
      </label>
      {children}
    </div>
  );
}
