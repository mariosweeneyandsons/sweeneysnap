"use client";

import { Button } from "@/components/ui/Button";

interface UploadSuccessProps {
  successText?: string;
  moderationEnabled?: boolean;
  onUploadAnother: () => void;
}

export function UploadSuccess({ successText, moderationEnabled, onUploadAnother }: UploadSuccessProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
        <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
      <p className="text-white text-xl font-semibold">
        {successText || "Your selfie is on the wall!"}
      </p>
      <p className="text-white/50">
        {moderationEnabled
          ? "Your selfie will appear once it's been approved."
          : "Look for it on the big screen."}
      </p>
      <Button onClick={onUploadAnother} variant="secondary" size="lg">
        Take Another
      </Button>
    </div>
  );
}
