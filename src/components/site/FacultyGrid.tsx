import { Reveal } from "./Reveal";
import type { FacultyMember } from "@/lib/faculty";
import { Mail } from "lucide-react";

export function FacultyGrid({ members }: { members: FacultyMember[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((m, i) => (
        <Reveal key={m.email + i} delay={i * 0.05}>
          <article className="card-lift group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white">
            <div className="relative h-24 bg-gradient-to-br from-navy via-navy-light to-crimson">
              <div className="absolute -bottom-8 left-6 flex h-16 w-16 items-center justify-center rounded-full bg-white ring-4 ring-white shadow-md text-navy font-display font-bold text-lg">
                {m.initials}
              </div>
            </div>
            <div className="flex flex-1 flex-col p-6 pt-10">
              <h4 className="font-display font-bold text-navy">{m.name}</h4>
              <div className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-crimson">{m.title}</div>
              <dl className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                <div><span className="font-semibold text-ink">Qualification:</span> {m.qualification}</div>
                <div><span className="font-semibold text-ink">Specialization:</span> {m.specialization}</div>
                <div><span className="font-semibold text-ink">Experience:</span> {m.experience}</div>
              </dl>
              <a href={`mailto:${m.email}`} className="mt-4 inline-flex items-center gap-2 text-xs text-navy hover:text-gold transition-colors">
                <Mail className="h-3.5 w-3.5" /> {m.email}
              </a>
            </div>
          </article>
        </Reveal>
      ))}
    </div>
  );
}
