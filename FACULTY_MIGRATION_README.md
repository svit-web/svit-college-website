# Faculty & Diploma Data Migration Guide

**Generated:** 2026-09-17  
**Status:** Ready to execute  
**Total Faculty:** 267 working employees (40 resigned excluded)

---

## 📊 Summary

This migration adds complete faculty data from the latest Excel file to your Supabase database:

- ✅ **267 working faculty members** across 4 colleges, 21 departments
- ✅ **Employee codes** stored in metadata for external tracking
- ✅ **Resigned employees excluded** (40 people not added)
- ✅ **Diploma course details** (intake, fees, eligibility, career info)
- ✅ **Department information** (about, vision, mission for all departments)
- ✅ **ON CONFLICT handling** - safe to run multiple times

---

## 📁 Files Generated

### Seed Files (in `supabase/seeds/`)

| File | Description | Count |
|------|-------------|-------|
| `09_faculty_svit.sql` | SVIT Engineering faculty | 201 staff |
| `09_faculty_svit-coa.sql` | Architecture (COA) faculty | 26 staff |
| `09_faculty_svica.sql` | Computer Applications faculty | 11 staff |
| `09_faculty_svion.sql` | Nursing faculty | 29 staff |
| `10_diploma_details.sql` | Diploma courses & dept details | Updates |

### Scripts (in `scripts/`)

| File | Purpose |
|------|---------|
| `generate_faculty_seeds.py` | Generates faculty seed files from Excel |
| `audit_faculty_data.py` | Creates audit report of what's in Excel |
| `apply_faculty_migration.sh` | Executes all seed files in correct order |

### Reports

| File | Description |
|------|-------------|
| `FACULTY_AUDIT_REPORT.txt` | Complete list of all working & resigned staff |
| `faculty_summary.json` | JSON summary of migration |

---

## 🏢 Faculty Breakdown by College

| College | Working | Resigned | Total |
|---------|---------|----------|-------|
| **SVIT (Engineering)** | 227 | 26 | 253 |
| **SVION (Nursing)** | 29 | 13 | 42 |
| **SVICA (Computer Applications)** | 11 | 1 | 12 |
| **COA (Architecture)** | - | - | - |
| **TOTAL** | **267** | **40** | **307** |

---

## 🎓 Diploma Departments (6 total)

1. **Computer Engineering (Diploma)** - 4 staff
2. **Information Technology (Diploma)** - 3 staff
3. **Electrical Engineering (Diploma)** - 3 staff
4. **Mechanical Engineering (Diploma)** - 5 staff
5. **Civil Engineering (Diploma)** - 2 staff
6. **Applied Science & Humanities (Diploma)** - 6 staff (support department)

Each diploma department now has:
- ✅ Complete course information (intake: 60, duration: 3 years)
- ✅ Eligibility criteria (10th Standard SSC)
- ✅ Program highlights and career opportunities
- ✅ About, vision, mission statements

---

## 🚀 Quick Start

### Option 1: Using Bash Script (Recommended)

```bash
cd /Users/porus/code/svit-college-website

# Review the audit report first
cat FACULTY_AUDIT_REPORT.txt

# Make script executable
chmod +x scripts/apply_faculty_migration.sh

# Run the migration
./scripts/apply_faculty_migration.sh
```

### Option 2: Manual Execution via psql

```bash
cd /Users/porus/code/svit-college-website

DB_URL="postgresql://postgres.agezrfclusigfqysbxwb:Kk8gDBpLZo1l8GAA@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"

# Execute seed files in order
psql "$DB_URL" -f supabase/seeds/09_faculty_svit.sql
psql "$DB_URL" -f supabase/seeds/09_faculty_svit-coa.sql
psql "$DB_URL" -f supabase/seeds/09_faculty_svica.sql
psql "$DB_URL" -f supabase/seeds/09_faculty_svion.sql
psql "$DB_URL" -f supabase/seeds/10_diploma_details.sql
```

### Option 3: Using Supabase SQL Editor

1. Open your Supabase dashboard
2. Go to SQL Editor
3. Copy and paste each seed file content
4. Execute in order (09_faculty_*, then 10_diploma_details)

---

## ✅ Verification

After running the migration, verify the data:

```sql
-- Check total staff profiles
SELECT COUNT(*) as total_staff FROM staff_profiles;
-- Expected: 267

-- Check staff by department
SELECT 
  d.name as department,
  COUNT(sda.id) as staff_count
FROM departments d
LEFT JOIN staff_department_assignments sda ON sda.department_id = d.id
WHERE sda.status = 'published'
GROUP BY d.name
ORDER BY staff_count DESC;

-- Check employee codes are stored
SELECT 
  first_name,
  last_name,
  metadata->>'employee_code' as emp_code
FROM staff_profiles
WHERE metadata->>'employee_code' IS NOT NULL
LIMIT 10;

-- Check diploma courses updated
SELECT name, intake, duration, description
FROM courses
WHERE department_id IN (
  SELECT id FROM departments WHERE slug LIKE 'dept-svit-dip-%'
);

-- Check diploma department details
SELECT slug, name, about, vision
FROM departments
WHERE slug LIKE 'dept-svit-dip-%';
```

---

## 📝 Data Structure

### Staff Profile
```sql
staff_profiles (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE,
  title TEXT,  -- Mr., Mrs., Ms., Dr., Prof.
  metadata JSONB {
    employee_code: "103-NMS",
    gender: "Female",
    department: "AERONAUTICAL ENGINEERING",
    full_name: "MRS. NIYATI MAULIN SHAH"
  }
)
```

### Staff Department Assignment
```sql
staff_department_assignments (
  id UUID,
  staff_id UUID -> staff_profiles,
  department_id UUID -> departments,
  designation_override TEXT,  -- ASSISTANT PROFESSOR, LECTURER, etc.
  is_primary BOOLEAN,
  metadata JSONB {
    employee_code: "103-NMS"
  }
)
```

---

## 🔄 Updating Faculty Data

If you get a new Excel file with updated staff:

```bash
# 1. Place new Excel file at:
/Users/porus/Downloads/Employee_List_by_Department.xlsx

# 2. Regenerate seed files
python3 scripts/generate_faculty_seeds.py

# 3. Review audit report
python3 scripts/audit_faculty_data.py
cat FACULTY_AUDIT_REPORT.txt

# 4. Apply updates
./scripts/apply_faculty_migration.sh
```

The seed files use `ON CONFLICT (email) DO UPDATE` so they're safe to rerun.

---

## ⚠️ Important Notes

1. **Resigned Employees:** The scripts automatically exclude anyone with status "Resigned" or "Left"
2. **Employee Codes:** All faculty have their original employee code (e.g., "103-NMS") stored in metadata JSONB
3. **Email Generation:** Emails are auto-generated as `firstnamelastname@svitvasad.ac.in`
4. **Idempotent:** All seed files use `ON CONFLICT` clauses - safe to run multiple times
5. **No Data Loss:** This adds new data, doesn't delete existing records

---

## 📋 Next Steps

After running the migration:

1. ✅ Verify faculty counts match expected numbers (267 total)
2. ✅ Check diploma department details are populated
3. ✅ Verify employee codes are accessible in metadata
4. ✅ Test faculty pages on your website
5. ✅ Add faculty photos/bios if needed (currently not in Excel)

---

## 🐛 Troubleshooting

### "Department not found"
**Problem:** Department slug doesn't exist in database  
**Solution:** Run `03_departments.sql` first to ensure all departments exist

### "Duplicate key violation"
**Problem:** Email already exists  
**Solution:** This is normal - the script updates existing records. Check if the ON CONFLICT clause is present.

### "Connection refused"
**Problem:** Can't connect to Supabase  
**Solution:** Check your DB credentials in the script or use Supabase SQL Editor

### "Permission denied"
**Problem:** Script not executable  
**Solution:** `chmod +x scripts/apply_faculty_migration.sh`

---

## 📞 Support

- **Audit Report:** Check `FACULTY_AUDIT_REPORT.txt` for complete staff listing
- **Scripts:** All scripts have error handling and clear output
- **Database:** Use Supabase dashboard SQL Editor for manual verification

---

**Ready to execute?** Run `./scripts/apply_faculty_migration.sh` and follow the prompts!
