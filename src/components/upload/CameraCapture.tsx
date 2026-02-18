"use client";

import { useCamera } from "@/hooks/useCamera";
import { useRef } from "react";
import { Button } from "@/components/ui/Button";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
}

export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const { videoRef, canvasRef, isStreaming, error, startCamera, stopCamera, capturePhoto } = useCamera();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = () => {
    const file = capturePhoto();
    if (file) {
      stopCamera();
      onCapture(file);
    }
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
        <p className="text-white/60 text-center text-sm">
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
        <Button onClick={startCamera} size="lg" className="w-full">
          Open Camera
        </Button>
        <Button onClick={() => fileInputRef.current?.click()} variant="secondary" size="lg" className="w-full">
          Choose from Gallery
        </Button>
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
          className="w-full h-full object-cover -scale-x-100"
        />
      </div>
      <canvas ref={canvasRef} className="hidden" />
      <div className="flex gap-3 w-full max-w-sm">
        <Button onClick={handleCapture} size="lg" className="flex-1">
          Take Selfie
        </Button>
        <Button onClick={stopCamera} variant="ghost" size="lg">
          Cancel
        </Button>
      </div>
    </div>
  );
}
