import imageCompression from "browser-image-compression";

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.2, // 200KB target
  maxWidthOrHeight: 1080,
  useWebWorker: true,
  fileType: "image/webp" as const,
};

export async function compressImage(file: File): Promise<File> {
  const compressed = await imageCompression(file, COMPRESSION_OPTIONS);
  return compressed;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
