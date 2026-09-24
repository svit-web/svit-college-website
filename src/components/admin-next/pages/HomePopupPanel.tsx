'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, CalendarClock, Image as ImageIcon, Loader2, Monitor, MousePointerClick, Save, Smartphone, Type } from 'lucide-react';
import { toast } from 'sonner';
import { MediaUploader } from '@/components/admin-next/MediaUploader';
import { HomePopupCard, HomePopupPill, PopupStage } from '@/components/site-next/HomePopup';
import {
  HOME_POPUP_BODY_MAX,
  HOME_POPUP_FOCUS,
  HOME_POPUP_SHAPES,
  homePopupProblems,
  isHomePopupLive,
  type HomePopup,
  type HomePopupLink,
} from '@/lib/home-popup';
import { saveHomePopup } from '@/lib/home-popup-next';
import campusHero from '@/assets/campus-hero.jpg';

const INPUT = 'w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none';
const LABEL = 'text-xs font-semibold uppercase text-slate-600';

// <input type="datetime-local"> works in the admin's local time; storage is ISO.
function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
const fromLocalInput = (v: string) => (v ? new Date(v).toISOString() : null);

function status(p: HomePopup): { label: string; className: string } {
  if (!p.enabled) return { label: 'Off', className: 'bg-slate-100 text-slate-600 border-slate-200' };
  const now = new Date();
  if (p.starts_at && now < new Date(p.starts_at)) return { label: 'Scheduled', className: 'bg-sky-50 text-sky-700 border-sky-200' };
  if (p.ends_at && now >= new Date(p.ends_at)) return { label: 'Ended', className: 'bg-amber-50 text-amber-700 border-amber-200' };
  if (!isHomePopupLive(p, now)) return { label: 'Incomplete', className: 'bg-rose-50 text-rose-700 border-rose-200' };
  return { label: 'Live', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
}

export function HomePopupPanel({ initialPopup, userId }: { initialPopup: HomePopup; userId: string }) {
  const [popup, setPopup] = useState<HomePopup>(initialPopup);
  const [saving, setSaving] = useState(false);
  const problems = homePopupProblems(popup);
  const s = status(popup);

  const patch = (p: Partial<HomePopup>) => setPopup((prev) => ({ ...prev, ...p }));
  const patchLink = (key: 'primary' | 'secondary', p: Partial<HomePopupLink>) =>
    setPopup((prev) => ({ ...prev, [key]: { ...prev[key], ...p } }));

  async function handleSave() {
    setSaving(true);
    try {
      const saved = await saveHomePopup(popup, userId);
      setPopup(saved);
      toast.success(saved.enabled ? 'Popup saved — live on the homepage now.' : 'Popup saved (switched off).');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-3 font-display text-2xl font-bold tracking-tight text-navy">
            Homepage Popup
            <span className={`rounded-full border px-2.5 py-0.5 font-sans text-xs font-semibold ${s.className}`}>{s.label}</span>
          </h2>
          <p className="text-sm text-slate-500">
            Opens once per visitor session on the homepage, then stays as a small button in the bottom-right corner. Saving applies immediately.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || (popup.enabled && problems.length > 0)}
          className="flex shrink-0 items-center gap-2 self-start rounded bg-crimson px-4 py-2 text-sm font-semibold text-white transition hover:bg-crimson/90 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.15fr]">
        {/* ── Form ── */}
        <div className="space-y-6">
          <Card title="Publishing" icon={CalendarClock}>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={popup.enabled}
                onChange={(e) => patch({ enabled: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-crimson"
              />
              <span className="text-sm font-semibold text-navy">Show the popup on the homepage</span>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Start (optional)">
                <input type="datetime-local" value={toLocalInput(popup.starts_at)} onChange={(e) => patch({ starts_at: fromLocalInput(e.target.value) })} className={INPUT} />
              </Field>
              <Field label="End (optional)">
                <input type="datetime-local" value={toLocalInput(popup.ends_at)} onChange={(e) => patch({ ends_at: fromLocalInput(e.target.value) })} className={INPUT} />
              </Field>
            </div>
            {popup.enabled && problems.length > 0 && (
              <div className="flex gap-2 rounded border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <ul className="space-y-0.5">
                  {problems.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          <Card title="Content" icon={Type}>
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
              {(['text', 'poster'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => patch({ mode: m })}
                  className={`rounded-md py-2 text-sm font-semibold transition ${popup.mode === m ? 'bg-white text-navy shadow-sm' : 'text-slate-500 hover:text-navy'}`}
                >
                  {m === 'text' ? 'Text + buttons' : 'Poster image'}
                </button>
              ))}
            </div>

            {popup.mode === 'text' ? (
              <>
                <Field label="Small label">
                  <input value={popup.eyebrow} onChange={(e) => patch({ eyebrow: e.target.value })} placeholder="Admissions Open 2026-27" className={INPUT} />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Title">
                    <input value={popup.title} onChange={(e) => patch({ title: e.target.value })} placeholder="Begin your" className={INPUT} />
                  </Field>
                  <Field label="Highlight words (optional)">
                    <input value={popup.title_accent} onChange={(e) => patch({ title_accent: e.target.value })} placeholder="engineering journey" className={INPUT} />
                  </Field>
                </div>
                <p className="-mt-2 text-xs text-slate-500">Highlight words follow the title in italic serif, like the homepage hero.</p>
                <Field label={`Text (${popup.body.length}/${HOME_POPUP_BODY_MAX})`}>
                  <textarea rows={3} value={popup.body} onChange={(e) => patch({ body: e.target.value })} className={INPUT} />
                </Field>
              </>
            ) : (
              <Field label="Poster link (optional — where clicking the poster goes)">
                <input value={popup.poster_href} onChange={(e) => patch({ poster_href: e.target.value })} placeholder="/admissions/inquiry or https://…" className={INPUT} />
              </Field>
            )}

            <LinkFields label={popup.mode === 'text' ? 'Main button' : 'Button under the poster (optional)'} link={popup.primary} onChange={(p) => patchLink('primary', p)} />
            <LinkFields label="Second button (optional)" link={popup.secondary} onChange={(p) => patchLink('secondary', p)} />
            <p className="text-xs text-slate-500">Links starting with https:// open in a new tab; site paths like /admissions open in the same tab.</p>
          </Card>

          <Card title={popup.mode === 'text' ? 'Image (optional)' : 'Poster'} icon={ImageIcon}>
            <MediaUploader value={popup.image_url ?? ''} onChange={(url) => patch({ image_url: url || null })} />
            {popup.image_url && (
              <>
                <Field label="Alt text (describe the image for screen readers)">
                  <input value={popup.image_alt} onChange={(e) => patch({ image_alt: e.target.value })} className={INPUT} />
                </Field>
                <div className="space-y-1.5">
                  <span className={LABEL}>Shape</span>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {HOME_POPUP_SHAPES.map((shape) => (
                      <button
                        key={shape.value}
                        type="button"
                        onClick={() => patch({ image_shape: shape.value })}
                        className={`rounded border px-2 py-2 text-left transition ${popup.image_shape === shape.value ? 'border-crimson bg-crimson/5' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <div className="text-xs font-semibold text-navy">{shape.label}</div>
                        <div className="text-[10px] text-slate-500">{shape.hint}</div>
                      </button>
                    ))}
                  </div>
                  {popup.mode === 'text' && (
                    <p className="text-xs text-slate-500">Portrait and square sit beside the text on desktop; landscape and original go above it. On phones the image is always on top.</p>
                  )}
                </div>
                {popup.image_shape !== 'original' && (
                  <div className="space-y-1.5">
                    <span className={LABEL}>Keep in view when cropping</span>
                    <div className="flex flex-wrap gap-2">
                      {HOME_POPUP_FOCUS.map((f) => (
                        <button
                          key={f.value}
                          type="button"
                          onClick={() => patch({ image_focus: f.value })}
                          className={`rounded px-3 py-1.5 text-xs font-semibold transition ${popup.image_focus === f.value ? 'bg-navy text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>

          <Card title="Minimized button" icon={MousePointerClick}>
            <Field label="Label (keep it short)">
              <input value={popup.minimized_label} onChange={(e) => patch({ minimized_label: e.target.value })} maxLength={32} placeholder="Admissions 2026-27" className={INPUT} />
            </Field>
          </Card>
        </div>

        {/* ── Preview ── */}
        <div className="xl:sticky xl:top-4 xl:self-start">
          <PopupPreview popup={popup} />
        </div>
      </div>
    </div>
  );
}

function Card({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: ReactNode }) {
  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <span className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
        <Icon className="h-4 w-4 text-crimson" />
        {title}
      </span>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className={LABEL}>{label}</span>
      {children}
    </label>
  );
}

function LinkFields({ label, link, onChange }: { label: string; link: HomePopupLink; onChange: (p: Partial<HomePopupLink>) => void }) {
  return (
    <div className="space-y-1.5">
      <span className={LABEL}>{label}</span>
      <div className="grid gap-2 sm:grid-cols-2">
        <input value={link.label} onChange={(e) => onChange({ label: e.target.value })} placeholder="Button text" aria-label={`${label} text`} className={INPUT} />
        <input value={link.href} onChange={(e) => onChange({ href: e.target.value })} placeholder="/admissions/inquiry" aria-label={`${label} link`} className={INPUT} />
      </div>
    </div>
  );
}

// ─── Live preview ────────────────────────────────────────────────────────────

const DEVICES = {
  desktop: { width: 1280, height: 800 },
  phone: { width: 390, height: 780 },
} as const;

/**
 * Renders the real HomePopupCard/HomePopupPill at true device size inside a
 * frame, then scales the frame down to fit — so text size, wrapping and image
 * cropping match what visitors see.
 */
function PopupPreview({ popup }: { popup: HomePopup }) {
  const [device, setDevice] = useState<keyof typeof DEVICES>('desktop');
  const [view, setView] = useState<'open' | 'minimized'>('open');
  const boxRef = useRef<HTMLDivElement>(null);
  const [boxWidth, setBoxWidth] = useState(600);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setBoxWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { width, height } = DEVICES[device];
  const scale = device === 'desktop' ? boxWidth / width : Math.min(boxWidth / width, 560 / height);

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Live preview</span>
        <div className="flex gap-2">
          <Segmented
            value={device}
            onChange={setDevice}
            options={[
              { value: 'desktop', label: 'Desktop', icon: Monitor },
              { value: 'phone', label: 'Phone', icon: Smartphone },
            ]}
          />
          <Segmented
            value={view}
            onChange={setView}
            options={[
              { value: 'open', label: 'Open' },
              { value: 'minimized', label: 'Minimized' },
            ]}
          />
        </div>
      </div>

      <div ref={boxRef} className="flex justify-center">
        <div style={{ width: width * scale, height: height * scale }} className="overflow-hidden rounded-lg ring-1 ring-slate-200">
          <div
            // inert: links/buttons in the preview must not navigate the admin away
            inert
            className="relative origin-top-left overflow-hidden"
            style={{ width, height, transform: `scale(${scale})` }}
          >
            {/* Stand-in for the homepage behind the popup */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={campusHero.src} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/20 to-navy-deep/60" />

            {view === 'open' && (
              <>
                <div className="absolute inset-0 bg-ink/40" />
                <PopupStage variant={device} className="absolute inset-0">
                  <div className="flex max-h-full min-h-0 max-w-full">
                    <HomePopupCard popup={popup} variant={device} onMinimize={() => {}} />
                  </div>
                </PopupStage>
              </>
            )}
            <HomePopupPill label={popup.minimized_label || 'Admissions'} pulse position="absolute" hidden={view === 'open'} />
          </div>
        </div>
      </div>
      <p className="text-center text-xs text-slate-400">
        {device === 'desktop' ? '1280 × 800 desktop' : '390 × 780 phone'} · shown at {Math.round(scale * 100)}%
      </p>
    </div>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon?: React.ComponentType<{ className?: string }> }[];
}) {
  return (
    <div className="flex rounded-md bg-slate-100 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold transition ${value === o.value ? 'bg-white text-navy shadow-sm' : 'text-slate-500 hover:text-navy'}`}
        >
          {o.icon && <o.icon className="h-3.5 w-3.5" />}
          {o.label}
        </button>
      ))}
    </div>
  );
}
