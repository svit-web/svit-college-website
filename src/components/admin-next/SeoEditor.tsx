'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import { MediaUploader } from './MediaUploader';
import { Globe, Settings2, Image as ImageIcon, Loader2, Sparkles, Save } from 'lucide-react';
import { toast } from 'sonner';

interface SeoEditorProps {
  seoId: string | null;
  onChange: (newSeoId: string) => void;
}

export function SeoEditor({ seoId, onChange }: SeoEditorProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [formValues, setFormValues] = useState({
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    canonical_url: '',
    og_title: '',
    og_description: '',
    og_image_url: '',
    twitter_card: 'summary_large_image',
    robots_directives: 'index, follow',
  });

  useEffect(() => {
    if (!seoId) {
      setFormValues({
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        canonical_url: '',
        og_title: '',
        og_description: '',
        og_image_url: '',
        twitter_card: 'summary_large_image',
        robots_directives: 'index, follow',
      });
      return;
    }

    async function loadSeoMetadata() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('seo_metadata').select('*').eq('id', seoId!).maybeSingle();

        if (error) throw error;
        if (data) {
          setFormValues({
            meta_title: data.meta_title || '',
            meta_description: data.meta_description || '',
            meta_keywords: Array.isArray(data.meta_keywords) ? data.meta_keywords.join(', ') : '',
            canonical_url: data.canonical_url || '',
            og_title: data.og_title || '',
            og_description: data.og_description || '',
            og_image_url: data.og_image_url || '',
            twitter_card: data.twitter_card || 'summary_large_image',
            robots_directives: data.robots_directives || 'index, follow',
          });
        }
      } catch (err: any) {
        console.error('Failed to load SEO metadata:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSeoMetadata();
  }, [seoId]);

  const handleFieldChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSeo = async () => {
    setSaving(true);
    try {
      const keywordsArray = formValues.meta_keywords
        ? formValues.meta_keywords.split(',').map((k) => k.trim()).filter(Boolean)
        : [];

      const payload = {
        meta_title: formValues.meta_title || null,
        meta_description: formValues.meta_description || null,
        meta_keywords: keywordsArray,
        canonical_url: formValues.canonical_url || null,
        og_title: formValues.og_title || null,
        og_description: formValues.og_description || null,
        og_image_url: formValues.og_image_url || null,
        twitter_card: formValues.twitter_card,
        robots_directives: formValues.robots_directives,
        status: 'published',
      };

      const supabase = createClient();
      if (seoId) {
        const { error } = await supabase.from('seo_metadata').update(payload as any).eq('id', seoId);
        if (error) throw error;
        toast.success('SEO headers updated!');
      } else {
        const { data, error } = await supabase.from('seo_metadata').insert(payload as any).select('id').single();
        if (error) throw error;
        if (data) {
          onChange(data.id);
          toast.success('SEO metadata configured and linked!');
        }
      }
    } catch (err: any) {
      console.error('SEO save failed:', err);
      toast.error(`SEO save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 bg-white text-left hover:bg-slate-50 transition"
      >
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-crimson" />
          <span className="text-sm font-semibold text-navy">SEO Headers & OpenGraph Settings</span>
          {seoId && (
            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-200">Configured</span>
          )}
        </div>
        <Settings2 className={`h-4 w-4 text-slate-500 transform transition ${isOpen ? 'rotate-90 text-navy' : ''}`} />
      </button>

      {isOpen && (
        <div className="p-4 border-t border-slate-200 bg-white space-y-4">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-crimson" />
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Meta Title</label>
                  <input
                    type="text"
                    placeholder="Page Title — SVIT Vasad"
                    value={formValues.meta_title}
                    onChange={(e) => handleFieldChange('meta_title', e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-crimson/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Robots Directives</label>
                  <select
                    value={formValues.robots_directives}
                    onChange={(e) => handleFieldChange('robots_directives', e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-crimson/50"
                  >
                    <option value="index, follow">Index, Follow (Standard)</option>
                    <option value="noindex, nofollow">Noindex, Nofollow (Hidden Page)</option>
                    <option value="noindex, follow">Noindex, Follow</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Meta Description</label>
                <textarea
                  placeholder="Enter page summary description for Google search snippet (recommended under 160 characters)..."
                  value={formValues.meta_description}
                  onChange={(e) => handleFieldChange('meta_description', e.target.value)}
                  rows={2}
                  className="w-full rounded border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-crimson/50"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Meta Keywords</label>
                  <input
                    type="text"
                    placeholder="e.g. engineering, college, vasad, admissions"
                    value={formValues.meta_keywords}
                    onChange={(e) => handleFieldChange('meta_keywords', e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-crimson/50"
                  />
                  <p className="text-[9px] text-slate-500">Comma-separated keywords.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Canonical Link URL</label>
                  <input
                    type="text"
                    placeholder="e.g. https://svitvasad.ac.in/about"
                    value={formValues.canonical_url}
                    onChange={(e) => handleFieldChange('canonical_url', e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-crimson/50"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-3">
                <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-crimson" /> OpenGraph Social Sharing Card Preview
                </h4>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-600 uppercase">OG Card Title</label>
                    <input
                      type="text"
                      placeholder="Title for WhatsApp / Twitter / LinkedIn sharing card"
                      value={formValues.og_title}
                      onChange={(e) => handleFieldChange('og_title', e.target.value)}
                      className="w-full rounded border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-crimson/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-600 uppercase">Twitter Card Size</label>
                    <select
                      value={formValues.twitter_card}
                      onChange={(e) => handleFieldChange('twitter_card', e.target.value)}
                      className="w-full rounded border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-crimson/50"
                    >
                      <option value="summary_large_image">Large Image Preview card</option>
                      <option value="summary">Small Icon Summary card</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-600 uppercase">OG Card Description</label>
                  <textarea
                    placeholder="Description displayed on WhatsApp/Facebook sharing card..."
                    value={formValues.og_description}
                    onChange={(e) => handleFieldChange('og_description', e.target.value)}
                    rows={2}
                    className="w-full rounded border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-crimson/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-600 uppercase flex items-center gap-1">
                    <ImageIcon className="h-3 w-3" /> OG Image Banner URL
                  </label>
                  <MediaUploader value={formValues.og_image_url} onChange={(url) => handleFieldChange('og_image_url', url)} type="image" />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleSaveSeo}
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded bg-crimson px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-crimson/90 disabled:opacity-50 transition"
                >
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  <span>Save SEO settings</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
