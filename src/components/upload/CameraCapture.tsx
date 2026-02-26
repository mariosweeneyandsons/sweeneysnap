"use client";

import { useCamera } from "@/hooks/useCamera";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CountdownOverlay } from "./CountdownOverlay";
import { FlashOverlay } from "./FlashOverlay";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  allowGallery?: boolean;
  countdownSeconds?: number;
  flashEnabled?: boolean;
  allowCameraSwitch?: boolean;
  primaryColor?: string;
}

export function CameraCapture({
  onCapture,
  allowGallery = true,
  countdownSeconds = 0,
  flashEnabled = true,
  allowCameraSwitch = true,
  primaryColor,
}: CameraCaptureProps) {
  const { videoRef, canvasRef, isStreaming, error, startCamera, stopCamera, capturePhoto, facingMode, switchCamera } = useCamera();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCountdown, setShowCountdown] = useState(false);
  const [showFlash, setShowFlash] = useState(false);

  const doCapture = () => {
    const file = capturePhoto();
    if (file) {
      if (flashEnabled) {
        setShowFlash(true);
      }
      stopCamera();
      onCapture(file);
    }
  };

  const handleCapture = () => {
    if (countdownSeconds > 0) {
      setShowCountdown(true);
    } else {
      doCapture();
    }
  };

  const handleCountdownComplete = () => {
    setShowCountdown(false);
    doCapture();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCapture(file);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 p-6">
        <p className="text-inherit/60 text-center text-sm" style={{ opacity: 0.6 }}>
          Camera not available. You can still upload a photo from your gallery.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button onClick={() => fileInputRef.current?.click()} size="lg">
          Choose Photo
        </Button>
      </div>
    );
  }

  if (!isStreaming) {
    return (
      <div className="flex flex-col items-center gap-4 p-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          onClick={startCamera}
          size="lg"
          className="w-full"
          style={primaryColor ? { backgroundColor: primaryColor, color: "#fff" } : undefined}
        >
          Open Camera
        </Button>
        {allowGallery && (
          <Button onClick={() => fileInputRef.current?.click()} variant="secondary" size="lg" className="w-full">
            Choose from Gallery
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full aspect-square max-w-sm overflow-hidden rounded-2xl">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${facingMode === "user" ? "-scale-x-100" : ""}`}
        />
        {showCountdown && (
          <CountdownOverlay
            seconds={countdownSeconds}
            onComplete={handleCountdownComplete}
            primaryColor={primaryColor}
          />
        )}
        {showFlash && (
          <FlashOverlay active={showFlash} onComplete={() => setShowFlash(false)} />
        )}
        {allowCameraSwitch && (
          <button
            onClick={switchCamera}
            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
            aria-label="Switch camera"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182M21.015 4.356v4.992" />
            </svg>
          </button>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
      <div className="flex gap-3 w-full max-w-sm">
        <Button
          onClick={handleCapture}
          size="lg"
          className="flex-1"
          style={primaryColor ? { backgroundColor: primaryColor, color: "#fff" } : undefined}
          disabled={showCountdown}
        >
          Take Selfie
        </Button>
        <Button onClick={stopCamera} variant="ghost" size="lg">
          Cancel
        </Button>
      </div>
    </div>
  );
}
