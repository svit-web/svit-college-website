# Database Seeding Guide

This directory contains SQL seed files to populate the Supabase database with initial data from static files.

## Seed Files Order

The seeds must be run in dependency order:

1. **01_trusts_institutes.sql** - Foundation tables (trusts, institutes)
2. **02_colleges.sql** - College data (depends on institutes)
3. **03_departments.sql** - Department data (depends on colleges)
4. **04_courses.sql** - Course/program data (depends on departments)
5. **05_committees.sql** - Committee data (depends on colleges)
6. **06_accreditations.sql** - Accreditation data (standalone)
7. **07_placement_statistics.sql** - Placement statistics (depends on colleges)

## Running Seeds

### Option 1: Run All Seeds at Once

```bash
# From project root
psql $DATABASE_URL < supabase/seeds/00_run_all.sql
```

### Option 2: Run Individual Seeds via Supabase Dashboard

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of each seed file (in order)
3. Execute each one

### Option 3: Run via Supabase CLI

```bash
# Individual seed
npx supabase db execute --file supabase/seeds/01_trusts_institutes.sql

# Or run them in sequence
for file in supabase/seeds/{01..07}*.sql; do
  npx supabase db execute --file "$file"
done
```

## Data Sources

All seed data comes from static TypeScript files in `src/data/`:

- `academics.ts` → trusts, institutes, colleges, departments, courses
- `colleges.ts` → college metadata
- `aboutPage.ts` → committees, accreditations
- `placement.ts` → placement statistics

## After Seeding

Once seeds are run, the following tables will be populated:

- `trusts` - 1 record (NEST)
- `institutes` - 1 record (SVIT Group)
- `colleges` - 4 records (SVIT, SVICA, SVION, COA)
- `departments` - 21 records (across all colleges)
- `courses` - 25 records (programs/branches)
- `committees` - 5 records (SVIT committees)
- `accreditations` - 4 records (NBA, AICTE, GTU, NIRF)
- `placement_statistics` - 18 records (yearly data for all colleges)

## Next Steps

After seeding, update the application code to:

1. Create server functions in `src/lib/*.functions.ts` to fetch from these tables
2. Update page routes to use the server functions
3. Remove static data imports from pages
4. Delete static data files once verified
