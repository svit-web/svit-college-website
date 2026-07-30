-- =========================================================================
-- app_settings: minimal generic key/value config table.
-- Reads are public (matches house style); writes are enforced application-side
-- (service_role only, gated by a global-admin role check in a server function)
-- — no INSERT/UPDATE RLS policy, matching every other table in this repo.
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES public.user_profiles(id)
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read app_settings" ON public.app_settings FOR SELECT USING (true);

GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT ALL ON public.app_settings TO service_role;

-- Seed the single setting this feature needs: whether image uploads are
-- compressed in the browser ("client") or via a server function ("server").
INSERT INTO public.app_settings (key, value)
VALUES ('image_compression_mode', '"client"'::jsonb)
ON CONFLICT (key) DO NOTHING;
