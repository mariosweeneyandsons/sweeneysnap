import { SupabaseClient } from "@supabase/supabase-js";

interface UploadResult {
  imagePath: string;
  imageUrl: string;
  fileSizeBytes: number;
}

export async function uploadSelfie(
  supabase: SupabaseClient,
  eventSlug: string,
  file: File
): Promise<UploadResult> {
  const fileExt = "webp";
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${eventSlug}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("selfies")
    .upload(filePath, file, {
      contentType: "image/webp",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const { data: urlData } = supabase.storage
    .from("selfies")
    .getPublicUrl(filePath);

  return {
    imagePath: filePath,
    imageUrl: urlData.publicUrl,
    fileSizeBytes: file.size,
  };
}

export async function deleteSelfieImage(
  supabase: SupabaseClient,
  imagePath: string
): Promise<void> {
  const { error } = await supabase.storage
    .from("selfies")
    .remove([imagePath]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}
