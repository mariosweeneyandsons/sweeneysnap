"use client";

import { useState } from "react";
import { CameraCapture } from "./CameraCapture";
import { UploadProgress } from "./UploadProgress";
import { UploadSuccess } from "./UploadSuccess";
import { useImageUpload } from "@/hooks/useImageUpload";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Event } from "@/types/database";

interface UploadFormProps {
  event: Event;
}

export function UploadForm({ event }: UploadFormProps) {
  const config = event.uploadConfig;
  const { state, progress, error, upload, reset } = useImageUpload();
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  const handleCapture = (file: File) => {
    setCapturedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!capturedFile) return;
    await upload(capturedFile, event._id, displayName, message, event.moderationEnabled);
  };

  const handleRetake = () => {
    if (preview) URL.revokeObjectURL(preview);
    setCapturedFile(null);
    setPreview(null);
  };

  const handleUploadAnother = () => {
    if (preview) URL.revokeObjectURL(preview);
    setCapturedFile(null);
    setPreview(null);
    setDisplayName("");
    setMessage("");
    reset();
  };

  if (state === "done") {
    return (
      <UploadSuccess
        successText={config.successText}
        moderationEnabled={event.moderationEnabled}
        onUploadAnother={handleUploadAnother}
      />
    );
  }

  if (state === "compressing" || state === "uploading" || state === "saving") {
    return <UploadProgress state={state} progress={progress} />;
  }

  if (!capturedFile) {
    return <CameraCapture onCapture={handleCapture} />;
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
      {preview && (
        <div className="w-full aspect-square rounded-2xl overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}

      {(config.requireName !== false) && (
        <Input
          label="Your Name"
          placeholder="Enter your name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      )}

      {config.requireMessage && (
        <Input
          label="Message"
          placeholder="Say something!"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      )}

      {error && (
        <p className="text-red-400 text-sm text-center">{error}</p>
      )}

      <div className="flex gap-3 w-full">
        <Button onClick={handleSubmit} size="lg" className="flex-1">
          {config.buttonText || "Upload Selfie"}
        </Button>
        <Button onClick={handleRetake} variant="ghost" size="lg">
          Retake
        </Button>
      </div>
    </div>
  );
}
