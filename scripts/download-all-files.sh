#!/bin/bash
# Download all files from Supabase storage buckets

set -e

PROJECT_REF="agezrfclusigfqysbxwb"
SUPABASE_URL="https://${PROJECT_REF}.supabase.co"
OUTPUT_DIR="${1:-~/supabase-backup}"
OUTPUT_DIR=$(eval echo "$OUTPUT_DIR")

echo "=========================================="
echo "Supabase Storage Downloader"
echo "=========================================="
echo "Project: $PROJECT_REF"
echo "Output: $OUTPUT_DIR"
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track download statistics
total_downloaded=0
total_failed=0
total_bytes=0

# Function to download a file
download_file() {
    local bucket="$1"
    local file_path="$2"
    local output_file="${OUTPUT_DIR}/${bucket}/${file_path}"

    # Create directory structure
    mkdir -p "$(dirname "$output_file")"

    # Try to download
    local url="${SUPABASE_URL}/storage/v1/object/public/${bucket}/${file_path}"

    if curl -sf "$url" -o "$output_file" 2>/dev/null; then
        ((total_downloaded++))
        local file_size=$(stat -f%z "$output_file" 2>/dev/null || stat -c%s "$output_file" 2>/dev/null || echo "0")
        total_bytes=$((total_bytes + file_size))
        echo -e "${GREEN}✓${NC} $bucket/$file_path"
        return 0
    else
        ((total_failed++))
        echo -e "${YELLOW}⚠${NC} Failed: $bucket/$file_path"
        rm -f "$output_file"
        return 1
    fi
}

# Download referenced gallery files (these are public and should work)
echo -e "\n${BLUE}Downloading Gallery Files...${NC}"
gallery_files=(
    "a1000000-0000-0000-0000-000000000001/0001.jpg"
    "a1000000-0000-0000-0000-000000000001/0002.jpg"
    "a1000000-0000-0000-0000-000000000001/0003.jpeg"
    "a1000000-0000-0000-0000-000000000001/0004.jpeg"
    "a1000000-0000-0000-0000-000000000001/0005.jpg"
    "a1000000-0000-0000-0000-000000000001/0006.jpg"
    "a1000000-0000-0000-0000-000000000001/0007.jpg"
    "a1000000-0000-0000-0000-000000000001/0008.jpg"
    "a1000000-0000-0000-0000-000000000001/0009.jpg"
    "a1000000-0000-0000-0000-000000000001/0010.jpg"
    # Add more as needed - full list can be generated from database
)

for file in "${gallery_files[@]}"; do
    download_file "gallery" "$file"
done

# Download sample unreferenced files from media bucket
echo -e "\n${BLUE}Downloading Unreferenced Media Files (samples)...${NC}"

media_files=(
    "facilities/058166f2-be6b-40c9-85ba-e672e8fc0d1b.jpg"
    "facilities/0b73762b-95b4-4bce-a082-51f06e44e0cd.jpg"
    "facilities/17c044b8-c2f0-4076-bffd-5fcec1eb0eaa.jpg"
    "images/1784627677035-cwhw67.jpeg"
    "images/1784627688863-at0x86.jpg"
    "images/1785135629250-udpgqb.jpg"
)

for file in "${media_files[@]}"; do
    download_file "media" "$file"
done

# Download staff-photos
echo -e "\n${BLUE}Downloading Staff Photos (unreferenced)...${NC}"

staff_files=(
    "3f46b1a7-beff-46b3-8f19-936cf932f8d7.jpg"
    "a21a40e2-ec56-4f39-9aec-d06360cf18d7.jpg"
    "ea47f111-7419-4f91-9bb7-3dc443bd680e.png"
)

for file in "${staff_files[@]}"; do
    download_file "staff-photos" "$file"
done

# Summary
echo -e "\n=========================================="
echo -e "${GREEN}Download Complete${NC}"
echo "=========================================="
echo "Downloaded: $total_downloaded files"
echo "Failed: $total_failed files"
if [ $total_bytes -gt 0 ]; then
    echo "Total size: $((total_bytes / 1024 / 1024)) MB"
fi
echo "Output directory: $OUTPUT_DIR"
echo ""

# Show directory structure
echo -e "${BLUE}Directory Structure:${NC}"
if command -v tree &> /dev/null; then
    tree -L 3 "$OUTPUT_DIR"
else
    find "$OUTPUT_DIR" -type d | head -20
fi

echo ""
echo "Next steps:"
echo "1. Review the downloaded files"
echo "2. Check $OUTPUT_DIR/UNREFERENCED_FILES.txt for the complete list"
echo "3. Use the CSV file for further analysis in a spreadsheet"
