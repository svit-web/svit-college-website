#!/bin/bash
# Master script to apply all faculty and diploma data to Supabase
# Run this after reviewing the FACULTY_AUDIT_REPORT.txt

set -e  # Exit on error

echo "======================================"
echo "SVIT Faculty & Diploma Data Migration"
echo "======================================"
echo ""

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "ERROR: psql not found. Please install PostgreSQL client."
    exit 1
fi

# Database connection (update these values)
DB_HOST="aws-0-ap-south-1.pooler.supabase.com"
DB_PORT="6543"
DB_NAME="postgres"
DB_USER="postgres.agezrfclusigfqysbxwb"
DB_PASS="Kk8gDBpLZo1l8GAA"

DB_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

echo "Database: ${DB_HOST}/${DB_NAME}"
echo ""

# Confirm before proceeding
read -p "This will add 267 faculty members to the database. Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo "Step 1: Verifying departments exist..."
psql "$DB_URL" -c "SELECT slug, name FROM departments WHERE slug LIKE 'dept-%' ORDER BY slug;" || {
    echo "ERROR: Could not query departments table"
    exit 1
}

echo ""
echo "Step 2: Adding SVIT faculty (201 staff)..."
psql "$DB_URL" -f supabase/seeds/09_faculty_svit.sql || {
    echo "ERROR: Failed to add SVIT faculty"
    exit 1
}

echo ""
echo "Step 3: Adding Architecture faculty (26 staff)..."
psql "$DB_URL" -f supabase/seeds/09_faculty_svit-coa.sql || {
    echo "ERROR: Failed to add Architecture faculty"
    exit 1
}

echo ""
echo "Step 4: Adding SVICA faculty (11 staff)..."
psql "$DB_URL" -f supabase/seeds/09_faculty_svica.sql || {
    echo "ERROR: Failed to add SVICA faculty"
    exit 1
}

echo ""
echo "Step 5: Adding Nursing faculty (29 staff)..."
psql "$DB_URL" -f supabase/seeds/09_faculty_svion.sql || {
    echo "ERROR: Failed to add Nursing faculty"
    exit 1
}

echo ""
echo "Step 6: Updating diploma course and department details..."
psql "$DB_URL" -f supabase/seeds/10_diploma_details.sql || {
    echo "ERROR: Failed to update diploma details"
    exit 1
}

echo ""
echo "======================================"
echo "✓ Migration Complete!"
echo "======================================"
echo ""
echo "Summary:"
echo "  - Added 267 working faculty members"
echo "  - Updated diploma course information"
echo "  - Updated department details (about, vision, mission)"
echo ""
echo "Verification:"
echo "  Run: psql \"$DB_URL\" -c \"SELECT COUNT(*) FROM staff_profiles;\""
echo "  Run: psql \"$DB_URL\" -c \"SELECT COUNT(*) FROM staff_department_assignments;\""
echo ""
