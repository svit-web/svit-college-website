// Isomorphic image compression: runs the same in the browser and inside a
// server function (Cloudflare Workers), since every codec here is pure WASM
// (no native binaries, no DOM/canvas dependency).
//
// Routing (mime-type based, intentionally simple for v1):
//   - PNG            -> lossless re-encode via oxipng (real lossless optimization,
//                        not a canvas round-trip). If no resize is needed, the
//                        original bytes are optimised directly with no decode
//                        step at all.
//   - JPEG / WebP     -> decoded to raw pixels and re-encoded as WebP at a high
//                        ("near-lossless") quality — true lossless barely shrinks
//                        real photos, so this is the actual size/speed win.
//   - anything else   -> passthrough, untouched.
// EXIF/metadata is stripped as a side effect of the decode -> raw pixel ->
// encode round trip on the lossy path (the encoders never see the original
// metadata). Known limitation: a PNG that's actually a flattened photo (e.g. a
// phone screenshot) will hit the lossless path and barely shrink; detecting
// that would need a real color/alpha heuristic, deferred to a later pass.

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
};

function extensionFromMime(mimeType: string): string {
  return EXTENSION_BY_MIME[mimeType] ?? mimeType.split("/")[1] ?? "bin";
}

async function resizeIfNeeded(
  pixels: ImageData,
  maxDimension: number
): Promise<{ pixels: ImageData; width: number; height: number; resized: boolean }> {
  const { width, height } = pixels;
  if (Math.max(width, height) <= maxDimension) {
    return { pixels, width, height, resized: false };
  }
  const scale = maxDimension / Math.max(width, height);
  const targetWidth = Math.round(width * scale);
  const targetHeight = Math.round(height * scale);
  const { default: resize } = await import("@jsquash/resize");
  const resized = await resize(pixels, { width: targetWidth, height: targetHeight });
  return { pixels: resized, width: targetWidth, height: targetHeight, resized: true };
}

async function compressPng(input: ArrayBuffer, maxDimension: number, originalSize: number): Promise<CompressImageResult> {
  const { decode } = await import("@jsquash/png");
  const { optimise } = await import("@jsquash/oxipng");

  const decoded = await decode(input);
  const { pixels, width, height, resized } = await resizeIfNeeded(decoded, maxDimension);

  // No resize needed: optimise the original bytes directly (true lossless,
  // no decode/re-encode round trip). Otherwise optimise the resized pixels.
  const optimizedBuffer = await optimise(resized ? pixels : input);

  return {
    bytes: new Uint8Array(optimizedBuffer),
    mimeType: "image/png",
    extension: "png",
    width,
    height,
    originalSize,
    compressedSize: optimizedBuffer.byteLength,
    strategy: "lossless-png",
  };
}

async function compressToWebp(
  input: ArrayBuffer,
  mimeType: string,
  maxDimension: number,
  webpQuality: number,
  originalSize: number
): Promise<CompressImageResult> {
  const decode = mimeType === "image/webp"
    ? (await import("@jsquash/webp")).decode
    : (await import("@jsquash/jpeg")).decode;
  const { encode } = await import("@jsquash/webp");

  const decoded = await decode(input);
  const { pixels, width, height } = await resizeIfNeeded(decoded, maxDimension);

  const encoded = await encode(pixels, { quality: webpQuality });

  return {
    bytes: new Uint8Array(encoded),
    mimeType: "image/webp",
    extension: "webp",
    width,
    height,
    originalSize,
    compressedSize: encoded.byteLength,
    strategy: "lossy-webp",
  };
}

export async function compressImage(
  input: ArrayBuffer,
  mimeType: string,
  opts: CompressImageOptions = {}
): Promise<CompressImageResult> {
  const maxDimension = opts.maxDimension ?? DEFAULT_MAX_DIMENSION;
  const webpQuality = opts.webpQuality ?? DEFAULT_WEBP_QUALITY;
  const originalSize = input.byteLength;

  if (mimeType === "image/png") {
    return compressPng(input, maxDimension, originalSize);
  }
  if (mimeType === "image/jpeg" || mimeType === "image/jpg" || mimeType === "image/webp") {
    return compressToWebp(input, mimeType, maxDimension, webpQuality, originalSize);
  }

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

export async function compressImageFile(file: File, opts?: CompressImageOptions): Promise<CompressImageResult> {
  const buffer = await file.arrayBuffer();
  return compressImage(buffer, file.type, opts);
}
