"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Event, BrandAsset } from "@/types/database";

interface AssetManagerProps {
  event: Event;
}

type AssetTab = "frame" | "sticker";

export function AssetManager({ event }: AssetManagerProps) {
  const [activeTab, setActiveTab] = useState<AssetTab>("frame");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateAssetUploadUrl = useMutation(api.events.generateAssetUploadUrl);
  const addAsset = useMutation(api.events.addAsset);
  const removeAsset = useMutation(api.events.removeAsset);

  const assets = event.assets ?? [];
  const filteredAssets = assets
    .map((a, i) => ({ ...a, originalIndex: i }))
    .filter((a) => a.type === activeTab);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ["image/png", "image/svg+xml", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Only PNG, SVG, and WebP files are allowed");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("File must be under 2MB");
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const uploadUrl = await generateAssetUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!result.ok) throw new Error("Upload failed");
      const { storageId } = await result.json();

      // Get the URL for the uploaded file
      // We'll construct the asset with the storageId and use Convex's getUrl
      // For now, we'll use the storageId directly in the mutation
      const assetUrl = `${process.env.NEXT_PUBLIC_CONVEX_URL?.replace(".cloud", ".site")}/getFile?storageId=${storageId}`;

      const asset: BrandAsset = {
        url: assetUrl,
        type: activeTab,
        name: file.name.replace(/\.[^/.]+$/, ""),
        storageId,
      };

      await addAsset({
        id: event._id as Id<"events">,
        asset: { ...asset, storageId: storageId as Id<"_storage"> },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = async (originalIndex: number) => {
    try {
      await removeAsset({
        id: event._id as Id<"events">,
        assetIndex: originalIndex,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-6">Frames & Stickers</h2>

      {/* Tab toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab("frame")}
          className={`px-4 py-2 rounded-xs text-sm font-medium transition-colors ${
            activeTab === "frame"
              ? "bg-foreground text-background"
              : "bg-secondary text-foreground-muted hover:bg-secondary-hover"
          }`}
        >
          Frames
        </button>
        <button
          onClick={() => setActiveTab("sticker")}
          className={`px-4 py-2 rounded-xs text-sm font-medium transition-colors ${
            activeTab === "sticker"
              ? "bg-foreground text-background"
              : "bg-secondary text-foreground-muted hover:bg-secondary-hover"
          }`}
        >
          Stickers
        </button>
      </div>

      {/* Upload zone */}
      <div className="mb-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/svg+xml,image/webp"
          onChange={handleUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-border rounded-xs py-8 px-4 text-center text-foreground-faint hover:border-border-strong hover:text-foreground-muted transition-colors disabled:opacity-50"
        >
          {uploading ? (
            "Uploading..."
          ) : (
            <>
              <span className="block text-2xl mb-1">+</span>
              Upload {activeTab === "frame" ? "Frame" : "Sticker"} (PNG, SVG, or WebP, max 2MB)
            </>
          )}
        </button>
      </div>

      {error && <p className="text-destructive text-sm mb-4">{error}</p>}

      {/* Asset grid */}
      {filteredAssets.length === 0 ? (
        <p className="text-foreground-faint text-sm text-center py-4">
          No {activeTab}s uploaded yet
        </p>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {filteredAssets.map((asset) => (
            <div
              key={`${asset.url}-${asset.originalIndex}`}
              className="relative aspect-square rounded-xs overflow-hidden bg-surface border border-border p-2 group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset.url}
                alt={asset.name}
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => handleRemove(asset.originalIndex)}
                className="absolute top-1 right-1 w-6 h-6 rounded-xs bg-destructive/80 text-foreground-emphasis flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
              >
                ×
              </button>
              <p className="absolute bottom-1 left-1 right-1 text-[10px] text-foreground-faint truncate">
                {asset.name}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
