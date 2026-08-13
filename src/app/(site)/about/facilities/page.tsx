import type { Metadata } from "next";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { BookOpen, Trophy, Bus, Wifi, Users } from "lucide-react";
import { getAboutPage } from "@/lib/pages.functions";

export const metadata: Metadata = {
  title: "Central Facilities — SVIT Vasad",
  description: "SVIT Vasad's campus facilities: library, scholarships, sports, NSS/NCC, hostels, transport, IT and medical care.",
};

export default async function FacilitiesPage() {
  const c = await getAboutPage().catch(() => null);

  return (
    <section className="bg-secondary/50 py-16 md:py-20">
      <div className="container-page">
        <SectionHeading eyebrow="Life on campus" title="Central Facilities" variant="eyebrow" />
        <p className="mt-4 max-w-3xl text-muted-foreground">{c?.facilities?.intro}</p>

        {/* Library */}
        <div className="mt-10 rounded-2xl border-2 border-navy/15 bg-white p-6">
          <h3 className="flex items-center gap-2 font-display text-xl font-bold text-navy">
            <BookOpen className="h-5 w-5 text-gold" /> Library
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {c?.facilities?.library?.text}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(c?.facilities?.library?.stats ?? []).map((s) => (
              <div key={s.label} className="rounded-lg border border-border bg-secondary/40 p-4">
                <div className="font-display text-xl font-bold text-navy">{s.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scholarships */}
        <div className="mt-6 rounded-2xl border-2 border-navy/15 bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-display text-xl font-bold text-navy">Scholarships</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-navy/5 text-navy">
              <tr>
                <th className="px-4 py-3 text-left">Scholarship</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Eligibility</th>
              </tr>
            </thead>
            <tbody>
              {(c?.facilities?.scholarships ?? []).map((s) => (
                <tr key={s.name} className="border-t border-border align-top">
                  <td className="px-4 py-3 font-medium text-navy">{s.name}</td>
                  <td className="px-4 py-3 text-navy">{s.amount}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.eligibility}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sports */}
        <div className="mt-6 rounded-2xl border-2 border-navy/15 bg-white p-6">
          <h3 className="flex items-center gap-2 font-display text-xl font-bold text-navy">
            <Trophy className="h-5 w-5 text-gold" /> Sports &amp; Recreation
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {c?.facilities?.sports?.text}
          </p>
          <div className="mt-4 space-y-3">
            {(c?.facilities?.sports?.activities ?? []).map((a) => (
              <div key={a.label} className="rounded-lg border border-border p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-crimson">
                  {a.label}
                </div>
                <div className="mt-1 text-sm text-navy">{a.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* NSS / NCC */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {(c?.facilities?.nssNcc ?? []).map((n) => (
            <div key={n.name} className="rounded-2xl border-2 border-navy/15 bg-white p-6">
              <h3 className="font-display text-lg font-bold text-navy">{n.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {n.description}
              </p>
            </div>
          ))}
        </div>

        {/* Hostels & Transport */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border-2 border-navy/15 bg-white p-6">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-navy">
              <Users className="h-5 w-5 text-gold" /> Hostels
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {c?.facilities?.hostelsTransport?.hostelText}
            </p>
          </div>
          <div className="rounded-2xl border-2 border-navy/15 bg-white p-6">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-navy">
              <Bus className="h-5 w-5 text-gold" /> Transport
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {c?.facilities?.hostelsTransport?.transportText}
            </p>
          </div>
        </div>

        {/* IT & Medical */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(c?.facilities?.itMedical ?? []).map((it) => (
            <div key={it.label} className="rounded-2xl border-2 border-navy/15 bg-white p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-crimson">
                <Wifi className="h-4 w-4" /> {it.label}
              </div>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {it.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
