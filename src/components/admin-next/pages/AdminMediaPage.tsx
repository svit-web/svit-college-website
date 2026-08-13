'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import { Folder, Plus, Trash2, ChevronRight, Upload, Image as ImageIcon, Loader2, FolderPlus, ExternalLink, Edit2, X, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { uploadMediaFile } from '@/lib/upload-media-next';
import type { AdminUser } from '@/app/lib/auth/admin';

function formatBytes(bytes: number, decimals = 2) {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function AdminMediaPage({ admin }: { admin: AdminUser }) {
  const supabase = useMemo(() => createClient(), []) as any;
  const userId = admin.id;

  const userScope = useMemo(() => {
    if (!admin.roles || admin.roles.length === 0) return { level: 'none' as const, departmentId: undefined as string | null | undefined };
    const primaryRole = admin.roles[0];
    const isGlobal = admin.roles.some((r) => r.code === 'admin');
    return {
      level: (isGlobal ? 'global' : primaryRole.scope_type || 'none') as string,
      departmentId: primaryRole.department_id,
    };
  }, [admin.roles]);

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderHistory, setFolderHistory] = useState<any[]>([]);

  const [folders, setFolders] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolder, setEditingFolder] = useState<any | null>(null);

  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [updatingFile, setUpdatingFile] = useState(false);

  const [uploading, setUploading] = useState(false);

  const loadDirectory = async () => {
    setLoading(true);
    try {
      let folderQuery = supabase.from('media_folders').select('*').is('deleted_at', null);
      folderQuery = currentFolderId ? folderQuery.eq('parent_id', currentFolderId) : folderQuery.is('parent_id', null);
      if (userScope.level === 'department' && userScope.departmentId) {
        folderQuery = folderQuery.eq('department_id', userScope.departmentId);
      }
      const { data: foldersData, error: foldersErr } = await folderQuery.order('name', { ascending: true });
      if (foldersErr) throw foldersErr;
      setFolders(foldersData || []);

      let filesQuery = supabase.from('media_files').select('*').is('deleted_at', null);
      filesQuery = currentFolderId ? filesQuery.eq('folder_id', currentFolderId) : filesQuery.is('folder_id', null);
      if (userScope.level === 'department' && userScope.departmentId) {
        filesQuery = filesQuery.eq('department_id', userScope.departmentId);
      }
      const { data: filesData, error: filesErr } = await filesQuery.order('filename', { ascending: true });
      if (filesErr) throw filesErr;
      setFiles(filesData || []);
    } catch (err: any) {
      toast.error(`Error loading media files: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDirectory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFolderId, userScope.level, userScope.departmentId]);

  const handleEnterFolder = (folder: any) => {
    setFolderHistory((prev) => [...prev, folder]);
    setCurrentFolderId(folder.id);
  };

  const handleSaveFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      const payload: Record<string, any> = {
        name: newFolderName.trim(),
        parent_id: currentFolderId,
        scope_type: userScope.level === 'global' ? 'global' : userScope.level,
        department_id: userScope.level === 'department' ? userScope.departmentId : null,
      };

      if (editingFolder) {
        const { error } = await supabase.from('media_folders').update({ name: newFolderName.trim(), updated_at: new Date().toISOString() }).eq('id', editingFolder.id);
        if (error) throw error;
        toast.success('Folder renamed successfully!');
      } else {
        const { error } = await supabase.from('media_folders').insert(payload);
        if (error) throw error;
        toast.success('Folder created successfully!');
      }

      setIsFolderModalOpen(false);
      setNewFolderName('');
      setEditingFolder(null);
      loadDirectory();
    } catch (err: any) {
      toast.error(`Folder error: ${err.message}`);
    }
  };

  const handleDeleteFolder = async (folder: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm(`Are you sure you want to delete folder "${folder.name}"?`);
    if (!confirmed) return;

    try {
      const { error } = await supabase.from('media_folders').update({ deleted_at: new Date().toISOString(), deleted_by: userId }).eq('id', folder.id);
      if (error) throw error;
      toast.success('Folder deleted.');
      loadDirectory();
    } catch (err: any) {
      toast.error(`Failed to delete folder: ${err.message}`);
    }
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    setUploading(true);
    try {
      const uploaded = await uploadMediaFile(file, {
        bucketName: 'media',
        folderPrefix: 'media-library/',
      });

      const payload = {
        folder_id: currentFolderId,
        filename: file.name,
        file_path: uploaded.publicUrl,
        mime_type: uploaded.mimeType || 'application/octet-stream',
        file_size: uploaded.size,
        scope_type: userScope.level === 'global' ? 'global' : userScope.level,
        department_id: userScope.level === 'department' ? userScope.departmentId : null,
        status: 'published',
      };

      const { error: dbErr } = await supabase.from('media_files').insert(payload);
      if (dbErr) throw dbErr;

      toast.success('File uploaded to library successfully!');
      loadDirectory();
    } catch (err: any) {
      toast.error(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleOpenFileModal = (file: any) => {
    setSelectedFile(file);
    setAltText(file.alt_text || '');
    setCaption(file.caption || '');
    setIsFileModalOpen(true);
  };

  const handleSaveFileDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUpdatingFile(true);
    try {
      const { error } = await supabase
        .from('media_files')
        .update({ alt_text: altText.trim() || null, caption: caption.trim() || null, updated_at: new Date().toISOString() })
        .eq('id', selectedFile.id);

      if (error) throw error;
      toast.success('File details updated!');
      setIsFileModalOpen(false);
      loadDirectory();
    } catch (err: any) {
      toast.error(`Failed to update details: ${err.message}`);
    } finally {
      setUpdatingFile(false);
    }
  };

  const handleDeleteFile = async (file: any) => {
    const confirmed = window.confirm(`Are you sure you want to permanently delete file "${file.filename}"?`);
    if (!confirmed) return;

    try {
      const urlParts = file.file_path.split('/public/media/');
      const storagePath = urlParts[1];

      if (storagePath) {
        const { error: storageErr } = await supabase.storage.from('media').remove([storagePath]);
        if (storageErr) console.warn('Storage deletion warning:', storageErr);
      }

      const { error: dbErr } = await supabase.from('media_files').delete().eq('id', file.id);
      if (dbErr) throw dbErr;

      toast.success('File deleted successfully!');
      setIsFileModalOpen(false);
      loadDirectory();
    } catch (err: any) {
      toast.error(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-navy md:text-3xl">Media Library</h1>
          <p className="text-sm text-slate-500">Browse and organize visual assets and document downloads</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingFolder(null);
              setNewFolderName('');
              setIsFolderModalOpen(true);
            }}
            className="flex items-center gap-2 rounded bg-slate-100 hover:bg-slate-200 px-4 py-2 text-sm font-semibold text-navy border border-slate-200"
          >
            <FolderPlus className="h-4 w-4 text-crimson" />
            <span>Create Folder</span>
          </button>

          <label className="flex items-center gap-2 rounded bg-crimson hover:bg-crimson/90 px-4 py-2 text-sm font-semibold text-white cursor-pointer shadow">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            <span>Upload File</span>
            <input type="file" onChange={handleUploadFile} disabled={uploading} className="hidden" />
          </label>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-white p-3 border border-slate-200">
        <button
          onClick={() => {
            setFolderHistory([]);
            setCurrentFolderId(null);
          }}
          className="text-xs font-semibold text-crimson hover:text-crimson/80"
        >
          Media Library
        </button>

        {folderHistory.map((folder, index) => (
          <div key={folder.id} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
            <button
              onClick={() => {
                const newHistory = folderHistory.slice(0, index + 1);
                setFolderHistory(newHistory);
                setCurrentFolderId(folder.id);
              }}
              className="text-xs font-semibold text-slate-700 hover:text-navy"
            >
              {folder.name}
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white font-mono/20 p-6 min-h-96 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 z-10 rounded-xl">
            <Loader2 className="h-8 w-8 animate-spin text-crimson" />
          </div>
        )}

        {folders.length === 0 && files.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ImageIcon className="h-12 w-12 text-slate-700 mb-4" />
            <h3 className="text-lg font-bold text-navy">This Folder is Empty</h3>
            <p className="text-xs text-slate-500 max-w-xs mt-1">Drag files here, or use the buttons above to add documents and subfolders.</p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {folders.map((folder) => (
              <div
                key={folder.id}
                onClick={() => handleEnterFolder(folder)}
                className="group flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white/50 p-4 cursor-pointer hover:border-crimson/50 hover:bg-slate-100 transition shadow-md"
              >
                <div className="relative mb-3 text-amber-500">
                  <Folder className="h-12 w-12 fill-amber-500/10" />
                </div>

                <span className="text-xs font-bold text-slate-800 text-center truncate w-full px-1">{folder.name}</span>

                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingFolder(folder);
                      setNewFolderName(folder.name);
                      setIsFolderModalOpen(true);
                    }}
                    className="p-1 text-slate-500 hover:text-navy"
                    title="Rename"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={(e) => handleDeleteFolder(folder, e)} className="p-1 text-slate-500 hover:text-red-400" title="Delete">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {files.map((file) => {
              const isImage = file.mime_type.startsWith('image/');

              return (
                <div
                  key={file.id}
                  onClick={() => handleOpenFileModal(file)}
                  className="group flex flex-col rounded-xl border border-slate-200 bg-white/50 overflow-hidden cursor-pointer hover:border-crimson/50 hover:bg-slate-100 transition shadow-md"
                >
                  <div className="relative h-28 w-full bg-slate-100 flex items-center justify-center border-b border-slate-200/50">
                    {isImage ? (
                      <img src={file.file_path} alt={file.alt_text || file.filename} className="h-full w-full object-cover group-hover:scale-105 transition duration-300" />
                    ) : (
                      <FileText className="h-10 w-10 text-crimson" />
                    )}
                  </div>

                  <div className="p-3 flex-1 flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-700 truncate mb-1">{file.filename}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{formatBytes(file.file_size)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isFolderModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-950/80 p-4 z-50">
          <div className="relative w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-2xl">
            <button onClick={() => setIsFolderModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-navy">
              <X className="h-5 w-5" />
            </button>

            <h2 className="font-display text-lg font-bold text-navy mb-4">{editingFolder ? 'Rename Folder' : 'Create Subfolder'}</h2>

            <form onSubmit={handleSaveFolder} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Folder Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Circulars, Placement-2026"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full rounded font-mono px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsFolderModalOpen(false)} className="rounded border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 hover:text-navy">
                  Cancel
                </button>
                <button type="submit" className="rounded bg-crimson hover:bg-crimson/90 px-4 py-2 text-sm font-semibold text-white">
                  {editingFolder ? 'Rename' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isFileModalOpen && selectedFile && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-950/80 p-4 z-50 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-2xl flex flex-col md:flex-row gap-6 max-h-[90vh]">
            <button onClick={() => setIsFileModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-navy z-10">
              <X className="h-5 w-5" />
            </button>

            <div className="md:w-1/2 flex flex-col items-center justify-center bg-slate-100 rounded-lg p-4 border border-slate-200">
              {selectedFile.mime_type.startsWith('image/') ? (
                <div className="relative overflow-hidden rounded max-h-72 w-full">
                  <img src={selectedFile.file_path} alt={selectedFile.filename} className="object-contain w-full h-full max-h-64" />
                </div>
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded bg-white text-crimson">
                  <FileText className="h-16 w-16" />
                </div>
              )}

              <div className="mt-4 w-full text-center space-y-1">
                <p className="text-xs font-semibold text-slate-700 truncate max-w-xs mx-auto">{selectedFile.filename}</p>
                <p className="text-[10px] text-slate-500 font-mono">
                  {selectedFile.mime_type} · {formatBytes(selectedFile.file_size)}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveFileDetails} className="md:w-1/2 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <h3 className="font-display text-lg font-bold text-navy">Asset Settings</h3>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Storage Public URL:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={selectedFile.file_path}
                      onClick={(e) => {
                        (e.target as HTMLInputElement).select();
                        navigator.clipboard.writeText(selectedFile.file_path);
                        toast.success('URL copied to clipboard!');
                      }}
                      className="w-full rounded border border-slate-200 bg-white font-mono px-3 py-1.5 text-xs text-slate-500 font-mono focus:outline-none cursor-pointer"
                    />
                    <a href={selectedFile.file_path} target="_blank" rel="noreferrer" className="rounded border border-slate-200 p-2 bg-slate-100 text-slate-500 hover:text-navy" title="Open file">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Alt Text (SEO)</label>
                  <input
                    type="text"
                    placeholder="Short description of image contents"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    className="w-full rounded font-mono px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Caption / Description</label>
                  <textarea
                    placeholder="Longer context details"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={2}
                    className="w-full rounded font-mono px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => handleDeleteFile(selectedFile)}
                  className="flex items-center gap-1.5 rounded bg-red-500/10 hover:bg-red-500/20 px-3.5 py-2 text-xs font-bold text-red-400 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Permanently</span>
                </button>

                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsFileModalOpen(false)} className="rounded border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 hover:text-navy">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingFile}
                    className="flex items-center gap-1.5 rounded bg-crimson hover:bg-crimson/90 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    {updatingFile && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
