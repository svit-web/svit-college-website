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
    <div className="mt-4 border-t border-navy/10 pt-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 rounded-lg bg-navy/5 px-4 py-2.5 text-left"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-crimson">
          View Members ({members.length})
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-navy transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul className="mt-3 space-y-3 border-t border-navy/10 pt-3">
          {members.map((m, i) => (
            <li key={i} className="flex flex-col gap-1 text-sm sm:flex-row sm:items-start sm:justify-between sm:gap-3">
              <div>
                <div className="font-semibold text-navy">{m.name}</div>
                {m.role && <div className="text-xs text-muted-foreground">{m.role}</div>}
                {m.designation && <div className="text-xs text-muted-foreground">{m.designation}</div>}
              </div>
              {(m.email || m.phone) && (
                <div className="flex flex-col gap-1 sm:items-end">
                  {m.email && (
                    <a
                      href={`mailto:${m.email}`}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold"
                    >
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      {m.email}
                    </a>
                  )}
                  {m.phone && (
                    <a
                      href={`tel:${m.phone.replace(/[^\d+]/g, "")}`}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold"
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
