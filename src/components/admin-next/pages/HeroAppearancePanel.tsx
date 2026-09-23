'use client';

import { useState } from 'react';
import { MediaUploader } from '@/components/admin-next/MediaUploader';
import { DEFAULT_HERO_APPEARANCE, heroOverlayStyles, heroTextVars, HOMEPAGE_ROTATE_MS, type HeroAppearance } from '@/lib/theme';
import { setHeroAppearance } from '@/lib/theme-next';
import { Image, Images, Layers, Loader2, Save, Sparkles, Type, X } from 'lucide-react';
import { toast } from 'sonner';
import campusHero from '@/assets/campus-hero.jpg';

export function HeroAppearancePanel({ initialAppearance }: { initialAppearance: HeroAppearance }) {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<HeroAppearance>(initialAppearance ?? DEFAULT_HERO_APPEARANCE);

  async function handleSave() {
    setSaving(true);
    try {
      const saved = await setHeroAppearance(settings);
      setSettings(saved);
      toast.success('Hero appearance updated — live on the site now.');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setSettings(DEFAULT_HERO_APPEARANCE);
  }

  function addHomepagePhoto(url: string) {
    if (!url) return;
    setSettings((s) => ({ ...s, homepagePhotos: [...s.homepagePhotos, url] }));
  }

  function removeHomepagePhoto(index: number) {
    setSettings((s) => ({ ...s, homepagePhotos: s.homepagePhotos.filter((_, i) => i !== index) }));
  }

  function moveHomepagePhoto(from: number, to: number) {
    setSettings((s) => {
      if (to < 0 || to >= s.homepagePhotos.length) return s;
      const next = [...s.homepagePhotos];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return { ...s, homepagePhotos: next };
    });
  }

  const { imageStyle, overlayStyle } = heroOverlayStyles(settings);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-navy md:text-3xl">Hero Appearance</h1>
          <p className="text-sm text-slate-500">
            One place to control every hero photo across the site. The tint/blur overlay below applies to the About, Campus Life and Contact heroes, where text sits on top of the photo — the homepage hero shows photos full-bleed with no overlay, so those settings don&apos;t affect it.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleReset} className="rounded border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 hover:text-navy transition">
            Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded bg-crimson px-4 py-2 text-sm font-semibold text-white hover:bg-crimson/90 disabled:opacity-60 transition"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overlay Settings (applies to every hero below)</span>
          <SliderField
            icon={Image}
            label="Photo Visibility"
            hint="How visible the photo is behind the tint. Higher = clearer photo."
            value={settings.heroImageOpacity}
            min={0}
            max={100}
            suffix="%"
            onChange={(v) => setSettings((s) => ({ ...s, heroImageOpacity: v }))}
          />
          <SliderField
            icon={Layers}
            label="Overlay Intensity"
            hint="Strength of the tint. Higher = darker, better contrast for text."
            value={settings.heroOverlayOpacity}
            min={0}
            max={100}
            suffix="%"
            onChange={(v) => setSettings((s) => ({ ...s, heroOverlayOpacity: v }))}
          />
          <div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-semibold text-navy">
                <Layers className="h-4 w-4 text-crimson" />
                Overlay Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.heroOverlayColor ?? '#1b2559'}
                  onChange={(e) => setSettings((s) => ({ ...s, heroOverlayColor: e.target.value }))}
                  className="h-7 w-10 cursor-pointer rounded border border-slate-200 p-0"
                />
                {settings.heroOverlayColor && (
                  <button
                    type="button"
                    onClick={() => setSettings((s) => ({ ...s, heroOverlayColor: null }))}
                    className="text-xs font-semibold text-slate-400 hover:text-crimson"
                  >
                    Reset to navy
                  </button>
                )}
              </div>
            </div>
            <p className="mt-1 text-xs text-slate-500">Color of the tint over hero photos. Defaults to the site's navy.</p>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-semibold text-navy">
                <Type className="h-4 w-4 text-crimson" />
                Text Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.heroTextColor ?? '#ffffff'}
                  onChange={(e) => setSettings((s) => ({ ...s, heroTextColor: e.target.value }))}
                  className="h-7 w-10 cursor-pointer rounded border border-slate-200 p-0"
                />
                {settings.heroTextColor && (
                  <button
                    type="button"
                    onClick={() => setSettings((s) => ({ ...s, heroTextColor: null }))}
                    className="text-xs font-semibold text-slate-400 hover:text-crimson"
                  >
                    Reset to white
                  </button>
                )}
              </div>
            </div>
            <p className="mt-1 text-xs text-slate-500">Color of the title and subtitle text in the hero. Defaults to white.</p>
          </div>
          <SliderField
            icon={Sparkles}
            label="Background Blur"
            hint="Softens the photo so text stays readable without a heavy tint."
            value={settings.heroBlurPx}
            min={0}
            max={20}
            suffix="px"
            onChange={(v) => setSettings((s) => ({ ...s, heroBlurPx: v }))}
          />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Live Preview — About / Campus Life / Contact</span>
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-200 shadow-sm">
            <img src={campusHero.src} alt="" className="absolute inset-0 h-full w-full object-cover" style={imageStyle} />
            <div className="absolute inset-0" style={overlayStyle} />
            <div
              className="relative flex h-full flex-col justify-center gap-3 p-8"
              style={{ ...heroTextVars(settings), color: 'var(--hero-text)' }}
            >
              <div className="w-fit rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-gold">Est. 2005 · Vasad, Gujarat</div>
              <h2 className="font-display text-2xl font-bold leading-tight md:text-3xl">
                Build Your Future.
                <br />
                <span className="text-gold">Shape The World.</span>
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            This mirrors the heroes that show text on top of the photo — About, Campus Life and Contact. The homepage hero doesn&apos;t use this overlay; see its photos below.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Images className="h-4 w-4 text-crimson" />
          <h2 className="text-sm font-semibold text-navy">Homepage Hero</h2>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          The homepage has its own blur and gradient settings (separate from the overlay settings above).
        </p>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <SliderField
              icon={Sparkles}
              label="Homepage Blur"
              hint="Blur amount on the homepage hero background."
              value={settings.homepageBlurPx}
              min={0}
              max={20}
              suffix="px"
              onChange={(v) => setSettings((s) => ({ ...s, homepageBlurPx: v }))}
            />
            <SliderField
              icon={Layers}
              label="Homepage Gradient Opacity"
              hint="Strength of the cream gradient overlay on homepage."
              value={settings.homepageGradientOpacity}
              min={0}
              max={100}
              suffix="%"
              onChange={(v) => setSettings((s) => ({ ...s, homepageGradientOpacity: v }))}
            />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Slideshow Photos</span>
            <p className="mt-1 text-xs text-slate-500">
              As many as you like — automatically rotates every {HOMEPAGE_ROTATE_MS / 1000} seconds with a fade transition. Drag to reorder.
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {settings.homepagePhotos.map((url, i) => (
            <div
              key={url + i}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('text/plain', String(i))}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                moveHomepagePhoto(Number(e.dataTransfer.getData('text/plain')), i);
              }}
              className="group relative cursor-grab overflow-hidden rounded-lg border border-slate-200 active:cursor-grabbing"
            >
              <div className="relative aspect-video w-full">
                <img src={url} alt="" className="absolute inset-0 h-full w-full object-cover" />
              </div>
              <button
                type="button"
                onClick={() => removeHomepagePhoto(i)}
                title="Remove photo"
                className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1 text-slate-600 shadow hover:bg-red-50 hover:text-red-500"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <span className="absolute bottom-1.5 left-1.5 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {i + 1}
              </span>
            </div>
          ))}
          <div>
            <MediaUploader value="" onChange={addHomepagePhoto} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SliderField({
  icon: Icon,
  label,
  hint,
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-semibold text-navy">
          <Icon className="h-4 w-4 text-crimson" />
          {label}
        </label>
        <span className="rounded bg-secondary/60 px-2 py-0.5 text-xs font-bold text-navy">
          {value}
          {suffix}
        </span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-3 w-full accent-crimson" />
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}
