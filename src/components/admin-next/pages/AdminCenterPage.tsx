"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Edit2,
  ExternalLink,
  Loader2,
  Plus,
  Search,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { EntryPhotosEditor } from "@/components/admin-next/EntryPhotosEditor";
import { CENTER_MEMBER_GROUP_OPTIONS, CENTER_PROGRAM_TYPE_OPTIONS } from "@/lib/admin-option-sets";
import {
  deleteCenterRow,
  getCenter,
  listCenterRows,
  listLinkableRows,
  listStaffOptions,
  reorderCenterRows,
  setRowCenter,
  updateCenter,
  upsertCenterRow,
  type CenterLinkTable,
  type CenterListTable,
  type CenterRow,
  type LinkableRow,
  type Option,
} from "@/lib/center-admin";

// One admin home per dedicated centre page (CoE, NSS / NCC). The page's core
// lives on the centers row (overview, photos, highlights, lab); the lists live
// in center_equipment / center_programs / center_members; MoUs, events and
// achievements are existing rows tagged with center_id.

const input =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-crimson focus:outline-none";
const label = "text-xs font-semibold text-slate-600 uppercase";
const primaryBtn =
  "flex items-center gap-2 rounded-lg bg-crimson px-4 py-2 text-sm font-semibold text-white hover:bg-crimson/90 transition disabled:opacity-60";
const secondaryBtn =
  "rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition";
const card = "rounded-xl border border-slate-200 bg-white p-6 shadow-sm";

type TabKey =
  | "overview"
  | "highlights"
  | "lab"
  | "equipment"
  | "programs"
  | "team"
  | "mous"
  | "events"
  | "achievements";

const ALL_TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview & Photos" },
  { key: "highlights", label: "Highlights" },
  { key: "lab", label: "Lab" },
  { key: "equipment", label: "Equipment" },
  { key: "programs", label: "Training & Certification" },
  { key: "mous", label: "MoUs" },
  { key: "events", label: "Events" },
  { key: "achievements", label: "Achievements" },
  { key: "team", label: "Coordinators & Team" },
];

export interface AdminCenterPageProps {
  slug: string;
  title: string;
  publicPath: string;
  icon: LucideIcon;
  /** Tabs this centre doesn't use (e.g. NSS / NCC has no lab). */
  hideTabs?: TabKey[];
}

export function AdminCenterPage({
  slug,
  title,
  publicPath,
  icon: Icon,
  hideTabs = [],
}: AdminCenterPageProps) {
  const tabs = ALL_TABS.filter((t) => !hideTabs.includes(t.key));
  const [tab, setTab] = useState<TabKey>("overview");
  const [center, setCenter] = useState<CenterRow | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      setCenter(await getCenter(slug));
    } catch (e) {
      toast.error(errorMessage(e, `Failed to load ${title}`));
    } finally {
      setLoading(false);
    }
  }, [slug, title]);

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-navy">
            <Icon className="h-5 w-5 text-crimson" />
            {title}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Everything shown on the public {title} page. Empty sections are hidden there.
          </p>
        </div>
        <a href={publicPath} target="_blank" rel="noopener noreferrer" className={secondaryBtn}>
          <span className="flex items-center gap-2">
            View page <ExternalLink className="h-4 w-4" />
          </span>
        </a>
      </div>

      {loading ? (
        <Spinner />
      ) : !center ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          The {title} record (centre slug <code>{slug}</code>) could not be loaded. Either your
          account can&apos;t read it, or it is missing / in Trash: restore it from Trash &amp;
          Recovery, or create it under Campus Life → Student Groups — Societies with slug{" "}
          <code>{slug}</code>.
        </div>
      ) : (
        <>
          <HealthBanner center={center} title={title} onFixed={reload} />

          <div className="flex flex-wrap gap-1 border-b border-slate-200">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={
                  "rounded-t-lg px-3 py-2 text-sm font-semibold transition " +
                  (tab === t.key
                    ? "border border-b-white border-slate-200 bg-white text-crimson -mb-px"
                    : "text-slate-500 hover:text-navy")
                }
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "overview" && <OverviewTab center={center} onSaved={reload} />}
          {tab === "highlights" && <HighlightsTab center={center} onSaved={reload} />}
          {tab === "lab" && <LabTab center={center} onSaved={reload} />}
          {tab === "equipment" && <EquipmentTab centerId={center.id} />}
          {tab === "programs" && <ProgramsTab centerId={center.id} />}
          {tab === "team" && <TeamTab centerId={center.id} />}
          {(tab === "mous" || tab === "events" || tab === "achievements") && (
            <LinkTab key={tab} table={tab} centerId={center.id} title={title} />
          )}
        </>
      )}
    </div>
  );
}

// -------- Health --------

function HealthBanner({
  center,
  title,
  onFixed,
}: {
  center: CenterRow;
  title: string;
  onFixed: () => void;
}) {
  const [fixing, setFixing] = useState(false);
  if (center.status === "published") return null;

  async function fix() {
    setFixing(true);
    try {
      await updateCenter(center.id, { status: "published" });
      toast.success(`${title} is live again`);
      onFixed();
    } catch (e) {
      toast.error(errorMessage(e, "Fix failed"));
    } finally {
      setFixing(false);
    }
  }

  return (
    <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
      <div className="flex gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <div className="font-semibold">The public {title} page is hidden</div>
          <div>Because its status is &quot;{center.status}&quot;, not Published.</div>
        </div>
      </div>
      <button type="button" onClick={fix} disabled={fixing} className={primaryBtn}>
        {fixing && <Loader2 className="h-4 w-4 animate-spin" />} Publish
      </button>
    </div>
  );
}

// -------- Overview --------

function OverviewTab({ center, onSaved }: { center: CenterRow; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: center.name,
    subtitle: center.subtitle ?? "",
    description: center.description ?? "",
    status: center.status,
  });
  const [albumId, setAlbumId] = useState(center.album_id);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!form.name.trim()) return toast.error("Name is required");
    setSaving(true);
    try {
      await updateCenter(center.id, {
        name: form.name.trim(),
        subtitle: form.subtitle.trim() || null,
        description: form.description.trim() || null,
        status: form.status,
      });
      toast.success("Overview saved");
      onSaved();
    } catch (e) {
      toast.error(errorMessage(e, "Save failed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className={card + " space-y-4"}>
        <div className="space-y-1">
          <label className={label}>Name *</label>
          <input
            className={input}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <label className={label}>Subtitle / tagline</label>
          <input
            className={input}
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <label className={label}>About</label>
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
            onChange={(e) => setForm({ ...form, status: e.target.value as CenterRow["status"] })}
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
          tableId="centers"
          recordId={center.id}
          primaryKey="id"
          values={{ name: center.name, album_id: albumId }}
          onChange={(name, value) => {
            if (name === "album_id") setAlbumId(value);
          }}
          hasDetailPageField={false}
          onRequireSave={async () => center.id}
        />
      </div>
    </div>
  );
}

// -------- Highlights (metadata.highlights) --------

function HighlightsTab({ center, onSaved }: { center: CenterRow; onSaved: () => void }) {
  const [items, setItems] = useState<{ title: string; description: string }[]>(() =>
    (center.metadata?.highlights ?? []).map((h: { title?: string; description?: string }) => ({
      title: h.title ?? "",
      description: h.description ?? "",
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
      await updateCenter(center.id, {}, { highlights: clean });
      toast.success("Highlights saved");
      onSaved();
    } catch (e) {
      toast.error(errorMessage(e, "Save failed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={card + " space-y-4"}>
      <p className="text-sm text-slate-500">
        Numbered cards under “What makes it special”. Rows without a title are dropped on save.
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
          onClick={() => setItems([...items, { title: "", description: "" }])}
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

// -------- Lab (metadata.lab — the centre's single lab) --------

const LAB_FIELDS: { key: string; label: string; placeholder?: string; textarea?: boolean }[] = [
  { key: "name", label: "Lab name *", placeholder: "e.g. Siemens Centre of Excellence Lab" },
  { key: "description", label: "About the lab", textarea: true },
  { key: "location", label: "Location", placeholder: "e.g. Block C, Ground floor" },
  { key: "established", label: "Established", placeholder: "e.g. 2019" },
  { key: "capacity", label: "Capacity", placeholder: "e.g. 40 students per batch" },
  { key: "timings", label: "Timings", placeholder: "e.g. Mon – Sat, 9:00 AM – 5:00 PM" },
  { key: "partner", label: "Industry partner", placeholder: "e.g. Siemens Ltd." },
];

function LabTab({ center, onSaved }: { center: CenterRow; onSaved: () => void }) {
  const [form, setForm] = useState<Record<string, string>>(() =>
    Object.fromEntries(LAB_FIELDS.map((f) => [f.key, String(center.metadata?.lab?.[f.key] ?? "")])),
  );
  const [saving, setSaving] = useState(false);

  async function save() {
    const lab = Object.fromEntries(
      Object.entries(form)
        .map(([k, v]) => [k, v.trim()])
        .filter(([, v]) => v),
    );
    if (Object.keys(lab).length > 0 && !lab.name) return toast.error("Lab name is required");
    setSaving(true);
    try {
      await updateCenter(center.id, {}, { lab });
      toast.success("Lab details saved");
      onSaved();
    } catch (e) {
      toast.error(errorMessage(e, "Save failed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={card + " space-y-4"}>
      <p className="text-sm text-slate-500">
        The “The Lab” section. Leave the name empty to hide the section.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {LAB_FIELDS.map((f) => (
          <div
            key={f.key}
            className={"space-y-1 " + (f.textarea || f.key === "name" ? "sm:col-span-2" : "")}
          >
            <label className={label}>{f.label}</label>
            {f.textarea ? (
              <textarea
                rows={5}
                className={input}
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              />
            ) : (
              <input
                className={input}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <button type="button" onClick={save} disabled={saving} className={primaryBtn}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save lab details
        </button>
      </div>
    </div>
  );
}

// -------- Lists (center_equipment / center_programs / center_members) --------

type FieldDef = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "select" | "url" | "number";
  options?: { value: string; label: string }[];
  required?: boolean;
  help?: string;
};

type ListRow = { id?: string; sort_order: number; status: string } & Record<string, any>;

function EquipmentTab({ centerId }: { centerId: string }) {
  return (
    <ListManager
      table="center_equipment"
      centerId={centerId}
      noun="equipment"
      hint="Machines, kits and software in the lab, shown as cards under “Equipment details”."
      blank={{
        name: "",
        make_model: null,
        quantity: null,
        specifications: null,
        description: null,
        image_url: null,
      }}
      fields={[
        { key: "name", label: "Name", required: true },
        { key: "make_model", label: "Make / model", help: "e.g. “Siemens S7-1200 PLC”" },
        { key: "quantity", label: "Quantity", type: "number" },
        { key: "specifications", label: "Key specifications", type: "textarea" },
        { key: "description", label: "Used for", type: "textarea" },
        {
          key: "image_url",
          label: "Photo URL",
          type: "url",
          help: "Optional; a tool icon is shown otherwise",
        },
      ]}
      columns={(r) => [r.name, r.make_model ?? "—", r.quantity != null ? String(r.quantity) : "—"]}
      headers={["Name", "Make / model", "Qty"]}
    />
  );
}

function ProgramsTab({ centerId }: { centerId: string }) {
  return (
    <ListManager
      table="center_programs"
      centerId={centerId}
      noun="programme"
      hint="Training, certification and workshop programmes, shown under “Training & certification programmes”."
      blank={{
        title: "",
        program_type: "training",
        certifying_body: null,
        duration: null,
        eligibility: null,
        mode: null,
        description: null,
        registration_url: null,
      }}
      fields={[
        { key: "title", label: "Title", required: true },
        {
          key: "program_type",
          label: "Type",
          type: "select",
          options: CENTER_PROGRAM_TYPE_OPTIONS,
        },
        { key: "certifying_body", label: "Certified by", help: "e.g. “Siemens”, “NPTEL”" },
        { key: "duration", label: "Duration", help: "e.g. “40 hours”, “6 weeks”" },
        { key: "mode", label: "Mode", help: "e.g. “Offline, in the lab”" },
        { key: "eligibility", label: "Eligibility", help: "e.g. “3rd year EE / IC students”" },
        { key: "description", label: "Description", type: "textarea" },
        {
          key: "registration_url",
          label: "Registration link",
          type: "url",
          help: "Optional; shows a Register button",
        },
      ]}
      columns={(r) => [
        r.title,
        CENTER_PROGRAM_TYPE_OPTIONS.find((o) => o.value === r.program_type)?.label ??
          r.program_type,
        r.duration ?? "—",
      ]}
      headers={["Title", "Type", "Duration"]}
    />
  );
}

function TeamTab({ centerId }: { centerId: string }) {
  const [staff, setStaff] = useState<Option[] | null>(null);

  useEffect(() => {
    listStaffOptions().then(setStaff, (e) => {
      toast.error(errorMessage(e, "Failed to load staff"));
      setStaff([]);
    });
  }, []);

  if (!staff) return <Spinner />;
  const staffName = new Map(staff.map((s) => [s.id, s.name]));

  return (
    <ListManager
      table="center_members"
      centerId={centerId}
      noun="member"
      hint="Pick a staff profile to use its name, photo and profile link — or leave it empty and type the name (students, external mentors)."
      blank={{
        staff_id: null,
        name: null,
        role: "",
        member_group: "faculty",
        email: null,
        photo_url: null,
      }}
      fields={[
        {
          key: "staff_id",
          label: "Staff profile",
          type: "select",
          options: [{ value: "", label: "— Not a staff member —" }].concat(
            staff.map((s) => ({ value: s.id, label: s.name })),
          ),
        },
        { key: "name", label: "Name", help: "Only needed when no staff profile is picked" },
        {
          key: "role",
          label: "Role",
          required: true,
          help: "e.g. “Coordinator”, “Programme Officer”, “Student Lead”",
        },
        {
          key: "member_group",
          label: "Group",
          type: "select",
          options: CENTER_MEMBER_GROUP_OPTIONS,
        },
        { key: "email", label: "Email", help: "Optional; overrides the staff profile email" },
        {
          key: "photo_url",
          label: "Photo URL",
          type: "url",
          help: "Optional; overrides the staff profile photo",
        },
      ]}
      validate={(r) =>
        !r.staff_id && !String(r.name ?? "").trim() ? "Pick a staff profile or type a name" : null
      }
      columns={(r) => [
        (r.staff_id ? staffName.get(r.staff_id) : null) ?? r.name ?? "—",
        r.role,
        CENTER_MEMBER_GROUP_OPTIONS.find((o) => o.value === r.member_group)?.label ??
          r.member_group,
      ]}
      headers={["Name", "Role", "Group"]}
    />
  );
}

function ListManager({
  table,
  centerId,
  noun,
  hint,
  blank,
  fields,
  validate,
  columns,
  headers,
}: {
  table: CenterListTable;
  centerId: string;
  noun: string;
  hint: string;
  blank: Record<string, unknown>;
  fields: FieldDef[];
  validate?: (row: ListRow) => string | null;
  columns: (row: ListRow) => string[];
  headers: string[];
}) {
  const [rows, setRows] = useState<ListRow[] | null>(null);
  const [editing, setEditing] = useState<ListRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setRows(await listCenterRows<ListRow>(table, centerId));
    } catch (e) {
      toast.error(errorMessage(e, "Failed to load"));
      setRows([]);
    }
  }, [table, centerId]);

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
      const v = editing[f.key];
      if (f.required && !String(v ?? "").trim()) return toast.error(`${f.label} is required`);
      if (f.type === "url" && v && !/^https?:\/\//i.test(String(v).trim()))
        return toast.error(`${f.label} must start with https:// or http://`);
      if (f.type === "number" && v !== null && v !== "" && !Number.isFinite(Number(v)))
        return toast.error(`${f.label} must be a number`);
    }
    const problem = validate?.(editing);
    if (problem) return toast.error(problem);

    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(editing)) {
      const f = fields.find((x) => x.key === k);
      if (typeof v === "string") {
        const t = v.trim();
        cleaned[k] = f?.type === "number" ? (t ? Math.round(Number(t)) : null) : t || null;
      } else cleaned[k] = v;
    }
    setSaving(true);
    try {
      await upsertCenterRow(table, cleaned as ListRow);
      toast.success(editing.id ? "Saved" : "Added");
      setEditing(null);
      await load();
    } catch (e) {
      toast.error(errorMessage(e, "Save failed"));
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: ListRow) {
    if (!row.id || !confirm(`Move this ${noun} to Trash?`)) return;
    setBusy(true);
    try {
      await deleteCenterRow(table, row.id);
      toast.success("Moved to Trash");
      await load();
    } catch (e) {
      toast.error(errorMessage(e, "Delete failed"));
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
      await reorderCenterRows(
        table,
        next.map((r) => ({ id: r.id!, sort_order: r.sort_order })),
      );
    } catch (e) {
      toast.error(errorMessage(e, "Reorder failed"));
    } finally {
      await load();
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
          onClick={() =>
            setEditing({
              ...blank,
              center_id: centerId,
              sort_order: nextSort,
              status: "published",
            } as ListRow)
          }
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
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
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
                        "max-w-[280px] truncate p-3 " +
                        (j === 0 ? "font-medium text-navy" : "text-slate-600")
                      }
                    >
                      {c}
                    </td>
                  ))}
                  <td className="p-3">
                    <StatusPill status={r.status} />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <IconBtn
                        label="Move up"
                        disabled={busy || i === 0}
                        onClick={() => reorder(i, i - 1)}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </IconBtn>
                      <IconBtn
                        label="Move down"
                        disabled={busy || i === rows.length - 1}
                        onClick={() => reorder(i, i + 1)}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </IconBtn>
                      <IconBtn label="Edit" onClick={() => setEditing({ ...r })}>
                        <Edit2 className="h-4 w-4" />
                      </IconBtn>
                      <IconBtn label="Delete" danger disabled={busy} onClick={() => remove(r)}>
                        <Trash2 className="h-4 w-4" />
                      </IconBtn>
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
                {editing.id ? "Edit" : "Add"} {noun}
              </h2>
            </div>
            <div className="max-h-[70vh] space-y-4 overflow-y-auto p-6">
              {fields.map((f) => {
                const val = String(editing[f.key] ?? "");
                const set = (v: string) => setEditing((p) => ({ ...p!, [f.key]: v }));
                return (
                  <div key={f.key} className="space-y-1">
                    <label className={label}>
                      {f.label}
                      {f.required && " *"}
                    </label>
                    {f.type === "textarea" ? (
                      <textarea
                        rows={3}
                        className={input}
                        value={val}
                        onChange={(e) => set(e.target.value)}
                      />
                    ) : f.type === "select" ? (
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
                        type={f.type === "url" ? "url" : f.type === "number" ? "number" : "text"}
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

// -------- Linked rows (MoUs / events / achievements tagged with center_id) --------

const LINK_COPY: Record<
  CenterLinkTable,
  { noun: string; manageHref: string; manageLabel: string; hint: string }
> = {
  mous: {
    noun: "MoUs",
    manageHref: "/admin/tables/mous",
    manageLabel: "MOUs",
    hint: "Tick the MoUs to show under “MoUs & industry partners” (newest signed first).",
  },
  events: {
    noun: "events",
    manageHref: "/admin/events",
    manageLabel: "Events",
    hint: "Tick the events to show under “Recent events & workshops” — the 6 newest ticked events are shown.",
  },
  achievements: {
    noun: "achievements",
    manageHref: "/admin/tables/achievements",
    manageLabel: "Achievements",
    hint: "Tick the achievements to show under “Recent achievements” — the 6 newest ticked are shown.",
  },
};

function LinkTab({
  table,
  centerId,
  title,
}: {
  table: CenterLinkTable;
  centerId: string;
  title: string;
}) {
  const copy = LINK_COPY[table];
  const [rows, setRows] = useState<LinkableRow[] | null>(null);
  const [query, setQuery] = useState("");
  const [onlyLinked, setOnlyLinked] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setRows(await listLinkableRows(table));
    } catch (e) {
      toast.error(errorMessage(e, "Failed to load"));
      setRows([]);
    }
  }, [table]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggle(row: LinkableRow) {
    const linked = row.center_id === centerId;
    if (
      !linked &&
      row.center_id &&
      !confirm("This row is shown on another centre page. Move it here?")
    )
      return;
    setBusyId(row.id);
    try {
      await setRowCenter(table, row.id, linked ? null : centerId);
      setRows((prev) =>
        (prev ?? []).map((r) =>
          r.id === row.id ? { ...r, center_id: linked ? null : centerId } : r,
        ),
      );
    } catch (e) {
      toast.error(errorMessage(e, "Update failed"));
    } finally {
      setBusyId(null);
    }
  }

  if (!rows) return <Spinner />;

  const q = query.trim().toLowerCase();
  const visible = rows.filter(
    (r) =>
      (!onlyLinked || r.center_id === centerId) &&
      (!q || (r.title ?? "").toLowerCase().includes(q)),
  );
  const linkedCount = rows.filter((r) => r.center_id === centerId).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-2xl text-sm text-slate-500">
          {copy.hint} To add a new one, create it in{" "}
          <Link href={copy.manageHref} className="font-semibold text-crimson hover:underline">
            {copy.manageLabel}
          </Link>{" "}
          (or set its <strong>Center</strong> field to {title} there), then tick it here. Only
          published rows appear on the site.
        </p>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {linkedCount} shown on this page
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className={input + " pl-9"}
            placeholder={`Search ${copy.noun}…`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={onlyLinked}
            onChange={(e) => setOnlyLinked(e.target.checked)}
          />
          Only ticked
        </label>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          No {copy.noun} match.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="w-12 p-3" />
                <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Title
                </th>
                <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Date
                </th>
                <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((r) => {
                const linked = r.center_id === centerId;
                return (
                  <tr key={r.id} className={linked ? "bg-emerald-50/50" : "hover:bg-slate-50"}>
                    <td className="p-3">
                      {busyId === r.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-crimson" />
                      ) : (
                        <input
                          type="checkbox"
                          aria-label={`Show ${r.title} on this page`}
                          checked={linked}
                          disabled={!!busyId}
                          onChange={() => toggle(r)}
                        />
                      )}
                    </td>
                    <td className="max-w-[360px] truncate p-3 font-medium text-navy">
                      {r.title}
                      {r.center_id && !linked && (
                        <span className="ml-2 text-xs font-normal text-slate-400">
                          (on another centre page)
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-600">{r.date?.slice(0, 10) ?? "—"}</td>
                    <td className="p-3">
                      <StatusPill status={r.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// -------- Shared bits --------

function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={
        "rounded-full px-2 py-0.5 text-xs font-semibold " +
        (status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")
      }
    >
      {status}
    </span>
  );
}

function IconBtn({
  label: aria,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={aria}
      className={
        "rounded p-1.5 text-slate-400 disabled:opacity-30 " +
        (danger ? "hover:bg-rose-50 hover:text-rose-600" : "hover:bg-slate-100 hover:text-navy")
      }
    >
      {children}
    </button>
  );
}

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
      <IconBtn label="Move up" disabled={index === 0} onClick={() => onMove(index - 1)}>
        <ArrowUp className="h-4 w-4" />
      </IconBtn>
      <IconBtn label="Move down" disabled={index === count - 1} onClick={() => onMove(index + 1)}>
        <ArrowDown className="h-4 w-4" />
      </IconBtn>
      <IconBtn label="Remove" danger onClick={onDelete}>
        <Trash2 className="h-4 w-4" />
      </IconBtn>
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
