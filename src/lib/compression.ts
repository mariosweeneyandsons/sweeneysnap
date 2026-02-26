import imageCompression from "browser-image-compression";

interface CompressOptions {
  maxSizeMB?: number;
}

export async function compressImage(file: File, options?: CompressOptions): Promise<File> {
  const compressed = await imageCompression(file, {
    maxSizeMB: options?.maxSizeMB ?? 0.2,
    maxWidthOrHeight: 1080,
    useWebWorker: true,
    fileType: "image/webp" as const,
  });
  return compressed;
}
