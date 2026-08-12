#!/usr/bin/env bash
# Phase 0 — build the complete public URL inventory.
#
# Static routes are derived from src/routes/*.tsx (TanStack flat-dot naming);
# dynamic routes are expanded from Supabase. Output is the diff target for the
# Phase 8 cutover check. See docs/NEXTJS_MIGRATION_PLAN.md §5 Phase 0.
#
# Usage: scripts/build-url-inventory.sh [output_dir]
set -euo pipefail

cd "$(dirname "$0")/.."
OUT="${1:-docs/baseline}"
mkdir -p "$OUT"

set -a; . ./.env; set +a
: "${SUPABASE_URL:?}" "${SUPABASE_PUBLISHABLE_KEY:?}"

api() { # api <path-and-query>
  curl -fsS -H "apikey: ${SUPABASE_PUBLISHABLE_KEY}" "${SUPABASE_URL}/rest/v1/$1"
}
# Extract a single JSON string field from a flat array, one value per line.
field() { sed 's/},{/}\n{/g' | grep -o "\"$1\":\"[^\"]*\"" | cut -d'"' -f4; }

PUB='status=eq.published&deleted_at=is.null'

# ── Static routes ────────────────────────────────────────────────────────────
# A file X.tsx is a layout (not a page) when X.index.tsx or X.<child>.tsx exists.
{
for f in src/routes/*.tsx; do
  b=$(basename "$f" .tsx)
  case "$b" in __root|admin|admin.*) continue;; esac
  case "$b" in *'$'*) continue;; esac                 # dynamic — handled below
  if [ "$b" = "index" ]; then echo "/"; continue; fi
  stem=${b%.index}
  if [ "$stem" = "$b" ]; then                          # not an .index file
    ls src/routes/"$b".*.tsx >/dev/null 2>&1 && continue   # it's a layout
  fi
  echo "/$(echo "$stem" | tr '.' '/')"
done
} | sort -u > "$OUT/urls-static.txt"

# ── Dynamic routes ───────────────────────────────────────────────────────────
{
api "colleges?${PUB}&select=slug"        | field slug | sed 's|^|/colleges/|'
api "colleges?${PUB}&select=slug"        | field slug | sed 's|^|/placement/|'
api "departments?${PUB}&select=code"     | field code | while read -r c; do
  echo "/departments/$c"
  for s in staff labs activities achievements; do echo "/departments/$c/$s"; done
done
api "courses?${PUB}&is_programme=is.true&department_id=is.null&select=code" | field code | while read -r c; do
  echo "/courses/$c"; echo "/courses/$c/faculty"
done
api "courses?${PUB}&select=id"           | field id   | sed 's|^|/programs/|'
api "staff_profiles?${PUB}&employee_code=not.is.null&select=employee_code" \
                                         | field employee_code | sed 's|^|/staff/|'
api "student_clubs?${PUB}&select=slug"   | field slug | while read -r s; do
  echo "/campus-life/clubs/$s"; echo "/campus-life/clubs/$s/events"
done
api "events?${PUB}&select=slug"          | field slug | sed 's|^|/campus-life/events/|'
api "facilities?${PUB}&select=slug"      | field slug | sed 's|^|/campus-life/facilities/|'
api "gallery_albums?${PUB}&select=id"    | field id   | sed 's|^|/gallery/|'
api "centers?${PUB}&select=slug"         | field slug | sed 's|^|/student-corner/|'
} | grep -v '/$' | sort -u > "$OUT/urls-dynamic.txt"

cat "$OUT/urls-static.txt" "$OUT/urls-dynamic.txt" | sort -u > "$OUT/urls.txt"

printf 'static  %5s\ndynamic %5s\nTOTAL   %5s\n' \
  "$(wc -l < "$OUT/urls-static.txt" | tr -d ' ')" \
  "$(wc -l < "$OUT/urls-dynamic.txt" | tr -d ' ')" \
  "$(wc -l < "$OUT/urls.txt" | tr -d ' ')" | tee "$OUT/urls-summary.txt"
