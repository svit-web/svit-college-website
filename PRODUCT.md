# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are prospective students/parents researching admissions, programs, fees, and scholarships before applying, and alumni/general public browsing news, events, gallery, and institutional info. A secondary admin-side user is internal staff managing content through the admin panel (CSV imports for faculty/achievements, staff wizards, media/appearance editors, homepage/menu/event management, placements, inquiries, etc.).

## Product Purpose

The public site is the digital front door for Sardar Vallabhbhai Institute of Technology (SVIT), Vasad — an AICTE-approved campus offering engineering, management, and applied sciences programmes on a 15-acre campus in Vasad, Gujarat. It informs prospective students/parents and the public, and drives admissions inquiries. The admin panel lets internal staff manage all dynamic content (colleges, courses, staff, events, placements, scholarships, homepage, media, menus) without developer involvement.

## Positioning

SVIT operates as a multi-institute group under one umbrella — engineering, management, and applied sciences colleges unified under a single content/admin system (reflected in the `colleges/[college]`, `departments/[dept]`, `programs/[program]`, and `placement/[college]` route structure). A single rival institute page cannot truthfully replicate this multi-college structure with one shared backend.

## Operating Context

- Built on Next.js (App Router), with a public route group `(site)` and a separate `admin` app for internal staff.
- Content is Supabase-backed and dynamic: colleges, departments, programs, staff, events, placements, scholarships, gallery, news, and homepage content are all editable via the admin panel rather than hardcoded.
- Migrated from an earlier stack (Lovable/Vite) to Next.js; migration phase docs live under `docs/migration/`.
- Admin workflows include CSV bulk import (faculty, achievements), staff wizards, appearance/theme settings, menu management, and soft-delete/trash + audit logging.

## Capabilities and Constraints

- The admin panel must remain fully functional through any optimization work — no regressions to CSV imports, staff wizards, media/appearance editors, menu management, or any other admin CRUD flow.
- Public pages are Supabase-driven; optimization must not introduce stale-data bugs from over-aggressive caching of dynamic content (colleges, staff, events, placements, inquiries).
- Institution name/branding ("SVIT Vasad — Sardar Vallabhbhai Institute of Technology") and factual claims (AICTE-approved, 15-acre Vasad, Gujarat campus) are binding and must not be altered without explicit approval.

## Product Principles

- Public-facing pages exist to inform and convert prospective students/parents — clarity and fast information access matter more than visual flourish on these pages.
- The admin panel is an internal operate surface: staff completing tasks (imports, edits, publishing) outranks expression; consistency and predictability matter most.
- Content lives in Supabase, not in code — any performance or design change must preserve the dynamic, database-driven nature of the site.
- The multi-college/multi-institute structure is a core architectural fact, not an incidental detail — routes, admin models, and future features should assume more than one college may exist.
