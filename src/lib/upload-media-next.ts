// Next.js-safe version of upload-media.ts — the original uses the Vite-only
// `@/integrations/supabase/client`. Uses the Phase 2 browser client
// (NEXT_PUBLIC_-prefixed env vars) instead. Server-side compression mode is
// dropped for now (it called a createServerFn RPC that isn't ported) —
// always compresses client-side via WASM, same as the original's fallback
// behavior when no compression-mode setting has loaded yet.
import { createClient } from '@/app/lib/supabase/client';

export interface UploadMediaFileOptions {
  bucketName: string;
  folderPrefix: string;
}

export interface UploadMediaFileResult {
  publicUrl: string;
  path: string;
  size: number;
  mimeType: string;
}

function buildFileName(file: File, folderPrefix: string): string {
  const ext = file.name.split('.').pop();
  return `${folderPrefix}${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
}

async function uploadRawFile(file: File, bucketName: string, fileName: string): Promise<UploadMediaFileResult> {
  const supabase = createClient();
  const { data, error } = await supabase.storage.from(bucketName).upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(data.path);
  return { publicUrl: urlData.publicUrl, path: data.path, size: file.size, mimeType: file.type };
}

async function uploadViaClientCompression(file: File, bucketName: string, fileName: string): Promise<UploadMediaFileResult> {
  const { compressImageFile } = await import('@/lib/image-compression');
  const compressed = await compressImageFile(file);
  const finalName = fileName.replace(/\.[a-zA-Z0-9]+$/, `.${compressed.extension}`);

  const supabase = createClient();
  const { data, error } = await supabase.storage.from(bucketName).upload(finalName, compressed.bytes, {
    cacheControl: '3600',
    upsert: false,
    contentType: compressed.mimeType,
  });
  if (error) throw error;

  const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(data.path);
  return {
    publicUrl: urlData.publicUrl,
    path: data.path,
    size: compressed.compressedSize,
    mimeType: compressed.mimeType,
  };
}

export async function uploadMediaFile(file: File, options: UploadMediaFileOptions): Promise<UploadMediaFileResult> {
  const { bucketName, folderPrefix } = options;
  const fileName = buildFileName(file, folderPrefix);

  if (!file.type.startsWith('image/')) {
    return uploadRawFile(file, bucketName, fileName);
  }

  try {
    return await uploadViaClientCompression(file, bucketName, fileName);
  } catch (err) {
    console.warn('Image compression failed, uploading original file instead:', err);
    return uploadRawFile(file, bucketName, fileName);
  }
}
