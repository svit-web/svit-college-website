export interface CompressImageOptions {
  maxDimension?: number;
  webpQuality?: number;
}

export interface CompressImageResult {
  bytes: Uint8Array;
  mimeType: string;
  extension: string;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
  strategy: "lossless-png" | "lossy-webp" | "passthrough";
}

const DEFAULT_MAX_DIMENSION = 2000;
const DEFAULT_WEBP_QUALITY = 88;

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/svg+xml": "svg",
  "image/gif": "gif",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
};

function extensionFromMime(mimeType: string): string {
  return EXTENSION_BY_MIME[mimeType] ?? mimeType.split("/")[1] ?? "bin";
}

export async function compressImage(
  input: ArrayBuffer,
  mimeType: string,
  opts: CompressImageOptions = {}
): Promise<CompressImageResult> {
  const maxDimension = opts.maxDimension ?? DEFAULT_MAX_DIMENSION;
  const webpQuality = (opts.webpQuality ?? DEFAULT_WEBP_QUALITY) / 100;
  const originalSize = input.byteLength;

  if (typeof window === "undefined" || typeof Image === "undefined") {
    return {
      bytes: new Uint8Array(input),
      mimeType,
      extension: extensionFromMime(mimeType),
      width: 0,
      height: 0,
      originalSize,
      compressedSize: originalSize,
      strategy: "passthrough",
    };
  }

  return new Promise<CompressImageResult>((resolve) => {
    const blob = new Blob([input], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (Math.max(width, height) > maxDimension) {
        const scale = maxDimension / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve({
          bytes: new Uint8Array(input),
          mimeType,
          extension: extensionFromMime(mimeType),
          width,
          height,
          originalSize,
          compressedSize: originalSize,
          strategy: "passthrough",
        });
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const outMime = mimeType === "image/png" ? "image/png" : "image/webp";
      canvas.toBlob(
        async (outBlob) => {
          if (!outBlob) {
            resolve({
              bytes: new Uint8Array(input),
              mimeType,
              extension: extensionFromMime(mimeType),
              width,
              height,
              originalSize,
              compressedSize: originalSize,
              strategy: "passthrough",
            });
            return;
          }
          const buf = await outBlob.arrayBuffer();
          resolve({
            bytes: new Uint8Array(buf),
            mimeType: outMime,
            extension: extensionFromMime(outMime),
            width,
            height,
            originalSize,
            compressedSize: buf.byteLength,
            strategy: outMime === "image/png" ? "lossless-png" : "lossy-webp",
          });
        },
        outMime,
        webpQuality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        bytes: new Uint8Array(input),
        mimeType,
        extension: extensionFromMime(mimeType),
        width: 0,
        height: 0,
        originalSize,
        compressedSize: originalSize,
        strategy: "passthrough",
      });
    };

    img.src = url;
  });
}

export async function compressImageFile(file: File, opts?: CompressImageOptions): Promise<CompressImageResult> {
  const buffer = await file.arrayBuffer();
  return compressImage(buffer, file.type, opts);
}
