# 11 — Centre pages filled from existing content

Fills the sections added in change 10 using only what the site already stated.
Applied to production on 2026-10-30 through the REST API (service-role key) with the
same guards as the SQL file; the SQL file is the record and is safe to re-run.

## Migration: `supabase/migrations/20261030150000_centre_pages_seed.sql` (applied)
- **CoE lab** (`centers.metadata.lab`): name, partner (Edunet Foundation, SAP CSR) and a short
  description, from the CoE description's opening paragraphs.
- **Equipment**: Computers (20), Server (1), IoT devices, from the "Advanced Lab
  Infrastructure" highlight.
- **Programmes**: the 7 programmes listed in the CoE description (Code Unnati, E2E — SAP,
  Green and AI Skills Internship, FDPs, IBM SkillsBuild, Microsoft Elevate, Short-Term
  Technical Workshops).
- **Team**: Prof. Pradish Dadhania (Coordinator & SPOC) and Prof. Nikesha Patel (Joint
  Coordinator), linked to their staff profiles.
- **CoE description** shortened to its overview paragraphs (the programmes and coordinators
  now have their own sections). The previous full text is in the audit log.
- **Tags**: MoUs EDUNET (SAP) and EDUNET (IBM) → CoE; the two "Best NSS Volunteer"
  achievements → NSS / NCC.

## Not filled (no existing content)
CoE events and achievements; NSS / NCC equipment, programmes, MoUs, events and team. Add or
tick them on `/admin/coe` and `/admin/nss-ncc`.
