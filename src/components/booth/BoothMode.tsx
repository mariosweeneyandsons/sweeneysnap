"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useCamera } from "@/hooks/useCamera";
import { useImageUpload } from "@/hooks/useImageUpload";
import { CaptureCountdown } from "./CaptureCountdown";
import { AutoResetTimer } from "./AutoResetTimer";
import { PublicEvent } from "@/types/database";

type BoothScreen = "idle" | "camera" | "countdown" | "preview" | "uploading" | "success";

interface BoothModeProps {
  event: PublicEvent;
}

export function BoothMode({ event }: BoothModeProps) {
  const config = event.uploadConfig;
  const autoResetSeconds = config.boothAutoResetSeconds ?? 10;
  const useCountdown = config.boothCaptureCountdown !== false;
  const idleMessage = config.boothIdleMessage || "Tap to start!";

  const [screen, setScreen] = useState<BoothScreen>("idle");
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { videoRef, canvasRef, startCamera, stopCamera, capturePhoto: captureFromCamera } = useCamera();
  const { state, upload, reset: resetUpload } = useImageUpload({
    maxFileSizeMb: config.maxFileSizeMb,
  });

  // Keep refs for unmount cleanup (avoids stale closure over state)
  const previewUrlRef = useRef<string | null>(null);
  previewUrlRef.current = previewUrl;

  // Cleanup camera stream and object URLs on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, [stopCamera]);

  const handleStart = useCallback(async () => {
    setScreen("camera");
    await startCamera();
  }, [startCamera]);

  const doCapture = useCallback(() => {
    const file = captureFromCamera();
    if (!file) return;
    setCapturedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    stopCamera();
    setScreen("preview");
  }, [captureFromCamera, stopCamera]);

  const handleCapture = useCallback(() => {
    if (useCountdown) {
      setScreen("countdown");
    } else {
      doCapture();
    }
  }, [useCountdown, doCapture]);

  const handleCountdownComplete = useCallback(() => {
    doCapture();
  }, [doCapture]);

  const handleUpload = useCallback(async () => {
    if (!capturedFile) return;
    setScreen("uploading");
    try {
      await upload(capturedFile, event._id, undefined, undefined, event.moderationEnabled);
      setScreen("success");
    } catch {
      setScreen("preview");
    }
  }, [capturedFile, event._id, event.moderationEnabled, upload]);

  const handleRetake = useCallback(async () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setCapturedFile(null);
    setPreviewUrl(null);
    setScreen("camera");
    await startCamera();
  }, [previewUrl, startCamera]);

  const handleReset = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setCapturedFile(null);
    setPreviewUrl(null);
    stopCamera();
    resetUpload();
    setScreen("idle");
  }, [previewUrl, stopCamera, resetUpload]);

  // IDLE
  if (screen === "idle") {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-black">
        <button
          onClick={handleStart}
          className="flex flex-col items-center gap-8 p-12"
        >
          {event.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.logoUrl} alt="" className="h-24 w-auto" />
          )}
          <p className="text-white text-4xl font-bold">{idleMessage}</p>
          <div className="w-32 h-32 rounded-full border-4 border-white/30 flex items-center justify-center">
            <svg className="w-16 h-16 text-white/50" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
          </div>
        </button>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  // CAMERA
  if (screen === "camera") {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-black relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full max-w-2xl aspect-square object-cover rounded-3xl"
          style={{ transform: "scaleX(-1)" }}
        />
        <canvas ref={canvasRef} className="hidden" />
        <button
          onClick={handleCapture}
          className="mt-8 w-24 h-24 rounded-full bg-white border-4 border-white/50 hover:scale-105 transition-transform active:scale-95"
        />
      </div>
    );
  }

  // COUNTDOWN
  if (screen === "countdown") {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-black relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full max-w-2xl aspect-square object-cover rounded-3xl"
          style={{ transform: "scaleX(-1)" }}
        />
        <canvas ref={canvasRef} className="hidden" />
        <CaptureCountdown onComplete={handleCountdownComplete} />
      </div>
    );
  }

  // PREVIEW
  if (screen === "preview" && previewUrl) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-black px-8">
        <canvas ref={canvasRef} className="hidden" />
        <div className="w-full max-w-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full aspect-square object-cover rounded-3xl mb-8"
          />
          <div className="flex gap-4">
            <button
              onClick={handleUpload}
              className="flex-1 min-h-[80px] rounded-2xl bg-white text-black text-2xl font-bold hover:bg-white/90 transition"
            >
              Use This Photo
            </button>
            <button
              onClick={handleRetake}
              className="min-h-[80px] px-8 rounded-2xl border-2 border-white/30 text-white text-2xl font-bold hover:border-white/50 transition"
            >
              Retake
            </button>
          </div>
        </div>
      </div>
    );
  }

  // UPLOADING
  if (screen === "uploading" || state === "compressing" || state === "uploading" || state === "saving") {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-black">
        <canvas ref={canvasRef} className="hidden" />
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-white text-2xl">Uploading...</p>
        </div>
      </div>
    );
  }

  // SUCCESS
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-black px-8">
      <canvas ref={canvasRef} className="hidden" />
      <div className="flex flex-col items-center gap-8">
        <div className="w-24 h-24 rounded-full bg-success-bg flex items-center justify-center">
          <svg className="w-12 h-12 text-success" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <p className="text-white text-3xl font-bold text-center">
          {event.uploadConfig.successText || "Your selfie is on the wall!"}
        </p>
        <AutoResetTimer seconds={autoResetSeconds} onReset={handleReset} />
        <p className="text-white/40 text-lg">Tap timer to skip</p>
      </div>
    </div>
  );
}
