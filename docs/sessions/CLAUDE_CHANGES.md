# Claude's Changes (2026-08-03)

These changes were made by Claude before reverting to commit `bdc2825` (Deep Padhiyar's last commit).

## 1. Fix: Admin Panel Tab Switch Reload Issue

**Problem**: Admin panel was reloading every time you switched between tabs, causing slow navigation and lost form state.

**Root Cause**: TanStack Query had no default `staleTime`, so every navigation treated cached data as immediately stale and refetched everything.

**Solution**:
- Added QueryClient defaults in `src/router.tsx`:
  ```typescript
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
  ```

**Files Changed**:
- `src/router.tsx`

**Impact**: Admin tabs now cache data for 5 minutes, eliminating reload flicker when switching tabs.

---

## 2. Feature: Homepage Hero Slider Toggle

**Problem**: No way to show/hide the card slider on the homepage hero from the admin panel.

**Solution**:
- Added `heroSliderEnabled: boolean` field to `HeroAppearance` interface in `src/lib/theme.functions.ts`
- Added toggle switch in Admin → Hero Appearance page (`src/routes/admin.appearance.tsx`)
- Made homepage hero conditionally render slider based on toggle (`src/routes/index.tsx`)

**Files Changed**:
- `src/lib/theme.functions.ts` — added `heroSliderEnabled` field with default `true`
- `src/routes/admin.appearance.tsx` — added toggle switch UI
- `src/routes/index.tsx` — conditionally render `HeroCardSlider` and adjust grid layout

**Database Changes**: None (stored in existing `app_settings.hero_appearance` JSON)

**Impact**: Admins can now toggle the homepage card slider on/off without touching code.

---

## 3. Fix: SUPABASE_SERVICE_ROLE_KEY Error

**Problem**: When changing blur/appearance settings from `/admin/appearance`, error "Missing Supabase environment variable(s): SUPABASE_SERVICE_ROLE_KEY" appeared.

**Root Cause**:
- `setHeroAppearance` and `setImageCompressionMode` used `supabaseAdmin` (service role client)
- Service role requires `SUPABASE_SERVICE_ROLE_KEY` env var which wasn't set in deployment

**Solution**:
- Created RLS policy on `app_settings` table allowing global admins to write
- Updated both server functions to use `context.supabase` (user's authenticated client) instead of `supabaseAdmin`
- Role check still happens server-side, but write uses user's JWT instead of service role

**Files Changed**:
- `src/lib/theme.functions.ts` — use `context.supabase` instead of `supabaseAdmin`
- `src/lib/app-settings.functions.ts` — same change

**Database Migration**:
```sql
CREATE POLICY "Global admins can write app_settings"
ON app_settings
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND ur.status = 'published'
      AND r.code = 'admin'
      AND ur.scope_type = 'global'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND ur.status = 'published'
      AND r.code = 'admin'
      AND ur.scope_type = 'global'
  )
);
```

**Impact**: Appearance settings save without service role key errors.

---

## 4. Fix: Navigation Menu Dropdown Issues (Attempted)

**Problem**: Navigation dropdowns for Colleges/Campus Life/Placement were broken. Menu items in database had different labels ("Institutes" instead of "Colleges") causing hardcoded label checks to fail.

**Attempted Solution**:
- Added `menu_type` column to `menu_items` table with values: `simple`, `colleges_mega`, `campus_mega`, `placement_mega`
- Updated Header to check `menu_type` instead of hardcoded label strings
- Added "Menu Type" dropdown to admin menu editor
- Forced query refetch with updated query key

**Files Changed**:
- Database migration adding `menu_type` column
- `src/lib/pages.functions.ts` — added `menu_type` to MenuItem interface
- `src/components/site/Header.tsx` — check `menu_type` instead of label
- `src/routes/admin.menus.tsx` — added menu_type field to editor
- `src/lib/homepage.ts` — updated query key to force refetch

**Status**: ⚠️ INCOMPLETE — User requested revert before testing completed

---

## Commits to Revert

Starting from Deep's commit `bdc2825`, remove these commits:
- `7c6f30f` - fix: menu dropdowns not working
- `b6fcdb6` - fix: handle 'Institutes' menu label
- `ecaeda2` - fix: prevent admin panel reload + hero slider toggle (KEEP THIS ONE'S CHANGES)
- All commits by Tirth between `bdc2825` and HEAD

---

## Recommended Next Steps After Revert

1. **Cherry-pick `ecaeda2`** (admin reload fix + hero slider) — these were working correctly
2. **Investigate navigation menu issue** from scratch without the `menu_type` approach
3. **Test in clean environment** to ensure no stale query cache issues

---

## Useful Commands

```bash
# Revert to Deep's commit
git reset --hard bdc2825

# Cherry-pick the admin fixes
git cherry-pick ecaeda2

# Force push (DANGEROUS - coordinate with team)
git push origin admin-portal-test --force
```
