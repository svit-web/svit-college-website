// Server-side path for the "server-side image compression" toggle. Any
// authenticated admin/editor may call this (uploading itself isn't the
// privileged action — only changing the compression-mode setting is, see
// app-settings.functions.ts) — requireSupabaseAuth just proves someone is
// logged in.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

interface UploadCompressedMediaInput {
  bucketName: string;
  path: string;
  mimeType: string;
  base64: string;
}

export const uploadCompressedMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown): UploadCompressedMediaInput => {
    const data = input as Partial<UploadCompressedMediaInput>;
    if (!data.bucketName || !data.path || !data.mimeType || !data.base64) {
      throw new Error("Missing required upload fields");
    }
    return data as UploadCompressedMediaInput;
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { compressImage } = await import("@/lib/image-compression");

    const raw = Uint8Array.from(atob(data.base64), (c) => c.charCodeAt(0));
    const result = await compressImage(raw.buffer, data.mimeType);

    // Re-derive the storage path's extension to match the actual re-encoded
    // format (a .jpg upload compressed to WebP must be stored/served as
    // .webp, or the public URL's Content-Type will be wrong).
    const finalPath = data.path.replace(/\.[a-zA-Z0-9]+$/, `.${result.extension}`);

    const { data: storageData, error } = await supabaseAdmin.storage
      .from(data.bucketName)
      .upload(finalPath, result.bytes, {
        cacheControl: "3600",
        upsert: false,
        contentType: result.mimeType,
      });
    if (error) throw new Error(error.message);

    const { data: urlData } = supabaseAdmin.storage.from(data.bucketName).getPublicUrl(storageData.path);

    return {
      publicUrl: urlData.publicUrl,
      path: storageData.path,
      mimeType: result.mimeType,
      originalSize: result.originalSize,
      compressedSize: result.compressedSize,
      strategy: result.strategy,
    };
  });
