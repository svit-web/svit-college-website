"use client";

// Typed editor for the per-table `metadata` (and other jsonb) columns, per ADR
// 0003: content stays in JSON, but nobody hand-writes it. Each key becomes an
// input matched to its value's type; a JSON toggle exposes the raw document.
// Collapsed by default — most records need none of it.

import { useState } from "react";
import { Braces, ChevronDown, Plus, X } from "lucide-react";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
type JsonObject = { [key: string]: JsonValue };

const inputClass =
  "w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-900 focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson/50";

// Terse keys used in existing content whose humanized form would mean nothing
// to a non-technical admin.
const KEY_LABELS: Record<string, string> = {
  n: "Step Number",
  q: "Question",
  a: "Answer",
  desc: "Description",
  url: "Link (URL)",
  srNo: "Serial Number",
};

function humanizeKey(key: string): string {
  if (KEY_LABELS[key]) return KEY_LABELS[key];
  return key
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function isJsonObject(value: JsonValue): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeParse(text: string): { ok: true; value: JsonValue } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(text) as JsonValue };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

function isLongText(value: string): boolean {
  return value.length > 80 || value.includes("\n");
}

// Optional titled sections for the top level of the form view (used by the
// dedicated pages-singleton editors, where each metadata key is a section of
// the public page rather than an "additional" field).
export interface MetadataEditorGroup {
  title: string;
  description?: string;
  keys: string[];
}

// A blank value shaped like `sample` (object → object of blanks, else "").
function blankLike(sample: JsonValue): JsonValue {
  if (isJsonObject(sample)) {
    const out: JsonObject = {};
    for (const [k, v] of Object.entries(sample)) {
      out[k] = isJsonObject(v)
        ? blankLike(v)
        : typeof v === "number"
          ? null
          : typeof v === "boolean"
            ? false
            : "";
    }
    return out;
  }
  return "";
}

// Raw-JSON escape hatch for values nested too deeply for the form editor
// (depth >= 3): keeps deeply nested shapes editable without more boxes.
function MiniJsonEditor({
  value,
  onChange,
}: {
  value: JsonValue;
  onChange: (next: JsonValue) => void;
}) {
  const [text, setText] = useState(() => JSON.stringify(value ?? null, null, 2));
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-1">
      <textarea
        value={text}
        spellCheck={false}
        rows={4}
        onChange={(e) => {
          setText(e.target.value);
          const parsed = safeParse(e.target.value);
          if (parsed.ok) {
            setError(null);
            onChange(parsed.value);
          } else {
            setError(parsed.error);
          }
        }}
        className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-xs text-slate-900 focus:border-crimson focus:outline-none"
      />
      {error && <p className="text-[11px] font-medium text-rose-600">Invalid JSON — {error}</p>}
    </div>
  );
}

function ObjectEditor({
  value,
  onChange,
  depth,
}: {
  value: JsonObject;
  onChange: (next: JsonObject) => void;
  depth: number;
}) {
  const [newKey, setNewKey] = useState("");

  const addKey = () => {
    const key = newKey.trim();
    if (!key || key in value) return;
    onChange({ ...value, [key]: "" });
    setNewKey("");
  };

  return (
    <div className="space-y-3">
      {Object.keys(value).map((key) => (
        <div key={key} className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {humanizeKey(key)}
            </label>
            <button
              type="button"
              title={`Remove ${key}`}
              onClick={() => {
                const copy = { ...value };
                delete copy[key];
                onChange(copy);
              }}
              className="text-slate-300 hover:text-rose-500"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <ValueEditor
            value={value[key]}
            onChange={(next) => onChange({ ...value, [key]: next })}
            depth={depth}
          />
        </div>
      ))}

      <div className="flex gap-1.5">
        <input
          type="text"
          placeholder="new field name"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addKey();
            }
          }}
          className={`${inputClass} text-xs`}
        />
        <button
          type="button"
          onClick={addKey}
          className="flex shrink-0 items-center gap-1 rounded border border-slate-200 px-2 py-1.5 text-xs font-semibold text-slate-600 hover:border-crimson hover:text-crimson transition"
        >
          <Plus className="h-3 w-3" />
          Add field
        </button>
      </div>
    </div>
  );
}

function ArrayEditor({
  value,
  onChange,
  depth,
}: {
  value: JsonValue[];
  onChange: (next: JsonValue[]) => void;
  depth: number;
}) {
  const objectSample = value.find((v) => isJsonObject(v));
  const sample: JsonValue = objectSample ?? value[0] ?? "";

  return (
    <div className="space-y-2">
      {value.map((item, i) => (
        <div key={i} className="flex items-start gap-1.5">
          <div className="min-w-0 flex-1">
            {isJsonObject(item) ? (
              <div className="space-y-2 rounded border border-slate-200 bg-slate-50/60 p-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Item {i + 1}
                </p>
                <ObjectEditor
                  value={item}
                  onChange={(next) => {
                    const copy = [...value];
                    copy[i] = next;
                    onChange(copy);
                  }}
                  depth={depth + 1}
                />
              </div>
            ) : (
              <ValueEditor
                value={item}
                onChange={(next) => {
                  const copy = [...value];
                  copy[i] = next;
                  onChange(copy);
                }}
                depth={depth}
              />
            )}
          </div>
          <button
            type="button"
            title="Remove item"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            className="mt-1 rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...value, blankLike(sample)])}
        className="flex items-center gap-1.5 rounded border border-dashed border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:border-crimson hover:text-crimson transition"
      >
        <Plus className="h-3 w-3" />
        Add item
      </button>
    </div>
  );
}

function ValueEditor({
  value,
  onChange,
  depth,
}: {
  value: JsonValue;
  onChange: (next: JsonValue) => void;
  depth: number;
}) {
  if (isJsonObject(value) && depth >= 3) {
    return <MiniJsonEditor value={value} onChange={onChange} />;
  }

  if (value === null || value === undefined) {
    return (
      <input
        type="text"
        value=""
        placeholder="(empty)"
        onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
        className={inputClass}
      />
    );
  }

  if (typeof value === "boolean") {
    return (
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-slate-200 bg-white text-crimson focus:ring-crimson"
        />
        <span>On</span>
      </label>
    );
  }

  if (typeof value === "number") {
    return (
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        className={inputClass}
      />
    );
  }

  if (typeof value === "string") {
    if (isLongText(value)) {
      return (
        <textarea
          value={value}
          rows={3}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      );
    }
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    );
  }

  if (Array.isArray(value)) {
    return <ArrayEditor value={value} onChange={onChange} depth={depth} />;
  }

  return <ObjectEditor value={value} onChange={onChange} depth={depth + 1} />;
}

export function MetadataEditor({
  value,
  onChange,
  defaultOpen = false,
  groups,
}: {
  value: JsonValue;
  onChange: (next: JsonValue) => void;
  defaultOpen?: boolean;
  groups?: MetadataEditorGroup[];
}) {
  // `value` is an object, except while the user is mid-edit in the JSON view
  // with unparseable text — then it's that raw string, kept so the draft
  // survives re-renders (save is blocked until the JSON parses).
  const parsedFromString = typeof value === "string" ? safeParse(value) : null;
  const objectValue: JsonObject = parsedFromString
    ? parsedFromString.ok && isJsonObject(parsedFromString.value)
      ? parsedFromString.value
      : {}
    : isJsonObject(value)
      ? value
      : {};

  const [open, setOpen] = useState(defaultOpen);
  const [mode, setMode] = useState<"form" | "json">(
    parsedFromString && !parsedFromString.ok ? "json" : "form",
  );
  const [rawText, setRawText] = useState(
    typeof value === "string" ? value : JSON.stringify(objectValue, null, 2),
  );
  const [parseError, setParseError] = useState<string | null>(null);

  const keyCount = Object.keys(objectValue).length;

  // Renders one titled section for a subset of keys. Removing a key inside
  // the subset must remove it from the whole object, so the merge deletes
  // every key of the subset before re-adding what the section now holds.
  const renderSection = (title: string, description: string | undefined, keys: string[]) => {
    const subset: JsonObject = {};
    for (const key of keys) if (key in objectValue) subset[key] = objectValue[key];
    const mergeSection = (next: JsonObject) => {
      const merged: JsonObject = {};
      for (const [k, v] of Object.entries(objectValue)) if (!keys.includes(k)) merged[k] = v;
      onChange({ ...merged, ...next });
    };
    return (
      <section key={title} className="space-y-2.5 rounded border border-slate-200 bg-white p-3">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-navy">{title}</h4>
          {description && <p className="mt-0.5 text-[11px] text-slate-500">{description}</p>}
        </div>
        {keys.length === 1 && keys[0] in objectValue ? (
          // One-key section: the heading already names the key, so edit its
          // value directly instead of repeating the key as a nested row.
          <ValueEditor
            value={objectValue[keys[0]]}
            onChange={(v) => onChange({ ...objectValue, [keys[0]]: v })}
            depth={0}
          />
        ) : (
          <ObjectEditor value={subset} onChange={mergeSection} depth={0} />
        )}
      </section>
    );
  };

  const groupedKeys = new Set((groups ?? []).flatMap((g) => g.keys));
  const ungroupedKeys = Object.keys(objectValue).filter((k) => !groupedKeys.has(k));

  const handleRawChange = (text: string) => {
    setRawText(text);
    const parsed = safeParse(text);
    if (parsed.ok && isJsonObject(parsed.value)) {
      setParseError(null);
      onChange(parsed.value);
    } else if (parsed.ok) {
      setParseError("metadata must be a JSON object ( { … } ), not a bare value or array");
      onChange(text);
    } else {
      setParseError(parsed.error);
      onChange(text);
    }
  };

  const switchMode = (next: "form" | "json") => {
    if (next === mode) return;
    if (next === "json") {
      setRawText(JSON.stringify(objectValue, null, 2));
      setParseError(null);
      setMode("json");
    } else if (!parseError) {
      setMode("form");
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/60">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left"
      >
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
          Additional Fields
          <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold normal-case tracking-normal text-slate-600">
            {keyCount} {keyCount === 1 ? "field" : "fields"}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="space-y-3 border-t border-slate-200 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] text-slate-500">
              Extra content for this record, shown on the website.
            </p>
            <div className="inline-flex shrink-0 rounded border border-slate-200 bg-white p-0.5">
              <button
                type="button"
                onClick={() => switchMode("form")}
                disabled={mode === "json" && !!parseError}
                title={mode === "json" && parseError ? "Fix the JSON error first" : undefined}
                className={`rounded px-2 py-1 text-[11px] font-semibold transition ${
                  mode === "form" ? "bg-crimson text-white" : "text-slate-600 hover:text-navy"
                } disabled:cursor-not-allowed disabled:opacity-40`}
              >
                Form
              </button>
              <button
                type="button"
                onClick={() => switchMode("json")}
                className={`flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold transition ${
                  mode === "json" ? "bg-crimson text-white" : "text-slate-600 hover:text-navy"
                }`}
              >
                <Braces className="h-3 w-3" />
                JSON
              </button>
            </div>
          </div>

          {mode === "form" ? (
            groups && groups.length > 0 ? (
              <div className="space-y-3">
                {groups.map((g) => renderSection(g.title, g.description, g.keys))}
                {ungroupedKeys.length > 0 &&
                  renderSection("Other Fields", undefined, ungroupedKeys)}
              </div>
            ) : (
              <ObjectEditor value={objectValue} onChange={onChange} depth={0} />
            )
          ) : (
            <div className="space-y-1">
              <textarea
                value={rawText}
                spellCheck={false}
                rows={Math.min(14, Math.max(6, rawText.split("\n").length + 1))}
                onChange={(e) => handleRawChange(e.target.value)}
                className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-xs text-slate-900 focus:border-crimson focus:outline-none"
              />
              {parseError && (
                <p className="text-[11px] font-medium text-rose-600">Invalid JSON — {parseError}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
