"use client";

// Dedicated form for the About page's `leadership` block — replaces the
// generic JSON/MetadataEditor rendering for just this key so Chairman and
// Principal get plain text fields plus a photo uploader instead of raw JSON.
// See CONTEXT.md "Leadership message": this is the single trust-wide pair,
// not the (separate, unused-by-this-screen) per-college principal fields.

import type { ReactNode } from "react";
import { Plus, X } from "lucide-react";
import { MediaUploader } from "@/components/admin-next/MediaUploader";

export interface LeadershipPerson {
  quote: string;
  name: string;
  title: string;
  photoUrl?: string;
  strategicPlanText?: string;
  corePrinciples?: string[];
  bodyText?: string;
}

export interface LeadershipValue {
  intro: string;
  chairman: LeadershipPerson;
  principal?: LeadershipPerson;
  boardOfManagement: { srNo: number; name: string; designation: string }[];
}

const inputClass =
  "w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-900 focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson/50";
const labelClass = "text-[11px] font-semibold uppercase tracking-wide text-slate-500";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

function StringListEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      {value.map((item, i) => (
        <div key={i} className="flex gap-1.5">
          <input
            type="text"
            value={item}
            placeholder={placeholder}
            onChange={(e) => {
              const copy = [...value];
              copy[i] = e.target.value;
              onChange(copy);
            }}
            className={inputClass}
          />
          <button
            type="button"
            title="Remove"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            className="shrink-0 rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, ""])}
        className="flex items-center gap-1.5 rounded border border-dashed border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-crimson hover:text-crimson"
      >
        <Plus className="h-3 w-3" />
        Add
      </button>
    </div>
  );
}

function PersonCard({
  title,
  person,
  onChange,
  extra,
}: {
  title: string;
  person: LeadershipPerson;
  onChange: (next: LeadershipPerson) => void;
  extra?: ReactNode;
}) {
  const patch = (p: Partial<LeadershipPerson>) => onChange({ ...person, ...p });

  return (
    <div className="space-y-3 rounded border border-slate-200 bg-slate-50/50 p-3">
      <h5 className="text-[11px] font-bold uppercase tracking-wide text-crimson">{title}</h5>

      <Field label="Photo">
        <MediaUploader value={person.photoUrl ?? ""} onChange={(url) => patch({ photoUrl: url })} />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name">
          <input
            type="text"
            value={person.name}
            onChange={(e) => patch({ name: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Title / Designation">
          <input
            type="text"
            value={person.title}
            onChange={(e) => patch({ title: e.target.value })}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Quote">
        <textarea
          rows={2}
          value={person.quote}
          onChange={(e) => patch({ quote: e.target.value })}
          className={inputClass}
        />
      </Field>

      {extra}
    </div>
  );
}

export function LeadershipMessagesEditor({
  value,
  onChange,
}: {
  value: LeadershipValue;
  onChange: (next: LeadershipValue) => void;
}) {
  const board = value.boardOfManagement ?? [];
  const patchChairman = (next: LeadershipPerson) => onChange({ ...value, chairman: next });
  const patchBoard = (next: LeadershipValue["boardOfManagement"]) =>
    onChange({ ...value, boardOfManagement: next });

  return (
    <section className="space-y-3 rounded border border-slate-200 bg-white p-3">
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-navy">
          Leadership Messages
        </h4>
        <p className="mt-0.5 text-[11px] text-slate-500">
          Chairman message, plus the Board of Management list. Principal messages are managed under
          Principal Messages.
        </p>
      </div>

      <Field label="Intro">
        <textarea
          rows={2}
          value={value.intro}
          onChange={(e) => onChange({ ...value, intro: e.target.value })}
          className={inputClass}
        />
      </Field>

      <div className="grid gap-3">
        <PersonCard
          title="Chairman"
          person={value.chairman}
          onChange={patchChairman}
          extra={
            <>
              <Field label="Strategic Plan Text (optional)">
                <textarea
                  rows={2}
                  value={value.chairman.strategicPlanText ?? ""}
                  onChange={(e) =>
                    patchChairman({ ...value.chairman, strategicPlanText: e.target.value })
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Core Principles (optional)">
                <StringListEditor
                  value={value.chairman.corePrinciples ?? []}
                  onChange={(next) => patchChairman({ ...value.chairman, corePrinciples: next })}
                  placeholder="A principle"
                />
              </Field>
            </>
          }
        />
      </div>

      <div className="space-y-1.5">
        <span className={labelClass}>Board of Management</span>
        <div className="space-y-2">
          {board.map((member, i) => (
            <div
              key={i}
              className="flex items-start gap-1.5 rounded border border-slate-200 bg-slate-50/60 p-2"
            >
              <div className="grid flex-1 grid-cols-[64px_1fr_1fr] gap-1.5">
                <input
                  type="number"
                  value={member.srNo}
                  placeholder="Sr."
                  onChange={(e) => {
                    const copy = [...board];
                    copy[i] = { ...copy[i], srNo: Number(e.target.value) || 0 };
                    patchBoard(copy);
                  }}
                  className={inputClass}
                />
                <input
                  type="text"
                  value={member.name}
                  placeholder="Name"
                  onChange={(e) => {
                    const copy = [...board];
                    copy[i] = { ...copy[i], name: e.target.value };
                    patchBoard(copy);
                  }}
                  className={inputClass}
                />
                <input
                  type="text"
                  value={member.designation}
                  placeholder="Designation"
                  onChange={(e) => {
                    const copy = [...board];
                    copy[i] = { ...copy[i], designation: e.target.value };
                    patchBoard(copy);
                  }}
                  className={inputClass}
                />
              </div>
              <button
                type="button"
                title="Remove member"
                onClick={() => patchBoard(board.filter((_, j) => j !== i))}
                className="mt-1 rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              patchBoard([...board, { srNo: board.length + 1, name: "", designation: "" }])
            }
            className="flex items-center gap-1.5 rounded border border-dashed border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-crimson hover:text-crimson"
          >
            <Plus className="h-3 w-3" />
            Add member
          </button>
        </div>
      </div>
    </section>
  );
}
