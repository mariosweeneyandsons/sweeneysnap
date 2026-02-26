"use client";

import { useState, useRef } from "react";
import { CameraCapture } from "./CameraCapture";
import { PhotoEditor } from "./PhotoEditor";
import { UploadProgress } from "./UploadProgress";
import { UploadSuccess } from "./UploadSuccess";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useOfflineQueue } from "@/hooks/useOfflineQueue";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Event, BrandAsset } from "@/types/database";

type Screen = "camera" | "editor" | "details" | "uploading" | "success";

interface UploadFormProps {
  event: Event;
}

export function UploadForm({ event }: UploadFormProps) {
  const config = event.uploadConfig;
  const { enqueueUpload } = useOfflineQueue();
  const { state, progress, error, uploadCount, limitReached, selfieId, upload, reset } =
    useImageUpload({
      maxFileSizeMb: config.maxFileSizeMb,
      onOfflineQueue: enqueueUpload,
    });

  const [screen, setScreen] = useState<Screen>("camera");
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [editedFile, setEditedFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const isSubmittingRef = useRef(false);

  const maxUploads = config.maxUploadsPerSession ?? 10;
  const multiPhotoEnabled = config.multiPhotoEnabled !== false;
  const filtersEnabled = config.filtersEnabled !== false;
  const framesEnabled = config.framesEnabled !== false;
  const stickersEnabled = config.stickersEnabled !== false;

  // Check if editor should be shown
  const frames: BrandAsset[] = (event.assets ?? []).filter((a) => a.type === "frame");
  const stickers: BrandAsset[] = (event.assets ?? []).filter((a) => a.type === "sticker");
  const hasEditorFeatures = filtersEnabled || (framesEnabled && frames.length > 0) || framesEnabled || (stickersEnabled && stickers.length > 0);

  const handleCapture = (file: File) => {
    setCapturedFile(file);
    setPreview(URL.createObjectURL(file));
    if (hasEditorFeatures) {
      setScreen("editor");
    } else {
      setEditedFile(file);
      setScreen("details");
    }
  };

  const handleEditorConfirm = (file: File) => {
    setEditedFile(file);
    setScreen("details");
  };

  const handleRetake = () => {
    if (preview) URL.revokeObjectURL(preview);
    setCapturedFile(null);
    setEditedFile(null);
    setPreview(null);
    setScreen("camera");
  };

  const handleSubmit = async () => {
    const fileToUpload = editedFile || capturedFile;
    if (!fileToUpload || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setScreen("uploading");
    try {
      await upload(fileToUpload, event._id, displayName, message, event.moderationEnabled, email, phone);
      setScreen("success");
    } catch {
      setScreen("details");
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const handleUploadAnother = () => {
    if (preview) URL.revokeObjectURL(preview);
    setCapturedFile(null);
    setEditedFile(null);
    setPreview(null);
    setDisplayName("");
    setMessage("");
    setEmail("");
    setPhone("");
    reset();
    setScreen("camera");
  };

  if (state === "queued") {
    return (
      <div className="flex flex-col items-center gap-6 py-12 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-warning-bg">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#eab308">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0" />
          </svg>
        </div>
        <p className="text-xl font-semibold">Saved offline!</p>
        <p style={{ opacity: 0.6 }}>Your photo will upload automatically when you&apos;re back online.</p>
        <Button onClick={handleUploadAnother} variant="secondary" size="lg">
          Take Another
        </Button>
      </div>
    );
  }

  if (screen === "success" || state === "done") {
    const editedPreviewUrl = editedFile ? URL.createObjectURL(editedFile) : preview;
    return (
      <UploadSuccess
        successText={config.successText}
        moderationEnabled={event.moderationEnabled}
        onUploadAnother={handleUploadAnother}
        uploadCount={uploadCount}
        maxUploads={maxUploads}
        multiPhotoEnabled={multiPhotoEnabled}
        limitReached={limitReached}
        primaryColor={event.primaryColor}
        selfieId={selfieId ?? undefined}
        imageUrl={editedPreviewUrl ?? undefined}
        shareEnabled={config.shareEnabled}
        shareText={config.shareText}
        shareHashtag={config.shareHashtag}
        eventName={event.name}
      />
    );
  }

  if (screen === "uploading" || state === "compressing" || state === "uploading" || state === "saving") {
    return <UploadProgress state={state === "idle" ? "compressing" : state as "compressing" | "uploading" | "saving"} progress={progress} />;
  }

  if (screen === "camera") {
    return (
      <CameraCapture
        onCapture={handleCapture}
        allowGallery={config.allowGallery !== false}
        countdownSeconds={config.countdownSeconds ?? 0}
        flashEnabled={config.flashEnabled !== false}
        allowCameraSwitch={config.allowCameraSwitch !== false}
        primaryColor={event.primaryColor}
      />
    );
  }

  if (screen === "editor" && capturedFile && preview) {
    return (
      <PhotoEditor
        imageFile={capturedFile}
        previewUrl={preview}
        frames={frames}
        stickers={stickers}
        filtersEnabled={filtersEnabled}
        framesEnabled={framesEnabled}
        stickersEnabled={stickersEnabled}
        onConfirm={handleEditorConfirm}
        onRetake={handleRetake}
        primaryColor={event.primaryColor}
      />
    );
  }

  // Details screen
  const editedPreview = editedFile ? URL.createObjectURL(editedFile) : preview;

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
      {editedPreview && (
        <div className="w-full aspect-square rounded-xs overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={editedPreview} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}

      {config.requireName !== false && (
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

      {config.collectEmail && (
        <Input
          label="Email (optional)"
          placeholder="your@email.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      )}

      {config.collectPhone && (
        <Input
          label="Phone (optional)"
          placeholder="+1 555-123-4567"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      )}

      {(config.collectEmail || config.collectPhone) && (
        <p className="text-xs text-center" style={{ opacity: 0.4 }}>
          We&apos;ll send your selfie to you after it&apos;s approved. Your info won&apos;t be shared.
        </p>
      )}

      {error && (
        <p className="text-destructive text-sm text-center">{error}</p>
      )}

      <div className="flex gap-3 w-full">
        <Button
          onClick={handleSubmit}
          size="lg"
          className="flex-1"
          disabled={state !== "idle"}
          style={event.primaryColor ? { backgroundColor: `var(--ss-primary, ${event.primaryColor})`, color: `var(--ss-primary-contrast, #fff)` } : undefined}
        >
          {config.buttonText || "Upload Selfie"}
        </Button>
        <Button onClick={handleRetake} variant="ghost" size="lg">
          Retake
        </Button>
      </div>
    </div>
  );
}
