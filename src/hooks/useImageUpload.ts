"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { compressImage } from "@/lib/compression";
import { Id } from "../../convex/_generated/dataModel";

type UploadState = "idle" | "compressing" | "uploading" | "saving" | "done" | "error";

interface UseImageUploadReturn {
  state: UploadState;
  progress: string;
  error: string | null;
  upload: (file: File, eventId: string, displayName?: string, message?: string, moderationEnabled?: boolean) => Promise<void>;
  reset: () => void;
}

export function useImageUpload(): UseImageUploadReturn {
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);

  const generateUploadUrl = useMutation(api.selfies.generateUploadUrl);
  const createSelfie = useMutation(api.selfies.create);

  const upload = async (
    file: File,
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

      // Upload to Convex storage
      setState("uploading");
      setProgress("Uploading...");
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": compressed.type },
        body: compressed,
      });
      if (!result.ok) throw new Error("Upload failed");
      const { storageId } = await result.json();

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

      await createSelfie({
        eventId: eventId as Id<"events">,
        storageId,
        displayName: displayName || undefined,
        message: message || undefined,
        status: moderationEnabled ? "pending" : "approved",
        fileSizeBytes: compressed.size,
        sessionId,
      });

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
