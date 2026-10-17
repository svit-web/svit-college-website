#!/usr/bin/env python3
"""
Download all files from Supabase storage and organize by bucket.

Usage:
  python3 scripts/download-storage-files.py ~/supabase-backup
"""

import os
import sys
import json
import argparse
import requests
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, List, Tuple
import time

PROJECT_REF = "agezrfclusigfqysbxwb"
SUPABASE_URL = f"https://{PROJECT_REF}.supabase.co"
STORAGE_API = f"{SUPABASE_URL}/storage/v1"

class StorageDownloader:
    def __init__(self, output_dir: Path, max_workers: int = 5):
        self.output_dir = output_dir
        self.max_workers = max_workers
        self.stats = {
            'downloaded': 0,
            'failed': 0,
            'skipped': 0,
            'total_bytes': 0,
        }
        self.failed_files = []

    def ensure_dir(self, bucket: str, file_path: str) -> Path:
        """Create directory structure for file."""
        output_file = self.output_dir / bucket / file_path
        output_file.parent.mkdir(parents=True, exist_ok=True)
        return output_file

    def download_file(self, bucket: str, file_path: str) -> Tuple[bool, str]:
        """Download a single file from Supabase storage."""
        try:
            url = f"{STORAGE_API}/object/public/{bucket}/{file_path}"
            output_file = self.ensure_dir(bucket, file_path)

            # Skip if already exists
            if output_file.exists():
                self.stats['skipped'] += 1
                return True, "skipped"

            # Download with timeout
            response = requests.get(url, timeout=30, stream=True)

            if response.status_code == 200:
                # Write file
                with open(output_file, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        if chunk:
                            f.write(chunk)

                file_size = output_file.stat().st_size
                self.stats['downloaded'] += 1
                self.stats['total_bytes'] += file_size
                return True, f"downloaded ({file_size} bytes)"
            else:
                self.stats['failed'] += 1
                self.failed_files.append((bucket, file_path, response.status_code))
                return False, f"HTTP {response.status_code}"

        except requests.exceptions.Timeout:
            self.stats['failed'] += 1
            self.failed_files.append((bucket, file_path, "timeout"))
            return False, "timeout"
        except Exception as e:
            self.stats['failed'] += 1
            self.failed_files.append((bucket, file_path, str(e)))
            return False, str(e)

    def download_all(self, files: List[Dict]) -> None:
        """Download all files using thread pool."""
        print(f"\n{'='*60}")
        print(f"Starting download of {len(files)} files")
        print(f"Output directory: {self.output_dir}")
        print(f"Max workers: {self.max_workers}")
        print(f"{'='*60}\n")

        start_time = time.time()

        # Group files by bucket for better organization
        files_by_bucket = {}
        for file_info in files:
            bucket = file_info['bucket']
            if bucket not in files_by_bucket:
                files_by_bucket[bucket] = []
            files_by_bucket[bucket].append(file_info)

        # Download with progress
        completed = 0
        total = len(files)

        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            # Submit all tasks
            future_to_file = {}
            for file_info in files:
                bucket = file_info['bucket']
                file_path = file_info['name']
                future = executor.submit(self.download_file, bucket, file_path)
                future_to_file[future] = (bucket, file_path)

            # Process completed downloads
            for future in as_completed(future_to_file):
                bucket, file_path = future_to_file[future]
                completed += 1
                try:
                    success, msg = future.result()
                    status = "✓" if success else "✗"
                    print(f"[{completed:3d}/{total}] {status} {bucket}/{file_path} ({msg})")
                except Exception as e:
                    self.stats['failed'] += 1
                    print(f"[{completed:3d}/{total}] ✗ {bucket}/{file_path} (error: {e})")

        elapsed = time.time() - start_time
        self._print_summary(elapsed)

    def _print_summary(self, elapsed: float) -> None:
        """Print download summary."""
        print(f"\n{'='*60}")
        print(f"Download Summary")
        print(f"{'='*60}")
        print(f"Downloaded:  {self.stats['downloaded']:4d} files")
        print(f"Skipped:     {self.stats['skipped']:4d} files (already exist)")
        print(f"Failed:      {self.stats['failed']:4d} files")

        if self.stats['total_bytes'] > 0:
            mb = self.stats['total_bytes'] / 1024 / 1024
            print(f"Total size:  {mb:6.2f} MB")

        print(f"Time elapsed: {elapsed:.1f} seconds")

        if self.failed_files:
            print(f"\n{'='*60}")
            print(f"Failed Downloads ({len(self.failed_files)}):")
            print(f"{'='*60}")
            for bucket, file_path, reason in self.failed_files[:20]:
                print(f"  {bucket}/{file_path} - {reason}")
            if len(self.failed_files) > 20:
                print(f"  ... and {len(self.failed_files) - 20} more")

        print()

def get_all_storage_files() -> List[Dict]:
    """Get complete list of storage files from our analysis."""
    try:
        with open('/tmp/unreferenced_detailed.json', 'r') as f:
            data = json.load(f)
            return data.get('files', [])
    except FileNotFoundError:
        print("Error: Could not find storage analysis data")
        print("Run the initial analysis first")
        sys.exit(1)

def get_referenced_gallery_files() -> List[Dict]:
    """Get list of all gallery files (we know these are referenced)."""
    # This would need to be generated from the database
    # For now, return empty - they can be fetched separately
    return []

def main():
    parser = argparse.ArgumentParser(
        description='Download all Supabase storage files organized by bucket'
    )
    parser.add_argument(
        'output_dir',
        nargs='?',
        default='~/supabase-backup',
        help='Output directory (default: ~/supabase-backup)'
    )
    parser.add_argument(
        '--workers',
        type=int,
        default=5,
        help='Number of concurrent download workers (default: 5)'
    )
    parser.add_argument(
        '--skip-existing',
        action='store_true',
        default=True,
        help='Skip files that already exist (default: true)'
    )
    parser.add_argument(
        '--unreferenced-only',
        action='store_true',
        help='Download only unreferenced files'
    )

    args = parser.parse_args()

    output_dir = Path(args.output_dir).expanduser()
    output_dir.mkdir(parents=True, exist_ok=True)

    # Get files to download
    if args.unreferenced_only:
        files = get_all_storage_files()
        print(f"Downloading {len(files)} unreferenced files")
    else:
        # For full download, would need to fetch from storage.objects table
        files = get_all_storage_files()
        print(f"Downloading {len(files)} files (unreferenced)")

    if not files:
        print("No files to download")
        sys.exit(1)

    # Create downloader and start
    downloader = StorageDownloader(output_dir, max_workers=args.workers)
    downloader.download_all(files)

    # Save manifest
    manifest_file = output_dir / 'MANIFEST.json'
    with open(manifest_file, 'w') as f:
        json.dump({
            'project': PROJECT_REF,
            'stats': downloader.stats,
            'failed_files': downloader.failed_files,
            'timestamp': __import__('datetime').datetime.now().isoformat(),
        }, f, indent=2)

    print(f"Manifest saved to: {manifest_file}")

if __name__ == '__main__':
    main()
