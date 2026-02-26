"use client";

import { useState } from "react";

interface DownloadButtonProps {
  imageUrl: string;
  fileName?: string;
  className?: string;
  children?: React.ReactNode;
}

export function DownloadButton({
  imageUrl,
  fileName = "selfie.jpg",
  className = "",
  children,
}: DownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: open in new tab
      window.open(imageUrl, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className={className}
    >
      {children || (downloading ? "Downloading..." : "Download")}
    </button>
  );
}
