'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import { Layout, Plus, Trash2, Edit2, Loader2, Grid, Palette, Megaphone, ListOrdered, School } from 'lucide-react';
import { toast } from 'sonner';
import { MediaUploader } from '@/components/admin-next/MediaUploader';
import { MetadataEditor } from '@/components/admin-next/MetadataEditor';
import { HeroAppearancePanel } from '@/components/admin-next/pages/HeroAppearancePanel';
import type { AdminUser } from '@/app/lib/auth/admin';
import type { HeroAppearance } from '@/lib/theme';
import { HomePopupPanel } from '@/components/admin-next/pages/HomePopupPanel';
import type { HomePopup } from '@/lib/home-popup';
import { HomepageLayoutPanel } from '@/components/admin-next/pages/HomepageLayoutPanel';
import { CollegePagesPanel } from '@/components/admin-next/pages/CollegePagesPanel';
import type { HomepageLayoutEntry } from '@/lib/homepage-layout';

export function AdminHomepagePage({
  admin,
  initialAppearance,
  initialPopup,
  initialLayout,
}: {
  admin: AdminUser;
  initialAppearance: HeroAppearance;
  /** Only passed for global admins — the only role app_settings' RLS lets write it. */
  initialPopup: HomePopup | null;
  /** Only passed for global admins, like the popup. */
  initialLayout: HomepageLayoutEntry[] | null;
}) {
  const [activeTab, setActiveTab] = useState<'items' | 'colleges' | 'appearance' | 'popup' | 'layout'>('items');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-navy md:text-3xl flex items-center gap-3">
          <Layout className="h-8 w-8 text-crimson" />
          Homepage
        </h1>
        <p className="text-sm text-slate-500">Manage everything that appears on the homepage — slides, content items, and visual appearance.</p>
      </div>

      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('items')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition ${activeTab === 'items' ? 'border-crimson text-navy' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
        >
          <Grid className="h-4 w-4" />
          <span>Homepage Items</span>
        </button>
        <button
          onClick={() => setActiveTab('colleges')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition ${activeTab === 'colleges' ? 'border-crimson text-navy' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
        >
          <School className="h-4 w-4" />
          <span>College Pages</span>
        </button>
        <button
          onClick={() => setActiveTab('appearance')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition ${activeTab === 'appearance' ? 'border-crimson text-navy' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
        >
          <Palette className="h-4 w-4" />
          <span>Hero Appearance</span>
        </button>
        {initialLayout && (
          <button
            onClick={() => setActiveTab('layout')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition ${activeTab === 'layout' ? 'border-crimson text-navy' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
          >
            <ListOrdered className="h-4 w-4" />
            <span>Layout</span>
          </button>
        )}
        {initialPopup && (
          <button
            onClick={() => setActiveTab('popup')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition ${activeTab === 'popup' ? 'border-crimson text-navy' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
          >
            <Megaphone className="h-4 w-4" />
            <span>Popup</span>
          </button>
        )}
      </div>

      <div>
        {activeTab === 'items' && <HomepageItemsManager userId={admin.id} />}
        {activeTab === 'colleges' && <CollegePagesPanel />}
        {activeTab === 'appearance' && <HeroAppearancePanel initialAppearance={initialAppearance} />}
        {activeTab === 'layout' && initialLayout && <HomepageLayoutPanel initialLayout={initialLayout} userId={admin.id} />}
        {activeTab === 'popup' && initialPopup && <HomePopupPanel initialPopup={initialPopup} userId={admin.id} />}
      </div>
    </div>
  );
}

const ITEM_TYPE_LABELS: Record<string, string> = {
  hero: 'Hero Section',
  carousel_slide: 'Carousel Slides',
  promo_card: 'Promo / CTA Card',
  stat: 'Stats Strip',
  why_choose: 'Why Choose Us',
  campus_life_tile: 'Campus Life Tiles',
  trust_badge: 'Trust Badges',
  quick_link: 'Quick Links (no longer shown on site)',
  hero_slide: 'Hero Slides (legacy)',
  job: 'Job Listings',
};

const ITEM_TYPES = Object.keys(ITEM_TYPE_LABELS).filter((t) => t !== 'quick_link' && t !== 'hero_slide');

// Keys must match CAMPUS_LIFE_SECTION_PATHS in src/lib/homepage.functions.ts.
const CAMPUS_LIFE_SECTIONS = [
  { value: 'overview', label: 'Overview' },
  { value: 'facilities', label: 'Facilities' },
  { value: 'student_groups', label: 'Student Groups' },
  { value: 'events', label: 'Events' },
  { value: 'sports_and_athletics', label: 'Sports & Athletics' },
  { value: 'nss_ncc', label: 'NSS / NCC' },
];

const TILE_LINK_TYPE_LABELS: Record<string, string> = {
  custom: 'Custom URL',
  facility: 'Facility',
  student_club: 'Student Club',
  event: 'Event',
  section: 'Campus Life section',
  none: 'No link (photo + text only)',
};

const EMPTY_FORM = {
  item_type: 'stat',
  scope_type: 'global',
  college_id: null as string | null,
  title: '',
  subtitle: '',
  body: '',
  icon_name: '',
  eyebrow: '',
  title_accent: '',
  image_url: '',
  link_href: '',
  link_label: '',
  link_entity_type: 'custom' as string | null,
  link_entity_id: null as string | null,
  secondary_link_href: '',
  secondary_link_label: '',
  sort_order: 10,
  is_active: true,
  status: 'published',
  // slot (e.g. home_cta_banner), textSizes and image_alt live here — edited
  // via the typed MetadataEditor, not raw JSON.
  metadata: {} as Record<string, any>,
};

function HomepageItemsManager({ userId }: { userId: string | undefined }) {
  const supabase = useMemo(() => createClient(), []);
  const [colleges, setColleges] = useState<{ id: string; name: string; code: string }[]>([]);
  const [selectedScope, setSelectedScope] = useState<'global' | string>('global');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [entityOptions, setEntityOptions] = useState<{ id: string; label: string }[]>([]);
  const [loadingEntityOptions, setLoadingEntityOptions] = useState(false);

  useEffect(() => {
    if (form.item_type !== 'campus_life_tile') return;
    const type = form.link_entity_type;
    if (type !== 'facility' && type !== 'student_club' && type !== 'event') {
      setEntityOptions([]);
      return;
    }
    const table = type === 'facility' ? 'facilities' : type === 'student_club' ? 'student_clubs' : 'events';
    const nameColumn = type === 'event' ? 'title' : 'name';
    setLoadingEntityOptions(true);
    let query = (supabase as any)
      .from(table)
      .select(`id, ${nameColumn}`)
      .eq('status', 'published')
      .eq('has_detail_page', true)
      .is('deleted_at', null);
    // Facilities rows with a department_id are labs — they resolve via
    // /departments/[dept]/labs/[slug], not the campus-life facilities path.
    if (type === 'facility') query = query.is('department_id', null);
    query
      .order(nameColumn, { ascending: true })
      .then(({ data, error }: any) => {
        if (error) {
          toast.error(`Failed to load ${TILE_LINK_TYPE_LABELS[type]} options: ${error.message}`);
          setEntityOptions([]);
        } else {
          setEntityOptions((data || []).map((row: any) => ({ id: row.id, label: row[nameColumn] })));
        }
        setLoadingEntityOptions(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.item_type, form.link_entity_type]);

  useEffect(() => {
    supabase
      .from('colleges')
      .select('id, name, code')
      .order('sort_order', { ascending: true })
      .then(({ data }) => setColleges(data || []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedScope]);

  async function loadItems() {
    setLoading(true);
    try {
      let query = (supabase as any)
        .from('homepage_items')
        .select(
          'id, item_type, scope_type, college_id, title, subtitle, body, icon_name, eyebrow, title_accent, image_url, link_href, link_label, link_entity_type, link_entity_id, secondary_link_href, secondary_link_label, metadata, sort_order, is_active, status'
        )
        .is('deleted_at', null)
        .order('item_type', { ascending: true })
        .order('sort_order', { ascending: true });

      if (selectedScope === 'global') {
        query = query.eq('scope_type', 'global');
      } else {
        query = query.eq('scope_type', 'college').eq('college_id', selectedScope);
      }

      const { data, error } = await query;
      if (error) throw error;
      setItems(data || []);
    } catch (err: any) {
      toast.error(`Failed to load items: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditingItem(null);
    setForm({
      ...EMPTY_FORM,
      scope_type: selectedScope === 'global' ? 'global' : 'college',
      college_id: selectedScope === 'global' ? null : selectedScope,
    });
    setIsModalOpen(true);
  }

  function openEdit(item: any) {
    setEditingItem(item);
    setForm({
      item_type: item.item_type || 'stat',
      scope_type: item.scope_type || 'global',
      college_id: item.college_id || null,
      title: item.title || '',
      subtitle: item.subtitle || '',
      body: item.body || '',
      icon_name: item.icon_name || '',
      eyebrow: item.eyebrow || '',
      title_accent: item.title_accent || '',
      image_url: item.image_url || '',
      link_href: item.link_href || '',
      link_label: item.link_label || '',
      link_entity_type: item.link_entity_type || 'custom',
      link_entity_id: item.link_entity_id || null,
      secondary_link_href: item.secondary_link_href || '',
      secondary_link_label: item.secondary_link_label || '',
      sort_order: item.sort_order ?? 10,
      is_active: item.is_active ?? true,
      status: item.status || 'published',
      metadata: item.metadata ?? {},
    });
    setIsModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      const isTile = form.item_type === 'campus_life_tile';
      const linkEntityType = isTile ? form.link_entity_type : null;
      const payload: any = {
        ...form,
        college_id: form.scope_type === 'college' ? form.college_id : null,
        link_entity_type: linkEntityType,
        link_entity_id: linkEntityType === 'facility' || linkEntityType === 'student_club' || linkEntityType === 'event'
          ? form.link_entity_id
          : null,
        link_href:
          linkEntityType === 'custom' || linkEntityType === 'section' || !isTile
            ? form.link_href
            : null,
      };

      if (editingItem) {
        const { error } = await (supabase as any).from('homepage_items').update(payload).eq('id', editingItem.id);
        if (error) throw error;
        toast.success('Item updated!');
      } else {
        const { error } = await (supabase as any).from('homepage_items').insert({ ...payload, created_by: userId });
        if (error) throw error;
        toast.success('Item created!');
      }
      setIsModalOpen(false);
      loadItems();
    } catch (err: any) {
      toast.error(`Save failed: ${err.message}`);
    }
  }

  async function handleDelete(item: any) {
    if (!confirm('Delete this item? It will move to the trash.')) return;
    const { error } = await (supabase as any).from('homepage_items').update({ deleted_at: new Date().toISOString(), deleted_by: userId }).eq('id', item.id);
    if (error) toast.error(error.message);
    else {
      toast.success('Deleted!');
      loadItems();
    }
  }

  const grouped = items.reduce((acc, item) => {
    const key = item.item_type || 'other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  // The homepage bottom banner's button text is the site-wide cta_button_label
  // setting (Settings → Call to Action), not this card's link_label.
  const isCtaBannerItem =
    form.item_type === 'promo_card' && (editingItem?.metadata as any)?.slot === 'home_cta_banner';

  const f = (key: keyof typeof EMPTY_FORM, val: any) => setForm((p) => ({ ...p, [key]: val }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-4">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mr-1">Scope:</span>
        <button
          onClick={() => setSelectedScope('global')}
          className={`rounded px-3 py-1.5 text-xs font-semibold transition ${selectedScope === 'global' ? 'bg-navy text-white' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}
        >
          Global
        </button>
        {colleges.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedScope(c.id)}
            className={`rounded px-3 py-1.5 text-xs font-semibold transition ${selectedScope === c.id ? 'bg-navy text-white' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}
          >
            {c.code}
          </button>
        ))}
        <button onClick={openAdd} className="ml-auto flex items-center gap-2 rounded bg-crimson px-4 py-1.5 text-xs font-semibold text-white hover:bg-crimson/90">
          <Plus className="h-3.5 w-3.5" /> Add Item
        </button>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-crimson" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <Grid className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-sm font-bold text-navy">No items for this scope</h3>
          <p className="mt-2 text-xs text-slate-500">
            Add stats, trust badges, or why-choose items — they&apos;ll appear on the {selectedScope === 'global' ? 'global (all colleges)' : colleges.find((c) => c.id === selectedScope)?.code ?? 'selected college'} landing page.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([type, typeItems]) => (
            <div key={type} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-navy">{ITEM_TYPE_LABELS[type] ?? type}</span>
                <span className="text-xs text-slate-400">
                  {(typeItems as any[]).length} item{(typeItems as any[]).length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {(typeItems as any[]).map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition">
                    <div className="flex items-center gap-3 min-w-0">
                      {item.image_url && <img src={item.image_url} alt="" className="h-10 w-16 rounded object-cover shrink-0 border border-slate-200" />}
                      <div className="min-w-0">
                        {item.eyebrow && <div className="text-[10px] font-semibold uppercase tracking-widest text-gold">{item.eyebrow}</div>}
                        <div className="text-sm font-semibold text-slate-800 truncate">{item.title || '(no title)'}</div>
                        {item.subtitle && <div className="text-xs text-slate-500 truncate">{item.subtitle}</div>}
                        {item.icon_name && <div className="mt-0.5 font-mono text-[10px] text-slate-400">{item.icon_name}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${item.status === 'published' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}
                      >
                        {item.status}
                      </span>
                      <button onClick={() => openEdit(item)} className="rounded p-1 text-slate-500 hover:text-navy hover:bg-slate-100 transition">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(item)} className="rounded p-1 text-slate-500 hover:text-rose-500 hover:bg-rose-50 transition">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4">
          <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="mb-4 font-display text-lg font-bold text-navy">{editingItem ? 'Edit Item' : 'Add Homepage Item'}</h3>
            <form onSubmit={handleSave} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-slate-600">Item Type</label>
                <select value={form.item_type} onChange={(e) => f('item_type', e.target.value)} className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none">
                  {ITEM_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {ITEM_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>


              {['hero', 'carousel_slide', 'promo_card', 'hero_slide', 'campus_life_tile'].includes(form.item_type) && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-600">
                    {form.item_type === 'campus_life_tile' ? 'Category Label (e.g. "Facilities")' : 'Eyebrow / Kicker'}
                  </label>
                  <input
                    value={form.eyebrow}
                    onChange={(e) => f('eyebrow', e.target.value)}
                    placeholder='e.g. "Admissions Open 2026–27"'
                    className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-slate-600">{form.item_type === 'stat' ? 'Value (e.g. "5000+")' : 'Title'}</label>
                <input
                  required={form.item_type !== 'hero'}
                  value={form.title}
                  onChange={(e) => f('title', e.target.value)}
                  className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none"
                />
              </div>

              {form.item_type === 'hero' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-600">Title Accent (highlighted word)</label>
                  <input
                    value={form.title_accent}
                    onChange={(e) => f('title_accent', e.target.value)}
                    placeholder="word in title to highlight in gold"
                    className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none"
                  />
                </div>
              )}

              {['stat', 'why_choose', 'carousel_slide', 'hero', 'promo_card'].includes(form.item_type) && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-600">{form.item_type === 'stat' ? 'Label (e.g. "Students")' : 'Subtitle'}</label>
                  <input
                    value={form.subtitle}
                    onChange={(e) => f('subtitle', e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none"
                  />
                </div>
              )}

              {['why_choose', 'job', 'hero_slide', 'hero', 'promo_card', 'carousel_slide'].includes(form.item_type) && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-600">Body / Description</label>
                  <textarea
                    rows={3}
                    value={form.body}
                    onChange={(e) => f('body', e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none"
                  />
                </div>
              )}

              {['why_choose', 'trust_badge', 'quick_link'].includes(form.item_type) && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-600">Icon Name (Lucide)</label>
                  <input
                    value={form.icon_name}
                    onChange={(e) => f('icon_name', e.target.value)}
                    placeholder="e.g. BadgeCheck, GraduationCap, Briefcase, Building2"
                    className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none"
                  />
                </div>
              )}

              {['hero', 'carousel_slide', 'promo_card', 'hero_slide', 'campus_life_tile'].includes(form.item_type) && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-600">Image</label>
                  <MediaUploader value={form.image_url} onChange={(url) => f('image_url', url)} bucketName="media" />
                </div>
              )}

              {form.item_type === 'campus_life_tile' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-600">Link Type</label>
                  <select
                    value={form.link_entity_type ?? 'custom'}
                    onChange={(e) => {
                      f('link_entity_type', e.target.value);
                      f('link_entity_id', null);
                      f('link_href', '');
                    }}
                    className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none"
                  >
                    {Object.entries(TILE_LINK_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {form.item_type === 'campus_life_tile' &&
                (form.link_entity_type === 'facility' ||
                  form.link_entity_type === 'student_club' ||
                  form.link_entity_type === 'event') && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-slate-600">
                      {TILE_LINK_TYPE_LABELS[form.link_entity_type]}
                    </label>
                    <select
                      value={form.link_entity_id ?? ''}
                      onChange={(e) => f('link_entity_id', e.target.value || null)}
                      disabled={loadingEntityOptions}
                      className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none"
                    >
                      <option value="">
                        {loadingEntityOptions ? 'Loading…' : 'Select one…'}
                      </option>
                      {entityOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-500">
                      Links to that {TILE_LINK_TYPE_LABELS[form.link_entity_type].toLowerCase()}'s own page. If it's
                      later unpublished or its page is turned off, the tile stays but stops being clickable.
                    </p>
                  </div>
                )}

              {form.item_type === 'campus_life_tile' && form.link_entity_type === 'section' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-600">Campus Life section</label>
                  <select
                    value={form.link_href}
                    onChange={(e) => f('link_href', e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none"
                  >
                    <option value="">Select one…</option>
                    {CAMPUS_LIFE_SECTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(form.item_type !== 'campus_life_tile' || form.link_entity_type === 'custom') &&
                ['hero', 'carousel_slide', 'promo_card', 'quick_link', 'hero_slide', 'campus_life_tile'].includes(
                  form.item_type,
                ) && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-slate-600">
                      {form.item_type === 'campus_life_tile' ? 'Custom URL' : 'CTA Link'}
                    </label>
                    <input
                      value={form.link_href}
                      onChange={(e) => f('link_href', e.target.value)}
                      placeholder="/admissions"
                      className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none"
                    />
                  </div>
                )}

              {form.item_type !== 'campus_life_tile' &&
                ['hero', 'carousel_slide', 'promo_card', 'quick_link', 'hero_slide'].includes(form.item_type) && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-slate-600">CTA Label</label>
                    {isCtaBannerItem ? (
                      <p className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                        Button text comes from Settings → Call to Action (global admin only).
                      </p>
                    ) : (
                      <input
                        value={form.link_label}
                        onChange={(e) => f('link_label', e.target.value)}
                        placeholder="Enquire Now"
                        className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none"
                      />
                    )}
                  </div>
                )}

              {form.item_type === 'promo_card' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-slate-600">Secondary Link</label>
                    <input
                      value={form.secondary_link_href}
                      onChange={(e) => f('secondary_link_href', e.target.value)}
                      placeholder="/downloads"
                      className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-slate-600">Secondary Label</label>
                    <input
                      value={form.secondary_link_label}
                      onChange={(e) => f('secondary_link_label', e.target.value)}
                      placeholder="Download Brochure"
                      className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <MetadataEditor value={form.metadata} onChange={(v) => f('metadata', v)} />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-600">Sort Order</label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => f('sort_order', Number(e.target.value))}
                    className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-600">Status</label>
                  <select value={form.status} onChange={(e) => f('status', e.target.value)} className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none">
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="hpi_active" checked={form.is_active} onChange={(e) => f('is_active', e.target.checked)} className="h-4 w-4 rounded border-slate-200 text-crimson" />
                <label htmlFor="hpi_active" className="text-sm text-slate-600">
                  Active
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded border border-slate-200 px-4 py-2 text-xs text-slate-500 hover:text-navy">
                  Cancel
                </button>
                <button type="submit" className="rounded bg-crimson px-4 py-2 text-xs font-semibold text-white hover:bg-crimson/90">
                  {editingItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
