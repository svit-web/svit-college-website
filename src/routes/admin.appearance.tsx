import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuthContext } from "@/contexts/AdminAuthContext";
import { MediaUploader } from "@/components/admin/MediaUploader";
import {
  DEFAULT_HERO_APPEARANCE,
  getHeroAppearance,
  heroOverlayStyles,
  setHeroAppearance,
  MAX_HOMEPAGE_PHOTOS,
  HOMEPAGE_ROTATE_MS,
  type HeroAppearance,
} from "@/lib/theme.functions";
import { Image, Images, Layers, Loader2, Save, ShieldAlert, Sparkles, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import campusHero from "@/assets/campus-hero.jpg";

export const Route = createFileRoute("/admin/appearance")({
  component: AdminAppearancePage,
});

function AdminAppearancePage() {
  const { roles, loading: authLoading } = useAdminAuthContext();
  const isAdmin = roles.some((r) => r.code === "admin");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<HeroAppearance>(DEFAULT_HERO_APPEARANCE);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      setSettings(await getHeroAppearance());
    } catch (err: any) {
      toast.error(`Failed to load appearance settings: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const saved = await setHeroAppearance({
        data: settings,
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
      });
      setSettings(saved);
      toast.success("Hero appearance updated — live on the site now.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setSettings(DEFAULT_HERO_APPEARANCE);
  }

  function setHomepagePhoto(index: number, url: string) {
    setSettings((s) => {
      const slots = Array.from({ length: MAX_HOMEPAGE_PHOTOS }, (_, i) => s.homepagePhotos[i] ?? "");
      slots[index] = url;
      return { ...s, homepagePhotos: slots.filter(Boolean) };
    });
  }

  const { imageStyle, overlayStyle } = heroOverlayStyles(settings);
  const homepageSlots = Array.from({ length: MAX_HOMEPAGE_PHOTOS }, (_, i) => settings.homepagePhotos[i] ?? "");

  if (loading || authLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-crimson" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">
        <p className="flex items-center gap-2 text-sm font-semibold text-amber-600">
          <ShieldAlert className="h-4 w-4" />
          Global Admin access required
        </p>
        <p className="mt-1 text-sm text-slate-500">
          You don't have permission to view or change site-wide appearance settings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-navy md:text-3xl">
            Hero Appearance
          </h1>
          <p className="text-sm text-slate-500">
            One place to control every hero photo across the site — homepage slideshow, about,
            campus life and contact — plus the shared tint/blur overlay. No code changes needed.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="rounded border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 hover:text-navy transition"
          >
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
        {/* Overlay controls */}
        <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Overlay Settings (applies to every hero below)
          </span>
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
            hint="Strength of the navy tint. Higher = darker, better contrast for text."
            value={settings.heroOverlayOpacity}
            min={0}
            max={100}
            suffix="%"
            onChange={(v) => setSettings((s) => ({ ...s, heroOverlayOpacity: v }))}
          />
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
          <div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-semibold text-navy">
                <SlidersHorizontal className="h-4 w-4 text-crimson" />
                Homepage Card Slider
              </label>
              <button
                type="button"
                role="switch"
                aria-checked={settings.heroSliderEnabled}
                onClick={() => setSettings((s) => ({ ...s, heroSliderEnabled: !s.heroSliderEnabled }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.heroSliderEnabled ? "bg-crimson" : "bg-slate-300"}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${settings.heroSliderEnabled ? "translate-x-6" : "translate-x-1"}`}
                />
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Show or hide the highlight card slider on the right side of the homepage hero.
            </p>
          </div>
        </div>

        {/* Live preview */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Live Preview</span>
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-200 shadow-sm">
            <img src={campusHero} alt="" className="absolute inset-0 h-full w-full object-cover" style={imageStyle} />
            <div className="absolute inset-0" style={overlayStyle} />
            <div className="relative flex h-full flex-col justify-center gap-3 p-8 text-white">
              <div className="w-fit rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-gold">
                Est. 2005 · Vasad, Gujarat
              </div>
              <h2 className="font-display text-2xl font-bold leading-tight md:text-3xl">
                Build Your Future.<br />
                <span className="text-gold">Shape The World.</span>
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            This preview mirrors every hero below exactly — save to publish it live.
          </p>
        </div>
      </div>

      {/* Homepage slideshow */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Images className="h-4 w-4 text-crimson" />
          <h2 className="text-sm font-semibold text-navy">Homepage Slideshow Photos</h2>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Up to {MAX_HOMEPAGE_PHOTOS} photos — the homepage hero automatically rotates between them
          every {HOMEPAGE_ROTATE_MS / 1000} seconds with a fade transition. Leave slots empty to use
          fewer photos (a single photo just stays static).
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {homepageSlots.map((url, i) => (
            <div key={i}>
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Photo {i + 1}</span>
              <div className="mt-1">
                <MediaUploader value={url} onChange={(newUrl) => setHomepagePhoto(i, newUrl)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-page backgrounds */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-navy">Page Background Photos</h2>
        <p className="mt-1 text-xs text-slate-500">
          These pages have a plain navy hero until you add a photo here — once set, it uses the same
          overlay/blur settings above.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase">About Page</span>
            <div className="mt-1">
              <MediaUploader
                value={settings.aboutPhoto ?? ""}
                onChange={(url) => setSettings((s) => ({ ...s, aboutPhoto: url || null }))}
              />
            </div>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Campus Life Page</span>
            <div className="mt-1">
              <MediaUploader
                value={settings.campusLifePhoto ?? ""}
                onChange={(url) => setSettings((s) => ({ ...s, campusLifePhoto: url || null }))}
              />
            </div>
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
          {value}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-crimson"
      />
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}
