// Shared upload path for MediaUploader.tsx and admin.media.tsx: builds the
// storage filename, branches on the image_compression_mode setting (client
// WASM compression vs. a server function), and falls back to uploading the
// original file untouched if compression fails for any reason — compression
// should never be a hard blocker for getting an asset live.
import { supabase } from "@/integrations/supabase/client";
import type { ImageCompressionMode } from "@/lib/app-settings.functions";

export interface UploadMediaFileOptions {
  bucketName: string;
  folderPrefix: string; // e.g. "images/" or "media-library/"
  mode: ImageCompressionMode;
}

export interface UploadMediaFileResult {
  publicUrl: string;
  path: string;
  size: number;
  mimeType: string;
}

function buildFileName(file: File, folderPrefix: string): string {
  const ext = file.name.split(".").pop();
  return `${folderPrefix}${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

async function uploadRawFile(file: File, bucketName: string, fileName: string): Promise<UploadMediaFileResult> {
  const { data, error } = await supabase.storage.from(bucketName).upload(fileName, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(data.path);
  return { publicUrl: urlData.publicUrl, path: data.path, size: file.size, mimeType: file.type };
}

async function uploadViaServerCompression(
  file: File,
  bucketName: string,
  fileName: string
): Promise<UploadMediaFileResult> {
  const { uploadCompressedMedia } = await import("@/lib/media-upload.functions");
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const base64 = await fileToBase64(file);

  const result = await uploadCompressedMedia({
    data: { bucketName, path: fileName, mimeType: file.type, base64 },
    headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
  });

  return { publicUrl: result.publicUrl, path: result.path, size: result.compressedSize, mimeType: result.mimeType };
}

async function uploadViaClientCompression(
  file: File,
  bucketName: string,
  fileName: string
): Promise<UploadMediaFileResult> {
  const { compressImageFile } = await import("@/lib/image-compression");
  const compressed = await compressImageFile(file);
  const finalName = fileName.replace(/\.[a-zA-Z0-9]+$/, `.${compressed.extension}`);

  const { data, error } = await supabase.storage.from(bucketName).upload(finalName, compressed.bytes, {
    cacheControl: "3600",
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
  const { bucketName, folderPrefix, mode } = options;
  const fileName = buildFileName(file, folderPrefix);

  if (!file.type.startsWith("image/")) {
    return uploadRawFile(file, bucketName, fileName);
  }

  try {
    return mode === "server"
      ? await uploadViaServerCompression(file, bucketName, fileName)
      : await uploadViaClientCompression(file, bucketName, fileName);
  } catch (err) {
    console.warn("Image compression failed, uploading original file instead:", err);
    return uploadRawFile(file, bucketName, fileName);
  }
}
