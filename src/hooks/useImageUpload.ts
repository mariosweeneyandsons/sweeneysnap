"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/compression";
import { uploadSelfie } from "@/lib/storage";

type UploadState = "idle" | "compressing" | "uploading" | "saving" | "done" | "error";

interface UseImageUploadReturn {
  state: UploadState;
  progress: string;
  error: string | null;
  upload: (file: File, eventSlug: string, eventId: string, displayName?: string, message?: string, moderationEnabled?: boolean) => Promise<void>;
  reset: () => void;
}

export function useImageUpload(): UseImageUploadReturn {
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);

  const upload = async (
    file: File,
    eventSlug: string,
    eventId: string,
    displayName?: string,
    message?: string,
    moderationEnabled?: boolean
  ) => {
    try {
      setError(null);

      // Compress
      setState("compressing");
      setProgress("Compressing image...");
      const compressed = await compressImage(file);

      // Upload to storage
      setState("uploading");
      setProgress("Uploading...");
      const supabase = createClient();
      const { imagePath, imageUrl, fileSizeBytes } = await uploadSelfie(
        supabase,
        eventSlug,
        compressed
      );

      // Save to database
      setState("saving");
      setProgress("Saving...");

      const sessionId =
        typeof window !== "undefined"
          ? (sessionStorage.getItem("selfie_session_id") ??
            (() => {
              const id = crypto.randomUUID();
              sessionStorage.setItem("selfie_session_id", id);
              return id;
            })())
          : undefined;

      const { error: dbError } = await supabase.from("selfies").insert({
        event_id: eventId,
        image_path: imagePath,
        image_url: imageUrl,
        display_name: displayName || null,
        message: message || null,
        status: moderationEnabled ? "pending" : "approved",
        file_size_bytes: fileSizeBytes,
        session_id: sessionId,
      });

      if (dbError) throw new Error(dbError.message);

      setState("done");
      setProgress("Done!");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const reset = () => {
    setState("idle");
    setProgress("");
    setError(null);
  };

  return { state, progress, error, upload, reset };
}
