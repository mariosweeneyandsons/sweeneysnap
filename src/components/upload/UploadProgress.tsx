"use client";

import { Spinner } from "@/components/ui/Spinner";

interface UploadProgressProps {
  state: "compressing" | "uploading" | "saving";
  progress: string;
}

const stateLabels = {
  compressing: "Compressing your photo...",
  uploading: "Uploading...",
  saving: "Almost done...",
};

export function UploadProgress({ state, progress }: UploadProgressProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <Spinner size="lg" className="text-white" />
      <p className="text-white text-lg font-medium">{stateLabels[state]}</p>
      <p className="text-white/50 text-sm">{progress}</p>
    </div>
  );
}
