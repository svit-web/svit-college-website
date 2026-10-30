'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Edit2,
  ExternalLink,
  LibraryBig,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react';
import { EntryPhotosEditor } from '@/components/admin-next/EntryPhotosEditor';
import {
  LIBRARY_INFO_KIND_OPTIONS,
  LIBRARY_RESOURCE_CATEGORY_OPTIONS,
} from '@/lib/admin-option-sets';
import { LIBRARY_PATH } from '@/lib/library-paths';
import {
  deleteLibraryRow,
  getLibraryFacility,
  listColleges,
  listDepartments,
  listLibraryRows,
  reorderLibraryRows,
  updateLibraryFacility,
  upsertLibraryRow,
  type LibraryFacilityRow,
  type LibraryInfoRow,
  type LibraryListTable,
  type LibraryResourceRow,
  type Option,
} from '@/lib/library-admin';

// One admin home for /campus-life/central-library. The page's core lives on
// the 'library' facilities row (overview, photos, highlights, book counts,
// staff department); the lists live in library_resources / library_info_items.

const input =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-crimson focus:outline-none';
const label = 'text-xs font-semibold text-slate-600 uppercase';
const primaryBtn =
  'flex items-center gap-2 rounded-lg bg-crimson px-4 py-2 text-sm font-semibold text-white hover:bg-crimson/90 transition disabled:opacity-60';
const secondaryBtn =
  'rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition';
const card = 'rounded-xl border border-slate-200 bg-white p-6 shadow-sm';

type TabKey =
  | 'overview'
  | 'highlights'
  | 'collection'
  | 'staff'
  | 'resources'
  | 'stat'
  | 'timing'
  | 'service'
  | 'rule'
  | 'contact'
  | 'downloads';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview & Photos' },
  { key: 'highlights', label: 'Highlights' },
  { key: 'collection', label: 'Books per college' },
  { key: 'stat', label: 'Key figures' },
  { key: 'timing', label: 'Timings' },
  { key: 'resources', label: 'E-resources' },
  { key: 'service', label: 'Services' },
  { key: 'rule', label: 'Rules' },
  { key: 'staff', label: 'Staff' },
  { key: 'contact', label: 'Contacts' },
  { key: 'downloads', label: 'Downloads' },
];

const INFO_COPY: Record<string, { hint: string; valueLabel: string; titleLabel: string }> = {
  stat: {
    hint: 'Figures shown in the strip at the top of the page, e.g. "30,000+" Titles. The total book count from "Books per college" is added automatically.',
    valueLabel: 'Figure (e.g. 30,000+)',
    titleLabel: 'Label (e.g. Titles)',
  },
  timing: {
    hint: 'Opening hours, one row per period, e.g. "Monday – Friday" → "9:00 AM – 6:00 PM".',
    valueLabel: 'Hours',
    titleLabel: 'Days / period',
  },
  service: {
    hint: 'Services such as Book-bank, Reprography, Inter-library loan. The short value shows as a tag (e.g. "Free").',
    valueLabel: 'Tag (optional)',
    titleLabel: 'Service',
  },
  rule: {
    hint: 'Numbered rules and code of conduct. The value shows next to the title (e.g. "₹2 per day" for a fine).',
    valueLabel: 'Value (optional)',
    titleLabel: 'Rule',
  },
  contact: {
    hint: 'Contact lines, e.g. "Email" → library@svitvasad.ac.in. Emails and phone numbers become clickable.',
    valueLabel: 'Email / phone / text',
    titleLabel: 'Label',
  },
};

export function AdminLibraryPage({ canManageStaff = true }: { canManageStaff?: boolean }) {
  const [tab, setTab] = useState<TabKey>('overview');
  const [facility, setFacility] = useState<LibraryFacilityRow | null>(null);
  const [loading, setLoading] = useState(true);

  const reloadFacility = useCallback(async () => {
    try {
      setFacility(await getLibraryFacility());
    } catch (e) {
      toast.error(errorMessage(e, 'Failed to load the Central Library'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadFacility();
  }, [reloadFacility]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-navy">
            <LibraryBig className="h-5 w-5 text-crimson" />
            Central Library
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Everything shown on the public Central Library page.
          </p>
        </div>
        <a href={LIBRARY_PATH} target="_blank" rel="noopener noreferrer" className={secondaryBtn}>
          <span className="flex items-center gap-2">
            View page <ExternalLink className="h-4 w-4" />
          </span>
        </a>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-crimson" />
        </div>
      ) : !facility ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          The Central Library record (facility slug <code>library</code>) could not be loaded. Either
          your account can&apos;t read it — ask a site administrator to give you the{' '}
          <strong>Library</strong> section at Global scope — or it is missing / in Trash: restore it
          from Trash &amp; Recovery, or create a facility with slug <code>library</code> under
          Academics → Facilities.
        </div>
      ) : (
        <>
          <HealthBanner facility={facility} onFixed={reloadFacility} />

          <div className="flex flex-wrap gap-1 border-b border-slate-200">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={
                  'rounded-t-lg px-3 py-2 text-sm font-semibold transition ' +
                  (tab === t.key
                    ? 'border border-b-white border-slate-200 bg-white text-crimson -mb-px'
                    : 'text-slate-500 hover:text-navy')
                }
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'overview' && <OverviewTab facility={facility} onSaved={reloadFacility} />}
          {tab === 'highlights' && <HighlightsTab facility={facility} onSaved={reloadFacility} />}
          {tab === 'collection' && <CollectionTab facility={facility} onSaved={reloadFacility} />}
          {tab === 'staff' && (
            <StaffTab facility={facility} onSaved={reloadFacility} canManageStaff={canManageStaff} />
          )}
          {tab === 'resources' && <ResourcesTab />}
          {(tab === 'stat' ||
            tab === 'timing' ||
            tab === 'service' ||
            tab === 'rule' ||
            tab === 'contact') && <InfoTab key={tab} kind={tab} />}
          {tab === 'downloads' && <DownloadsTab />}
        </>
      )}
    </div>
  );
}

// -------- Health --------

// The two states that silently hide the public page: not published, or a
// department_id (which marks the row as a department lab).
function HealthBanner({
  facility,
  onFixed,
}: {
  facility: LibraryFacilityRow;
  onFixed: () => void;
}) {
  const [fixing, setFixing] = useState(false);
  const problems: string[] = [];
  if (facility.status !== 'published')
    problems.push(`its status is "${facility.status}", not Published`);
  if (facility.department_id)
    problems.push('it is linked to a department, so the site treats it as a department lab');
  if (problems.length === 0) return null;

  async function fix() {
    setFixing(true);
    try {
      await updateLibraryFacility(facility.id, { status: 'published', department_id: null });
      toast.success('Central Library is live again');
      onFixed();
    } catch (e) {
      toast.error(errorMessage(e, 'Fix failed'));
    } finally {
      setFixing(false);
    }
  }

  return (
    <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
      <div className="flex gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <div className="font-semibold">The public Central Library page is hidden</div>
          <div>Because {problems.join(' and ')}.</div>
        </div>
      </div>
      <button type="button" onClick={fix} disabled={fixing} className={primaryBtn}>
        {fixing && <Loader2 className="h-4 w-4 animate-spin" />} Publish &amp; fix
      </button>
    </div>
  );
}

// -------- Overview --------

function OverviewTab({ facility, onSaved }: { facility: LibraryFacilityRow; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: facility.name,
    subtitle: facility.subtitle ?? '',
    description: facility.description ?? '',
    status: facility.status,
  });
  const [albumId, setAlbumId] = useState(facility.album_id);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      await updateLibraryFacility(facility.id, {
        name: form.name.trim(),
        subtitle: form.subtitle.trim() || null,
        description: form.description.trim() || null,
        status: form.status,
      });
      toast.success('Overview saved');
      onSaved();
    } catch (e) {
      toast.error(errorMessage(e, 'Save failed'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className={card + ' space-y-4'}>
        <div className="space-y-1">
          <label className={label}>Name *</label>
          <input
            className={input}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <label className={label}>Subtitle (e.g. 30,000+ resources)</label>
          <input
            className={input}
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <label className={label}>About the library</label>
          <textarea
            rows={7}
            className={input}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <label className={label}>Status</label>
          <select
            className={input}
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value as LibraryFacilityRow['status'] })
            }
          >
            <option value="published">Published</option>
            <option value="draft">Draft (page hidden)</option>
          </select>
        </div>
        <div className="flex justify-end">
          <button type="button" onClick={save} disabled={saving} className={primaryBtn}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save overview
          </button>
        </div>
      </div>

      <div className={card}>
        <EntryPhotosEditor
          tableId="facilities"
          recordId={facility.id}
          primaryKey="id"
          values={{ name: facility.name, album_id: albumId }}
          onChange={(name, value) => {
            if (name === 'album_id') setAlbumId(value);
          }}
          hasDetailPageField={false}
          onRequireSave={async () => facility.id}
        />
      </div>
    </div>
  );
}

// -------- Highlights (metadata.highlights) --------

function HighlightsTab({
  facility,
  onSaved,
}: {
  facility: LibraryFacilityRow;
  onSaved: () => void;
}) {
  const [items, setItems] = useState<{ title: string; description: string }[]>(() =>
    (facility.metadata?.highlights ?? []).map((h: { title?: string; description?: string }) => ({
      title: h.title ?? '',
      description: h.description ?? '',
    })),
  );
  const [saving, setSaving] = useState(false);

  const update = (i: number, patch: Partial<{ title: string; description: string }>) =>
    setItems((prev) => prev.map((it, j) => (j === i ? { ...it, ...patch } : it)));

  async function save() {
    const clean = items
      .map((h) => ({ title: h.title.trim(), description: h.description.trim() }))
      .filter((h) => h.title);
    setSaving(true);
    try {
      await updateLibraryFacility(facility.id, {}, { highlights: clean });
      toast.success('Highlights saved');
      onSaved();
    } catch (e) {
      toast.error(errorMessage(e, 'Save failed'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={card + ' space-y-4'}>
      <p className="text-sm text-slate-500">
        Cards under “What makes it special”. Rows without a title are dropped on save.
      </p>
      {items.map((h, i) => (
        <div key={i} className="flex gap-3 rounded-lg border border-slate-200 p-3">
          <div className="flex-1 space-y-2">
            <input
              className={input}
              placeholder="Title"
              value={h.title}
              onChange={(e) => update(i, { title: e.target.value })}
            />
            <textarea
              rows={2}
              className={input}
              placeholder="Description"
              value={h.description}
              onChange={(e) => update(i, { description: e.target.value })}
            />
          </div>
          <RowControls
            index={i}
            count={items.length}
            onMove={(to) => setItems((prev) => move(prev, i, to))}
            onDelete={() => setItems((prev) => prev.filter((_, j) => j !== i))}
          />
        </div>
      ))}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setItems([...items, { title: '', description: '' }])}
          className={secondaryBtn}
        >
          <span className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add highlight
          </span>
        </button>
        <button type="button" onClick={save} disabled={saving} className={primaryBtn}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save highlights
        </button>
      </div>
    </div>
  );
}

// -------- Books per college (metadata.institute_libraries) --------

function CollectionTab({
  facility,
  onSaved,
}: {
  facility: LibraryFacilityRow;
  onSaved: () => void;
}) {
  const [colleges, setColleges] = useState<Option[] | null>(null);
  const [counts, setCounts] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      (facility.metadata?.institute_libraries ?? []).map(
        (l: { college_id: string; book_count?: number }) => [
          l.college_id,
          String(l.book_count ?? ''),
        ],
      ),
    ),
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listColleges().then(setColleges, (e) =>
      toast.error(errorMessage(e, 'Failed to load colleges')),
    );
  }, []);

  const total = Object.values(counts).reduce((sum, v) => sum + (Number(v) || 0), 0);

  async function save() {
    const rows = Object.entries(counts)
      .filter(([, v]) => v.trim() !== '' && Number(v) > 0)
      .map(([college_id, v]) => ({ college_id, book_count: Math.round(Number(v)) }));
    setSaving(true);
    try {
      await updateLibraryFacility(facility.id, {}, { institute_libraries: rows });
      toast.success('Book counts saved');
      onSaved();
    } catch (e) {
      toast.error(errorMessage(e, 'Save failed'));
    } finally {
      setSaving(false);
    }
  }

  if (!colleges) return <Spinner />;
  return (
    <div className={card + ' space-y-4'}>
      <p className="text-sm text-slate-500">
        Books held for each college. Leave blank to leave a college out. The page shows the total (
        {total.toLocaleString('en-IN')}) in the top strip and, with two or more colleges, a
        per-college list.
      </p>
      <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
        {colleges.map((c) => (
          <div key={c.id} className="flex items-center justify-between gap-4 px-4 py-2">
            <span className="text-sm text-slate-800">{c.name}</span>
            <input
              type="number"
              min={0}
              className={input + ' max-w-[160px] text-right'}
              value={counts[c.id] ?? ''}
              onChange={(e) => setCounts({ ...counts, [c.id]: e.target.value })}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <button type="button" onClick={save} disabled={saving} className={primaryBtn}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save book counts
        </button>
      </div>
    </div>
  );
}

// -------- Staff (metadata.staff_department_id) --------

function StaffTab({
  facility,
  onSaved,
  canManageStaff,
}: {
  facility: LibraryFacilityRow;
  onSaved: () => void;
  canManageStaff: boolean;
}) {
  const [departments, setDepartments] = useState<(Option & { code: string | null })[] | null>(null);
  const [deptId, setDeptId] = useState<string>(facility.metadata?.staff_department_id ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listDepartments().then(setDepartments, (e) =>
      toast.error(errorMessage(e, 'Failed to load departments')),
    );
  }, []);

  async function save() {
    setSaving(true);
    try {
      await updateLibraryFacility(facility.id, {}, { staff_department_id: deptId || null });
      toast.success('Staff source saved');
      onSaved();
    } catch (e) {
      toast.error(errorMessage(e, 'Save failed'));
    } finally {
      setSaving(false);
    }
  }

  if (!departments) return <Spinner />;
  return (
    <div className={card + ' space-y-4'}>
      <p className="text-sm text-slate-500">
        The “Library team” section lists every published staff member assigned to this department,
        using their designation, photo and email from their staff profile.{' '}
        {canManageStaff ? (
          <>
            Add or edit people in{' '}
            <Link href="/admin/staff-wizards" className="font-semibold text-crimson hover:underline">
              Staff Profiles
            </Link>
            .
          </>
        ) : (
          'To add or edit people, ask a site administrator.'
        )}
      </p>
      <div className="max-w-md space-y-1">
        <label className={label}>Staff come from department</label>
        <select className={input} value={deptId} onChange={(e) => setDeptId(e.target.value)}>
          <option value="">— Don’t show a staff section —</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
              {d.code ? ` (${d.code})` : ''}
            </option>
          ))}
        </select>
      </div>
      <div className="flex justify-end">
        <button type="button" onClick={save} disabled={saving} className={primaryBtn}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save
        </button>
      </div>
    </div>
  );
}

// -------- Lists (library_resources / library_info_items) --------

type FieldDef = {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'select' | 'url';
  options?: { value: string; label: string }[];
  required?: boolean;
  help?: string;
};

function ResourcesTab() {
  return (
    <ListManager<LibraryResourceRow>
      table="library_resources"
      noun="e-resource"
      hint="E-journals, databases and digital libraries show as cards. Catalogue (OPAC) and Remote access portal entries show as buttons at the top of the page."
      blank={{
        name: '',
        category: 'e_journal',
        publisher: null,
        description: null,
        website_url: null,
        access_note: null,
        logo_url: null,
        sort_order: 0,
        status: 'published',
      }}
      fields={[
        { key: 'name', label: 'Name', required: true },
        {
          key: 'category',
          label: 'Type',
          type: 'select',
          options: LIBRARY_RESOURCE_CATEGORY_OPTIONS,
        },
        { key: 'publisher', label: 'Publisher' },
        {
          key: 'website_url',
          label: 'Link',
          type: 'url',
          help: 'Full link starting with https://',
        },
        { key: 'description', label: 'Description', type: 'textarea' },
        {
          key: 'access_note',
          label: 'Access note',
          help: 'e.g. “Login with your college email when off campus”',
        },
        {
          key: 'logo_url',
          label: 'Logo image URL',
          type: 'url',
          help: 'Optional; a book icon is shown otherwise',
        },
      ]}
      columns={(r) => [
        r.name,
        LIBRARY_RESOURCE_CATEGORY_OPTIONS.find((o) => o.value === r.category)?.label ?? r.category,
        r.website_url ?? '—',
      ]}
      headers={['Name', 'Type', 'Link']}
    />
  );
}

function InfoTab({
  kind,
}: {
  kind: Exclude<
    TabKey,
    'overview' | 'highlights' | 'collection' | 'staff' | 'resources' | 'downloads'
  >;
}) {
  const copy = INFO_COPY[kind];
  const kindLabel = LIBRARY_INFO_KIND_OPTIONS.find((o) => o.value === kind)?.label ?? kind;
  return (
    <ListManager<LibraryInfoRow>
      table="library_info_items"
      filter={(r) => r.kind === kind}
      noun={kindLabel.toLowerCase()}
      hint={copy.hint}
      blank={{
        kind,
        title: '',
        value: null,
        description: null,
        sort_order: 0,
        status: 'published',
      }}
      fields={[
        { key: 'title', label: copy.titleLabel, required: true },
        { key: 'value', label: copy.valueLabel },
        { key: 'description', label: 'Details (optional)', type: 'textarea' },
      ]}
      columns={(r) => [r.title, r.value ?? '—']}
      headers={[copy.titleLabel, copy.valueLabel]}
    />
  );
}

function ListManager<T extends { id?: string; sort_order: number; status: string }>({
  table,
  filter,
  noun,
  hint,
  blank,
  fields,
  columns,
  headers,
}: {
  table: LibraryListTable;
  filter?: (row: T) => boolean;
  noun: string;
  hint: string;
  blank: T;
  fields: FieldDef[];
  columns: (row: T) => string[];
  headers: string[];
}) {
  const [rows, setRows] = useState<T[] | null>(null);
  const [editing, setEditing] = useState<T | null>(null);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const all = await listLibraryRows<T>(table);
      setRows(filter ? all.filter(filter) : all);
    } catch (e) {
      toast.error(errorMessage(e, 'Failed to load'));
      setRows([]);
    }
    // filter is a stable per-tab closure; table never changes for a mounted list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  useEffect(() => {
    load();
  }, [load]);

  const nextSort = useMemo(
    () => (rows ?? []).reduce((m, r) => Math.max(m, r.sort_order), 0) + 1,
    [rows],
  );

  async function save() {
    if (!editing) return;
    for (const f of fields) {
      const v = (editing as Record<string, unknown>)[f.key];
      if (f.required && !String(v ?? '').trim()) return toast.error(`${f.label} is required`);
      if (f.type === 'url' && v && !/^https?:\/\//i.test(String(v).trim()))
        return toast.error(`${f.label} must start with https:// or http://`);
    }
    const cleaned = Object.fromEntries(
      Object.entries(editing as Record<string, unknown>).map(([k, v]) => [
        k,
        typeof v === 'string' ? v.trim() || null : v,
      ]),
    ) as T;
    setSaving(true);
    try {
      await upsertLibraryRow(table, cleaned as unknown as LibraryResourceRow | LibraryInfoRow);
      toast.success(editing.id ? 'Saved' : 'Added');
      setEditing(null);
      await load();
    } catch (e) {
      toast.error(errorMessage(e, 'Save failed'));
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: T) {
    if (!row.id || !confirm(`Move this ${noun} to Trash?`)) return;
    setBusy(true);
    try {
      await deleteLibraryRow(table, row.id);
      toast.success('Moved to Trash');
      await load();
    } catch (e) {
      toast.error(errorMessage(e, 'Delete failed'));
    } finally {
      setBusy(false);
    }
  }

  async function reorder(from: number, to: number) {
    if (!rows) return;
    const next = move(rows, from, to);
    setRows(next);
    setBusy(true);
    try {
      await reorderLibraryRows(
        table,
        next.map((r) => ({ id: r.id!, sort_order: r.sort_order })),
      );
      await load();
    } catch (e) {
      toast.error(errorMessage(e, 'Reorder failed'));
      await load();
    } finally {
      setBusy(false);
    }
  }

  if (!rows) return <Spinner />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-2xl text-sm text-slate-500">{hint}</p>
        <button
          type="button"
          onClick={() => setEditing({ ...blank, sort_order: nextSort })}
          className={primaryBtn}
        >
          <Plus className="h-4 w-4" /> Add {noun}
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Nothing here yet — this section is hidden on the public page until you add one.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                {headers.map((h) => (
                  <th
                    key={h}
                    className="p-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600"
                  >
                    {h}
                  </th>
                ))}
                <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Status
                </th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r, i) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  {columns(r).map((c, j) => (
                    <td
                      key={j}
                      className={
                        'max-w-[280px] truncate p-3 ' +
                        (j === 0 ? 'font-medium text-navy' : 'text-slate-600')
                      }
                    >
                      {c}
                    </td>
                  ))}
                  <td className="p-3">
                    <span
                      className={
                        'rounded-full px-2 py-0.5 text-xs font-semibold ' +
                        (r.status === 'published'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700')
                      }
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        disabled={busy || i === 0}
                        onClick={() => reorder(i, i - 1)}
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-navy disabled:opacity-30"
                        aria-label="Move up"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={busy || i === rows.length - 1}
                        onClick={() => reorder(i, i + 1)}
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-navy disabled:opacity-30"
                        aria-label="Move down"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing({ ...r })}
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-navy"
                        aria-label="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => remove(r)}
                        className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-bold text-navy">
                {editing.id ? 'Edit' : 'Add'} {noun}
              </h2>
            </div>
            <div className="max-h-[70vh] space-y-4 overflow-y-auto p-6">
              {fields.map((f) => {
                const val = String((editing as Record<string, unknown>)[f.key] ?? '');
                const set = (v: string) => setEditing((p) => ({ ...p!, [f.key]: v }));
                return (
                  <div key={f.key} className="space-y-1">
                    <label className={label}>
                      {f.label}
                      {f.required && ' *'}
                    </label>
                    {f.type === 'textarea' ? (
                      <textarea
                        rows={3}
                        className={input}
                        value={val}
                        onChange={(e) => set(e.target.value)}
                      />
                    ) : f.type === 'select' ? (
                      <select className={input} value={val} onChange={(e) => set(e.target.value)}>
                        {f.options!.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className={input}
                        type={f.type === 'url' ? 'url' : 'text'}
                        value={val}
                        onChange={(e) => set(e.target.value)}
                      />
                    )}
                    {f.help && <p className="text-xs text-slate-400">{f.help}</p>}
                  </div>
                );
              })}
              <div className="space-y-1">
                <label className={label}>Status</label>
                <select
                  className={input}
                  value={editing.status}
                  onChange={(e) => setEditing((p) => ({ ...p!, status: e.target.value }))}
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft (hidden)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button type="button" onClick={() => setEditing(null)} className={secondaryBtn}>
                Cancel
              </button>
              <button type="button" onClick={save} disabled={saving} className={primaryBtn}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------- Downloads --------

function DownloadsTab() {
  return (
    <div className={card + ' space-y-3 text-sm text-slate-600'}>
      <p>
        The “Forms &amp; documents” section lists every published download whose category is{' '}
        <strong>Library</strong> — membership forms, new-arrival lists, question-paper banks.
      </p>
      <p>
        Upload or edit them in{' '}
        <Link href="/admin/tables/downloads" className="font-semibold text-crimson hover:underline">
          Downloads / Forms
        </Link>{' '}
        and pick the category “Library (shown on Central Library page)”.
      </p>
    </div>
  );
}

// -------- Shared bits --------

function RowControls({
  index,
  count,
  onMove,
  onDelete,
}: {
  index: number;
  count: number;
  onMove: (to: number) => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        disabled={index === 0}
        onClick={() => onMove(index - 1)}
        className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-navy disabled:opacity-30"
        aria-label="Move up"
      >
        <ArrowUp className="h-4 w-4" />
      </button>
      <button
        type="button"
        disabled={index === count - 1}
        onClick={() => onMove(index + 1)}
        className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-navy disabled:opacity-30"
        aria-label="Move down"
      >
        <ArrowDown className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
        aria-label="Remove"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function errorMessage(e: unknown, fallback: string): string {
  return (e as { message?: string } | null)?.message || fallback;
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-6 w-6 animate-spin text-crimson" />
    </div>
  );
}

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
