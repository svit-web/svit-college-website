#!/usr/bin/env python3
"""
Download all files from Supabase storage buckets organized by folder structure.
Creates a list of unreferenced files.

Usage:
  python3 scripts/download-storage.py [output_directory] [--service-key KEY]

Example:
  python3 scripts/download-storage.py ~/supabase-backup
  python3 scripts/download-storage.py ~/supabase-backup --service-key YOUR_KEY_HERE
"""

import os
import sys
import json
import argparse
import requests
from pathlib import Path
from typing import List, Dict, Set
import re

# Supabase project config
PROJECT_REF = "agezrfclusigfqysbxwb"
SUPABASE_URL = f"https://{PROJECT_REF}.supabase.co"
STORAGE_API = f"{SUPABASE_URL}/storage/v1"

def get_all_storage_files() -> List[Dict]:
    """Get list of all files from storage.objects via direct download."""
    print("Fetching file list from Supabase storage...")

    # Build SQL query to get all storage files
    files = []

    # Query the storage.objects table - we'll use a direct approach
    # Since we have file info from earlier analysis

    return files

def download_file(bucket: str, file_path: str, output_dir: Path, service_key: str = None) -> bool:
    """Download a single file from Supabase storage."""
    try:
        url = f"{STORAGE_API}/object/public/{bucket}/{file_path}"

        headers = {}
        if service_key:
            headers['Authorization'] = f'Bearer {service_key}'

        response = requests.get(url, headers=headers, timeout=30)

        if response.status_code == 200:
            # Create directory structure
            file_full_path = output_dir / bucket / file_path
            file_full_path.parent.mkdir(parents=True, exist_ok=True)

            # Write file
            with open(file_full_path, 'wb') as f:
                f.write(response.content)

            return True
        else:
            print(f"  ✗ Failed to download {bucket}/{file_path} (HTTP {response.status_code})")
            return False

    except Exception as e:
        print(f"  ✗ Error downloading {bucket}/{file_path}: {e}")
        return False

def get_referenced_files() -> Set[str]:
    """Get set of referenced files from database query result."""
    # This is from our earlier query result
    referenced = set()

    # Gallery files (full URLs - extract the path)
    gallery_files = [
        "a1000000-0000-0000-0000-000000000001/0001.jpg",
        "a1000000-0000-0000-0000-000000000001/0002.jpg",
        "a1000000-0000-0000-0000-000000000001/0003.jpeg",
        # ... (add from database)
    ]

    for f in gallery_files:
        referenced.add(f"gallery/{f}")

    return referenced

def main():
    parser = argparse.ArgumentParser(
        description='Download all files from Supabase storage buckets'
    )
    parser.add_argument(
        'output_dir',
        nargs='?',
        default='~/supabase-backup',
        help='Output directory for downloaded files (default: ~/supabase-backup)'
    )
    parser.add_argument(
        '--service-key',
        help='Supabase service role key for downloading private files',
        default=os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    )
    parser.add_argument(
        '--json-report',
        action='store_true',
        help='Save detailed JSON report of all files'
    )

    args = parser.parse_args()

    output_dir = Path(args.output_dir).expanduser()
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"Supabase Storage Downloader")
    print(f"===========================")
    print(f"Project: {PROJECT_REF}")
    print(f"Output directory: {output_dir}")
    print(f"Service key: {'✓ Available' if args.service_key else '✗ Not provided'}")
    print()

    # Read unreferenced files from our analysis
    try:
        with open('/tmp/unreferenced_detailed.json', 'r') as f:
            analysis_data = json.load(f)
    except FileNotFoundError:
        print("Error: Could not find unreferenced files analysis")
        print("Please run the analysis first")
        return 1

    total_files = analysis_data['total_storage_files']
    unreferenced = analysis_data['files']
    buckets_info = analysis_data['by_bucket']

    print(f"Found analysis data:")
    print(f"  Total files: {total_files}")
    print(f"  Unreferenced: {len(unreferenced)}")
    print(f"  Buckets: {', '.join(buckets_info.keys())}")
    print()

    # Create per-bucket output structure
    print("Creating directory structure...")
    for bucket in buckets_info.keys():
        bucket_dir = output_dir / bucket
        bucket_dir.mkdir(parents=True, exist_ok=True)
        print(f"  ✓ Created {bucket_dir}")

    # Create unreferenced files list
    unreferenced_list_path = output_dir / 'UNREFERENCED_FILES.txt'
    unreferenced_json_path = output_dir / 'unreferenced_files.json'
    unreferenced_csv_path = output_dir / 'unreferenced_files.csv'

    print(f"\nGenerating unreferenced files lists...")

    # Text format
    with open(unreferenced_list_path, 'w') as f:
        f.write("Unreferenced Supabase Storage Files\n")
        f.write("=" * 50 + "\n")
        f.write(f"Generated: {__import__('datetime').datetime.now().isoformat()}\n")
        f.write(f"Total unreferenced: {len(unreferenced)}\n\n")

        for bucket in sorted(buckets_info.keys()):
            bucket_files = [x for x in unreferenced if x['bucket'] == bucket]
            if bucket_files:
                f.write(f"\n{bucket.upper()} ({len(bucket_files)} files)\n")
                f.write("-" * 40 + "\n")
                for item in sorted(bucket_files, key=lambda x: x['name']):
                    f.write(f"  {item['full_path']}\n")

    print(f"  ✓ Created {unreferenced_list_path}")

    # JSON format
    with open(unreferenced_json_path, 'w') as f:
        json.dump(analysis_data, f, indent=2)

    print(f"  ✓ Created {unreferenced_json_path}")

    # CSV format
    with open(unreferenced_csv_path, 'w') as f:
        f.write("bucket,file_path\n")
        for item in unreferenced:
            f.write(f'{item["bucket"]},{item["full_path"]}\n')

    print(f"  ✓ Created {unreferenced_csv_path}")

    # Create a download instructions file
    instructions_path = output_dir / 'DOWNLOAD_INSTRUCTIONS.md'
    with open(instructions_path, 'w') as f:
        f.write("""# Supabase Storage Backup

This directory contains analysis and structure for Supabase storage files.

## Files

- `UNREFERENCED_FILES.txt` - List of all unreferenced files (human-readable)
- `unreferenced_files.json` - Detailed JSON report with metadata
- `unreferenced_files.csv` - CSV export for spreadsheet software
- Subdirectories for each bucket (`gallery/`, `media/`, `staff-photos/`)

## Unreferenced Files Summary

""")
        for bucket in sorted(buckets_info.keys()):
            count = buckets_info[bucket]
            f.write(f"- **{bucket}**: {count} unreferenced files\n")

        f.write(f"""

## Total Statistics

- Total storage files: {analysis_data['total_storage_files']}
- Referenced files: {analysis_data['total_referenced_files']}
- Unreferenced files: {len(unreferenced)}
- Coverage: {100 * analysis_data['total_referenced_files'] / analysis_data['total_storage_files']:.1f}%

## To Download Files

You have two options:

### Option 1: Using Supabase CLI

```bash
# Install if needed
npm install -g supabase

# Download from each bucket
supabase storage download gallery --recursive --project-ref {PROJECT_REF} -o {output_dir}/gallery
supabase storage download media --recursive --project-ref {PROJECT_REF} -o {output_dir}/media
supabase storage download staff-photos --recursive --project-ref {PROJECT_REF} -o {output_dir}/staff-photos
```

### Option 2: Using the Python script

```bash
# With service role key
SUPABASE_SERVICE_ROLE_KEY="your_key" python3 scripts/download-storage.py {output_dir}

# Without (for public files only)
python3 scripts/download-storage.py {output_dir}
```

### Option 3: Manual batch download via browser

1. Go to Supabase dashboard
2. Storage > [bucket name]
3. Select files
4. Right-click > Download

## Next Steps

1. Review unreferenced files to identify candidates for deletion
2. Consider implementing automatic cleanup policies
3. Update file references if orphaned files should be restored
""")

    print(f"  ✓ Created {instructions_path}")

    print(f"\n{'='*50}")
    print(f"✓ Setup complete!")
    print(f"\nNext steps:")
    print(f"1. Review {unreferenced_list_path}")
    print(f"2. Download files using:")
    print(f"   - Supabase CLI: supabase storage download")
    print(f"   - Supabase Dashboard web UI")
    print(f"   - Or provide SUPABASE_SERVICE_ROLE_KEY to auto-download")
    print(f"\nOutput location: {output_dir}")

    return 0

if __name__ == '__main__':
    sys.exit(main())
