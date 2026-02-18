"use client";

import { QRCodeSVG } from "qrcode.react";

interface QRCodeDisplayProps {
  url: string;
  size?: number;
}

export function QRCodeDisplay({ url, size = 200 }: QRCodeDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="bg-white p-4 rounded-xl">
        <QRCodeSVG value={url} size={size} />
      </div>
      <p className="text-white/50 text-sm font-mono break-all text-center max-w-xs">
        {url}
      </p>
    </div>
  );
}
