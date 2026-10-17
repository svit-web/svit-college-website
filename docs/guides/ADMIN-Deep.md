# SVIT Admin Panel

Location: `/admin`

---

## Routes

| URL | Page | Description |
|-----|------|-------------|
| `/admin` | Dashboard | Stats overview & quick actions |
| `/admin/homepage` | Homepage Items | Manage hero, stats, carousel, why-choose cards, trust badges, promo banners |
| `/admin/events` | Events | CRUD campus events & news |
| `/admin/recruiters` | Recruiters | Manage recruiting partner companies |
| `/admin/colleges` | Colleges | Manage institutes under SVIT Group |
| `/admin/posts` | Posts | Blog posts, articles, announcements |
| `/admin/login` | Login | Supabase Auth sign-in |

---

## Tech Stack

- **Framework:** React 19 + TanStack Start
- **Routing:** TanStack Router (file-based)
- **Data:** TanStack Query + Supabase
- **UI:** Tailwind CSS v4, Radix UI, Lucide icons
- **Auth:** Supabase Auth (email/password)

---

## Setup

### 1. Apply the migration

Run this SQL in your Supabase SQL Editor:

```sql
-- Creates admin_users table and RLS write policies
-- File: supabase/migrations/20260721000000_admin_panel.sql
```

### 2. Add service role key

Get it from Supabase Dashboard → Settings → API → `service_role` key.

Add to `.env`:

```
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### 3. Create an admin user

In Supabase Dashboard → Authentication → Users → Add User. Create an email + password.

Then run:

```sql
INSERT INTO admin_users (user_id, email, display_name, role)
VALUES (
  '<user-id-from-above>',
  'admin@svitvasad.ac.in',
  'Admin',
  'admin'
);
```

### 4. Sign in

Visit `/admin/login` and sign in with the credentials from step 3.

---

## Development (no auth)

The auth guard is currently bypassed for development. Open `/admin` directly to see the dashboard. To re-enable auth, restore the `useEffect` and `supabase.auth.getSession()` check in `src/routes/admin.tsx`.

---

## Server Functions

All admin CRUD operations are in `src/lib/admin.functions.ts`:

| Function | Method | Description |
|----------|--------|-------------|
| `checkAdminAuth` | GET | Verify session + admin role |
| `getDashboardStats` | GET | Counts for all entities |
| `getHomepageItems` | GET | All homepage_items |
| `upsertHomepageItem` | POST | Create / update homepage item |
| `deleteHomepageItem` | POST | Delete homepage item |
| `getEvents` | GET | All events |
| `upsertEvent` | POST | Create / update event |
| `deleteEvent` | POST | Delete event |
| `getRecruiters` | GET | All recruiters |
| `upsertRecruiter` | POST | Create / update recruiter |
| `deleteRecruiter` | POST | Delete recruiter |
| `getColleges` | GET | All colleges |
| `upsertCollege` | POST | Create / update college |
| `deleteCollege` | POST | Delete college |
| `getPosts` | GET | All posts |
| `upsertPost` | POST | Create / update post |
| `deletePost` | POST | Delete post |

Auth middleware (`requireAdmin`) verifies the user exists in the `admin_users` table before allowing any operation.

---

## Database Tables

### `admin_users`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `user_id` | uuid | References `auth.users` |
| `email` | text | |
| `display_name` | text | |
| `role` | text | `admin` or `editor` |
| `is_active` | boolean | |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### Managed Tables

- `homepage_items` — Hero, stats, carousel, why-choose, trust badges, promo cards
- `events` — Campus events with tags and dates
- `recruiters` — Recruiting partner companies
- `colleges` — Institutes under SVIT Group
- `posts` — Blog / news articles

---

## Components

Located in `src/components/admin/`:

| Component | Description |
|-----------|-------------|
| `Sidebar.tsx` | Dark navy sidebar with nav links + sign out |
| `DataTable.tsx` | Generic table with columns, edit/delete actions, add button |
| `FormDialog.tsx` | Modal dialog with Field, Input, Textarea, Select sub-components |
