#!/usr/bin/env bash
# Phase 0 — capture rendered SSR HTML + SEO metadata for every public URL.
#
# Full HTML goes to docs/baseline/html/ (gitignored, large). The extracted
# metadata TSV is committed — it is the diff-friendly Phase 8 comparison target.
#
# Usage: scripts/capture-baseline-html.sh [base_url] [url_list] [out_dir]
set -euo pipefail
cd "$(dirname "$0")/.."

BASE="${1:-http://127.0.0.1:3111}"
LIST="${2:-docs/baseline/urls.txt}"
OUT="${3:-docs/baseline}"
HTML="$OUT/html"
JOBS=6

mkdir -p "$HTML"
: > "$OUT/metadata.tsv"
: > "$OUT/capture-errors.txt"

# Pull one attribute value out of a tag matched by a marker. Tolerates the
# attribute appearing before or after the marker within the same tag.
meta() { # meta <file> <marker-regex>
  grep -ao "<meta[^>]*$2[^>]*>" "$1" 2>/dev/null | head -1 \
    | grep -ao 'content="[^"]*"' | head -1 | sed -e 's/content="//' -e 's/"$//'
}

# grep -c prints 0 but exits 1 on no match, so `|| echo 0` would emit a second
# line and corrupt the TSV row. Count occurrences and collapse to one line.
count_occurrences() { # count_occurrences <file> <pattern>
  { grep -ao "$2" "$1" 2>/dev/null || true; } | wc -l | tr -d ' '
}

fetch_one() {
  url="$1"; base="$2"; html="$3"; out="$4"
  safe=$(printf '%s' "$url" | sed 's|^/||; s|/|_|g'); [ -z "$safe" ] && safe="__root__"
  f="$html/$safe.html"

  read -r code redirects final <<<"$(curl -sSL --max-time 60 -o "$f" \
      -w '%{http_code} %{num_redirects} %{url_effective}' \
      "$base$url" 2>>"$out/capture-errors.txt" || echo '000 0 -')"
  final=${final#"$base"}
  [ "$redirects" = "0" ] && final=""
  bytes=$(wc -c < "$f" 2>/dev/null | tr -d ' '); [ -z "$bytes" ] && bytes=0

  title=$(grep -ao '<title>[^<]*</title>' "$f" 2>/dev/null | head -1 | sed -e 's|<title>||' -e 's|</title>||')
  desc=$(meta "$f" 'name="description"')
  ogtitle=$(meta "$f" 'property="og:title"')
  ogimg=$(meta "$f" 'property="og:image"')
  robots=$(meta "$f" 'name="robots"')
  canon=$(grep -ao '<link[^>]*rel="canonical"[^>]*>' "$f" 2>/dev/null | head -1 \
            | grep -ao 'href="[^"]*"' | head -1 | sed -e 's/href="//' -e 's/"$//')
  h1=$(count_occurrences "$f" '<h1')
  ld=$(count_occurrences "$f" 'application/ld+json')

  printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\n' \
    "$url" "$code" "$redirects" "$final" "$bytes" "$title" "$desc" \
    "$ogtitle" "$ogimg" "$canon" "$robots" "$h1" "$ld" \
    >> "$out/metadata.tsv"
}
export -f fetch_one meta count_occurrences

printf 'url\thttp\tredirects\tfinal_url\tbytes\ttitle\tdescription\tog_title\tog_image\tcanonical\trobots\th1_count\tjsonld\n' \
  > "$OUT/metadata.header.tsv"

total=$(wc -l < "$LIST" | tr -d ' ')
echo "Capturing $total URLs from $BASE (concurrency $JOBS)…"
# xargs -P for parallelism; bash -c so the exported function is available.
< "$LIST" xargs -P "$JOBS" -I{} bash -c 'fetch_one "$@"' _ {} "$BASE" "$HTML" "$OUT"

sort -o "$OUT/metadata.tsv" "$OUT/metadata.tsv"
cat "$OUT/metadata.header.tsv" "$OUT/metadata.tsv" > "$OUT/metadata.full.tsv"
mv "$OUT/metadata.full.tsv" "$OUT/metadata.tsv"
rm -f "$OUT/metadata.header.tsv"

echo "--- captured: $(( $(wc -l < "$OUT/metadata.tsv" | tr -d ' ') - 1 )) / $total ---"
