# 🚀 How to Run the Database Seeds

## Quick Start - Copy & Paste Method (Recommended)

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard/project/agezrfclusigfqysbxwb/sql/new

2. **Copy the entire seed file**
   - Open: `supabase/seeds/ALL_SEEDS_COMBINED.sql`
   - Select all (Cmd+A / Ctrl+A)
   - Copy (Cmd+C / Ctrl+C)

3. **Paste and Run**
   - Paste into the SQL Editor
   - Click "Run" or press Cmd+Enter / Ctrl+Enter

4. **Verify Success**
   - You should see success messages
   - Check the Tables in the sidebar to see populated data

## What Gets Seeded

After running, you'll have:
- ✅ **1 Trust** - NEST (New English School Trust)
- ✅ **1 Institute** - SVIT Group of Institutions
- ✅ **4 Colleges** - SVIT, SVICA, SVION, COA
- ✅ **21 Departments** - Across all colleges
- ✅ **25 Courses** - Programs/branches
- ✅ **5 Committees** - Women Development, Grievance Redressal, etc.
- ✅ **4 Accreditations** - NBA, AICTE, GTU, NIRF
- ✅ **18 Placement Records** - Yearly statistics for all 4 colleges

## Troubleshooting

### If you get "relation does not exist" errors:
- The tables haven't been created yet
- Run your migrations first: `npx supabase db push`

### If you get "duplicate key" errors:
- Data already exists
- The script uses `ON CONFLICT DO NOTHING` so it's safe to rerun

### If you get "permission denied" errors:
- You may need to be signed in as the project owner
- Or use service_role key in API requests

## Next Steps

After seeding completes:
1. ✅ Verify data in Supabase Dashboard → Table Editor
2. 📝 Create server functions to fetch this data
3. 🔄 Update pages to use server functions instead of static data
4. 🗑️ Remove static data files

## Individual Seed Files

If you prefer to run seeds one at a time:
```
supabase/seeds/
├── 01_trusts_institutes.sql
├── 02_colleges.sql
├── 03_departments.sql
├── 04_courses.sql
├── 05_committees.sql
├── 06_accreditations.sql
└── 07_placement_statistics.sql
```

Run them in order via SQL Editor.
