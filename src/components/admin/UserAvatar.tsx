"use client";

import { useState } from "react";

interface UserAvatarProps {
  name: string | null;
  image: string | null;
  size?: number;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
}

function getGradient(name: string | null): string {
  const hash = hashString(name ?? "user");
  const hue1 = hash % 360;
  const hue2 = (hue1 + 40 + (hash % 60)) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 70%, 50%), hsl(${hue2}, 80%, 40%))`;
}

export function UserAvatar({ name, image, size = 36 }: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);

  const showImage = image && !imgError;

  return (
    <div
      className="rounded-full overflow-hidden shrink-0 flex items-center justify-center font-semibold text-foreground-emphasis select-none"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: showImage ? undefined : getGradient(name),
      }}
    >
      {showImage ? (
        <img
          src={image}
          alt={name ?? "User avatar"}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        getInitials(name)
      )}
    </div>
  );
}
