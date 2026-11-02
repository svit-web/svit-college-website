import { Handshake } from "lucide-react";
import { Reveal } from "@/components/site-next/Reveal";

export interface MouCardData {
  id: string;
  partner_organization: string;
  purpose: string | null;
  signed_date: string | null;
  expiry_date: string | null;
  logo_url: string | null;
  activities: string[] | null;
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

export function MouCard({
  mou,
  department,
  delay = 0,
}: {
  mou: MouCardData;
  /** Shown above the partner's name on lists that mix departments. */
  department?: string;
  delay?: number;
}) {
  const signed = formatDate(mou.signed_date);
  const expires = formatDate(mou.expiry_date);

  return (
    <Reveal delay={delay}>
      <div className="flex h-full items-start gap-4 border border-line bg-surface p-5">
        {mou.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mou.logo_url} alt="" className="h-12 w-12 shrink-0 object-contain" />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-paper-deep text-navy">
            <Handshake className="h-5 w-5" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          {department && (
            <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-crimson">
              {department}
            </div>
          )}
          <div className="font-display font-medium text-navy">{mou.partner_organization}</div>
          {(signed || expires) && (
            <div className="mt-0.5 text-xs text-ink-soft">
              {signed && <>Signed {signed}</>}
              {signed && expires && " · "}
              {expires && <>Valid till {expires}</>}
            </div>
          )}
          {mou.purpose && <p className="mt-2 text-sm text-ink-soft">{mou.purpose}</p>}
          {mou.activities && mou.activities.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {mou.activities.map((a) => (
                <li
                  key={a}
                  className="rounded-full border border-line px-2.5 py-0.5 text-xs text-navy"
                >
                  {a}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Reveal>
  );
}
