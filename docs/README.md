# Docs index

- `infra/SELF_HOSTED_SUPABASE.md` — operations runbook for the self-hosted Supabase
  instance (college server, `user0`): connecting, applying migrations, the full
  resync procedure, and the two things a resync silently breaks every time. Read
  this before touching self-hosted for any reason.
- `architecture/SYSTEM_MAP.md` — full skeleton: every live DB table/column ↔ admin screen ↔ public route, plus a master list of every found gap (broken/misleading/dead/cosmetic)
- `architecture/SEO.md` — SEO & sitemap: how `sitemap.ts`/`robots.ts`, page metadata, canonicals, admin SEO overrides and JSON-LD work; new-page checklist; owner action items
- `migration/` — Next.js migration plan, phase progress/completion logs, and `implemented/` (numbered feature-delivery logs)
- `audits/` — code review, hardcoded-content, and database-normalization audits; `deferred-issues.md` tracks known stale-doc/bug gaps
- `database/` — Supabase schema reference and data dictionary
- `sessions/` — dated session summaries and change logs
- `design/` — design-improvement notes and mockups; `design/BEIGE_DESIGN_SYSTEM.md` is the public-site theme reference
- `testing/` — testing reports, test-user notes
- `guides/` — admin panel usage guides
- `baseline/` — Phase 0 SSR baseline snapshot (diff target for the Phase 8 cutover check)
