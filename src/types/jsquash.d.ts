declare module '@jsquash/resize' {
  export default function resize(imageData: ImageData, options: { width: number; height: number }): Promise<ImageData>;
}

declare module '@jsquash/png' {
  export function decode(buffer: ArrayBuffer): Promise<ImageData>;
  export function encode(imageData: ImageData): Promise<ArrayBuffer>;
}

declare module '@jsquash/oxipng' {
  export function optimise(data: ImageData | ArrayBuffer, options?: any): Promise<ArrayBuffer>;
}

declare module '@jsquash/webp' {
  export function decode(buffer: ArrayBuffer): Promise<ImageData>;
  export function encode(imageData: ImageData, options?: { quality?: number }): Promise<ArrayBuffer>;
}

declare module '@jsquash/jpeg' {
  export function decode(buffer: ArrayBuffer): Promise<ImageData>;
  export function encode(imageData: ImageData, options?: { quality?: number }): Promise<ArrayBuffer>;
}
