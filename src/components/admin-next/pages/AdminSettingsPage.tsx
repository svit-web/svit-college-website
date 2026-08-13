'use client';

import { useState } from 'react';
import { Settings as SettingsIcon, Phone, Mail, MapPin, Globe, Building2, Calendar, Shield, Headphones, Share2, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { MediaUploader } from '@/components/admin-next/MediaUploader';
import { saveContactInfo, saveMiscSettings } from '@/lib/site-settings-next';
import { DEFAULT_CONTACT, DEFAULT_MISC, type ContactInfoSettings, type MiscSettings } from '@/lib/site-settings-types';

export function AdminSettingsPage({
  initialContact,
  initialMisc,
}: {
  initialContact: ContactInfoSettings | null;
  initialMisc: MiscSettings | null;
}) {
  const [c, setC] = useState<ContactInfoSettings>(initialContact ?? DEFAULT_CONTACT);
  const [m, setM] = useState<MiscSettings>(initialMisc ?? DEFAULT_MISC);
  const [contactSaving, setContactSaving] = useState(false);
  const [miscSaving, setMiscSaving] = useState(false);

  const handleSaveContact = async () => {
    setContactSaving(true);
    try {
      await saveContactInfo(c);
      toast.success('Contact info saved.');
    } catch (err: any) {
      toast.error(`Failed: ${err.message}`);
    } finally {
      setContactSaving(false);
    }
  };

  const handleSaveMisc = async () => {
    setMiscSaving(true);
    try {
      await saveMiscSettings(m);
      toast.success('Site settings saved.');
    } catch (err: any) {
      toast.error(`Failed: ${err.message}`);
    } finally {
      setMiscSaving(false);
    }
  };

  const setCPatch = (patch: Partial<ContactInfoSettings>) => setC((prev) => ({ ...prev, ...patch }));
  const setMPatch = (patch: Partial<MiscSettings>) => setM((prev) => ({ ...prev, ...patch }));

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-navy md:text-3xl flex items-center gap-3">
          <SettingsIcon className="h-8 w-8 text-crimson" />
          Settings
        </h1>
        <p className="text-sm text-slate-500">System-wide configuration. Global Admin only.</p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <h2 className="font-display text-base font-bold text-navy flex items-center gap-2">
          <Building2 className="h-4 w-4 text-crimson" /> Contact Information
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Institute Short Name" icon={<Building2 className="h-3.5 w-3.5" />}>
            <input value={c.institute_name} onChange={(e) => setCPatch({ institute_name: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Full Name" icon={<Building2 className="h-3.5 w-3.5" />}>
            <input value={c.full_name} onChange={(e) => setCPatch({ full_name: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Phone" icon={<Phone className="h-3.5 w-3.5" />}>
            <input value={c.phone} onChange={(e) => setCPatch({ phone: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Email" icon={<Mail className="h-3.5 w-3.5" />}>
            <input type="email" value={c.email} onChange={(e) => setCPatch({ email: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Website URL" icon={<Globe className="h-3.5 w-3.5" />}>
            <input type="url" value={c.website_url} onChange={(e) => setCPatch({ website_url: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Google Maps Embed URL" icon={<MapPin className="h-3.5 w-3.5" />}>
            <input value={c.map_iframe_url ?? ''} onChange={(e) => setCPatch({ map_iframe_url: e.target.value || null })} className={inputCls} />
          </Field>
        </div>

        <Field label="Address" icon={<MapPin className="h-3.5 w-3.5" />} full>
          <textarea rows={2} value={c.address} onChange={(e) => setCPatch({ address: e.target.value })} className={inputCls} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Weekday Hours">
            <input
              value={c.office_hours?.weekdays ?? ''}
              onChange={(e) => setCPatch({ office_hours: { ...c.office_hours, weekdays: e.target.value } })}
              className={inputCls}
              placeholder="9:00 – 17:00"
            />
          </Field>
          <Field label="Saturday Hours">
            <input
              value={c.office_hours?.saturday ?? ''}
              onChange={(e) => setCPatch({ office_hours: { ...c.office_hours, saturday: e.target.value } })}
              className={inputCls}
              placeholder="9:00 – 13:00"
            />
          </Field>
          <Field label="Sunday Hours">
            <input
              value={c.office_hours?.sunday ?? ''}
              onChange={(e) => setCPatch({ office_hours: { ...c.office_hours, sunday: e.target.value } })}
              className={inputCls}
              placeholder="Closed"
            />
          </Field>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Share2 className="h-3.5 w-3.5" /> Social Links
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {['Facebook', 'Instagram', 'LinkedIn', 'Twitter', 'Youtube'].map((platform) => (
              <Field key={platform} label={platform}>
                <input
                  type="url"
                  value={c.social_links?.[platform] ?? ''}
                  onChange={(e) => setCPatch({ social_links: { ...c.social_links, [platform]: e.target.value } })}
                  className={inputCls}
                  placeholder={`https://${platform.toLowerCase()}.com/...`}
                />
              </Field>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button onClick={handleSaveContact} disabled={contactSaving} className={saveBtnCls}>
            {contactSaving ? 'Saving…' : 'Save Contact Info'}
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <h2 className="font-display text-base font-bold text-navy flex items-center gap-2">
          <Globe className="h-4 w-4 text-crimson" /> General Settings
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Current Admission Year" icon={<Calendar className="h-3.5 w-3.5" />}>
            <input value={m.admission_year} onChange={(e) => setMPatch({ admission_year: e.target.value })} className={inputCls} placeholder="2026-27" />
          </Field>
          <Field label="Year Established" icon={<Calendar className="h-3.5 w-3.5" />}>
            <input type="number" value={m.year_established} onChange={(e) => setMPatch({ year_established: Number(e.target.value) })} className={inputCls} />
          </Field>
          <Field label="Anti-Ragging Email" icon={<Shield className="h-3.5 w-3.5" />}>
            <input type="email" value={m.antiragging_email} onChange={(e) => setMPatch({ antiragging_email: e.target.value })} className={inputCls} />
          </Field>
          <Field label="IT Support Email" icon={<Mail className="h-3.5 w-3.5" />}>
            <input type="email" value={m.it_support_email} onChange={(e) => setMPatch({ it_support_email: e.target.value })} className={inputCls} />
          </Field>
          <Field label="UGC Helpline" icon={<Headphones className="h-3.5 w-3.5" />}>
            <input value={m.ugc_helpline} onChange={(e) => setMPatch({ ugc_helpline: e.target.value })} className={inputCls} />
          </Field>
          <Field label="OG Image (Social Share Preview)" icon={<Globe className="h-3.5 w-3.5" />} full>
            <MediaUploader value={m.og_image_url ?? ''} onChange={(url) => setMPatch({ og_image_url: url || null })} />
          </Field>
          <Field label="Placement %" icon={<BarChart3 className="h-3.5 w-3.5" />}>
            <input type="number" value={m.placement_percentage} onChange={(e) => setMPatch({ placement_percentage: Number(e.target.value) })} className={inputCls} />
          </Field>
          <Field label="Recruiter Count" icon={<Building2 className="h-3.5 w-3.5" />}>
            <input type="number" value={m.recruiter_count} onChange={(e) => setMPatch({ recruiter_count: Number(e.target.value) })} className={inputCls} />
          </Field>
          <Field label="Campus Size (acres)" icon={<MapPin className="h-3.5 w-3.5" />}>
            <input type="number" value={m.campus_size_acres} onChange={(e) => setMPatch({ campus_size_acres: Number(e.target.value) })} className={inputCls} />
          </Field>
          <Field label="'Colleges' Section Label" icon={<Building2 className="h-3.5 w-3.5" />}>
            <input value={m.colleges_label} onChange={(e) => setMPatch({ colleges_label: e.target.value })} className={inputCls} placeholder="Colleges" />
          </Field>
        </div>
        <p className="text-xs text-slate-500 -mt-2">
          Controls the word used across the site for &quot;Colleges&quot; — e.g. change to &quot;Institutes&quot;. Updates the nav menu, homepage section heading, and the colleges listing page.
        </p>

        <Field label="Site Meta Description" full>
          <textarea rows={2} value={m.meta_description} onChange={(e) => setMPatch({ meta_description: e.target.value })} className={inputCls} />
        </Field>

        <Field label="OG / Social Description" full>
          <textarea rows={2} value={m.og_description} onChange={(e) => setMPatch({ og_description: e.target.value })} className={inputCls} />
        </Field>

        <div className="flex justify-end pt-2">
          <button onClick={handleSaveMisc} disabled={miscSaving} className={saveBtnCls}>
            {miscSaving ? 'Saving…' : 'Save General Settings'}
          </button>
        </div>
      </section>
    </div>
  );
}

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-crimson/30 focus:border-crimson';
const saveBtnCls = 'rounded-lg bg-navy px-5 py-2 text-sm font-semibold text-white hover:bg-navy/90 disabled:opacity-50 transition-colors';

function Field({ label, icon, children, full }: { label: string; icon?: React.ReactNode; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? 'col-span-full' : ''}>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
        {icon} {label}
      </label>
      {children}
    </div>
  );
}
