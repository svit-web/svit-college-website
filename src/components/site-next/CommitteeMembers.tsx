'use client';

import { useState } from "react";
import { ChevronDown, Mail, Phone } from "lucide-react";

interface CommitteeMember {
  name: string;
  role?: string;
  designation?: string;
  email?: string;
  phone?: string;
}

export function CommitteeMembers({ members }: { members: CommitteeMember[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-4 border-t border-line pt-4">
      <button
        onClick={() => setOpen(!open)}
        type="button"
        aria-expanded={open}
        className="flex min-h-11 w-full items-center justify-between gap-4 border border-line bg-paper-deep/60 px-4 text-left transition-colors hover:bg-paper-deep"
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-crimson">
          View Members ({members.length})
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-navy transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul className="mt-3 divide-y divide-line border-t border-line">
          {members.map((m, i) => (
            <li key={i} className="flex flex-col gap-1 py-3 text-sm sm:flex-row sm:items-start sm:justify-between sm:gap-3">
              <div>
                <div className="font-semibold text-navy">{m.name}</div>
                {m.role && <div className="text-xs text-ink-soft">{m.role}</div>}
                {m.designation && <div className="text-xs text-ink-soft">{m.designation}</div>}
              </div>
              {(m.email || m.phone) && (
                <div className="flex flex-col gap-1 sm:items-end">
                  {m.email && (
                    <a
                      href={`mailto:${m.email}`}
                      className="flex items-center gap-1.5 py-1 text-xs text-ink-soft hover:text-crimson"
                    >
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      {m.email}
                    </a>
                  )}
                  {m.phone && (
                    <a
                      href={`tel:${m.phone.replace(/[^\d+]/g, "")}`}
                      className="flex items-center gap-1.5 py-1 text-xs text-ink-soft hover:text-crimson"
                    >
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      {m.phone}
                    </a>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
