import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { DEFAULT_HERO_APPEARANCE, getHeroAppearance, heroOverlayStyles, setHeroAppearance, type HeroAppearance } from "@/lib/theme.functions";
import { Image, Layers, Loader2, Save, ShieldAlert, Sparkles } from "lucide-react";
import { toast } from "sonner";
import campusHero from "@/assets/campus-hero.jpg";

export const Route = createFileRoute("/admin/appearance")({
  component: AdminAppearancePage,
});

function AdminAppearancePage() {
  const { roles, loading: authLoading } = useAdminAuth();
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

      await setHeroAppearance({
        data: settings,
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
      });
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

  const { imageStyle, overlayStyle } = heroOverlayStyles(settings);

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
            Controls the campus photo overlay on the homepage and college landing page heroes — no code changes needed.
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
        {/* Controls */}
        <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <SliderField
            icon={Image}
            label="Photo Visibility"
            hint="How visible the campus photo is behind the tint. Higher = clearer photo."
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
            This preview mirrors the homepage and college page heroes exactly — save to publish it live.
          </p>
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
