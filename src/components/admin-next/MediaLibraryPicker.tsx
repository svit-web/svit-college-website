'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Folder, Loader2, Search, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { createClient } from '@/app/lib/supabase/client';

interface MediaFolderRow {
  id: string;
  name: string;
  parent_id: string | null;
}

interface MediaFileRow {
  id: string;
  filename: string;
  file_path: string;
  folder_id: string | null;
}

interface MediaLibraryPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

// Read-only browser over the Media Library (media_files/media_folders) — lets
// any image field reuse something already uploaded instead of uploading a
// duplicate. Management (delete/rename/move) stays on /admin/media; this
// component only selects and closes.
export function MediaLibraryPicker({ open, onClose, onSelect }: MediaLibraryPickerProps) {
  const supabase = useMemo(() => createClient(), []) as any;
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<MediaFolderRow[]>([]);
  const [folders, setFolders] = useState<MediaFolderRow[]>([]);
  const [files, setFiles] = useState<MediaFileRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCurrentFolderId(null);
    setFolderPath([]);
    setSearch('');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);

    const trimmed = search.trim();

    const run = async () => {
      // Search is global (ignores the current folder) so you can find a file
      // without remembering where it was put; browsing without a search term
      // stays scoped to the current folder, folders included.
      let folderRows: MediaFolderRow[] = [];
      if (!trimmed) {
        let folderQuery = supabase.from('media_folders').select('id, name, parent_id').is('deleted_at', null);
        folderQuery = currentFolderId ? folderQuery.eq('parent_id', currentFolderId) : folderQuery.is('parent_id', null);
        const { data } = await folderQuery.order('name', { ascending: true });
        folderRows = data || [];
      }

      let fileQuery = supabase
        .from('media_files')
        .select('id, filename, file_path, folder_id')
        .is('deleted_at', null)
        .ilike('mime_type', 'image/%');
      fileQuery = trimmed ? fileQuery.ilike('filename', `%${trimmed}%`) : fileQuery.eq('folder_id', currentFolderId);
      const { data: fileRows } = await fileQuery.order('created_at', { ascending: false }).limit(200);

      if (cancelled) return;
      setFolders(folderRows);
      setFiles(fileRows || []);
      setLoading(false);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [open, currentFolderId, search, supabase]);

  const openFolder = (folder: MediaFolderRow) => {
    setFolderPath((p) => [...p, folder]);
    setCurrentFolderId(folder.id);
    setSearch('');
  };

  const goToCrumb = (index: number) => {
    if (index < 0) {
      setFolderPath([]);
      setCurrentFolderId(null);
    } else {
      setFolderPath((p) => p.slice(0, index + 1));
      setCurrentFolderId(folderPath[index].id);
    }
    setSearch('');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogTitle>Media Library</DialogTitle>

        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search filenames..."
            className="w-full border-0 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {!search && (
          <div className="flex flex-wrap items-center gap-1 text-xs font-semibold text-slate-500">
            <button type="button" onClick={() => goToCrumb(-1)} className="hover:text-crimson">
              Library
            </button>
            {folderPath.map((f, i) => (
              <span key={f.id} className="flex items-center gap-1">
                <ChevronRight className="h-3 w-3" />
                <button type="button" onClick={() => goToCrumb(i)} className="hover:text-crimson">
                  {f.name}
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="max-h-[28rem] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : folders.length === 0 && files.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">
              {search ? 'No images match that search.' : 'This folder is empty.'}
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3 py-2 sm:grid-cols-4">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => openFolder(folder)}
                  className="flex flex-col items-center gap-1 rounded-lg border border-slate-200 p-3 text-center hover:border-crimson hover:bg-crimson/5"
                >
                  <Folder className="h-8 w-8 text-slate-400" />
                  <span className="truncate w-full text-xs font-semibold text-navy">{folder.name}</span>
                </button>
              ))}
              {files.map((file) => (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => onSelect(file.file_path)}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 hover:border-crimson"
                  title={file.filename}
                >
                  <img src={file.file_path} alt={file.filename} className="h-full w-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 truncate bg-black/60 px-1.5 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100">
                    {file.filename}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
