"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { BrandAsset } from "@/types/database";
import { Button } from "@/components/ui/Button";

type AssetType = "logo" | "background" | "overlay" | "frame" | "sticker";

interface BrandAssetManagerProps {
  target: { type: "preset"; id: string } | { type: "event"; id: string };
  assets: BrandAsset[];
}

export function BrandAssetManager({ target, assets }: BrandAssetManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState<AssetType>("logo");
  const fileRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.brandAssets.generateUploadUrl);
  const addToPreset = useMutation(api.brandAssets.addToPreset);
  const addToEvent = useMutation(api.brandAssets.addToEvent);
  const removeFromPreset = useMutation(api.brandAssets.removeFromPreset);
  const removeFromEvent = useMutation(api.brandAssets.removeFromEvent);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await res.json();

      if (target.type === "preset") {
        await addToPreset({
          presetId: target.id as Id<"presets">,
          storageId,
          type: selectedType,
          name: file.name,
        });
      } else {
        await addToEvent({
          eventId: target.id as Id<"events">,
          storageId,
          type: selectedType,
          name: file.name,
        });
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleRemove = async (index: number) => {
    if (!confirm("Remove this asset?")) return;
    if (target.type === "preset") {
      await removeFromPreset({ presetId: target.id as Id<"presets">, assetIndex: index });
    } else {
      await removeFromEvent({ eventId: target.id as Id<"events">, assetIndex: index });
    }
  };

  const assetTypes: { value: AssetType; label: string }[] = [
    { value: "logo", label: "Logo" },
    { value: "background", label: "Background" },
    { value: "overlay", label: "Overlay" },
    { value: "frame", label: "Frame" },
    { value: "sticker", label: "Sticker" },
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Brand Assets</h3>

      <div className="flex items-end gap-3">
        <div>
          <label className="block text-sm font-medium text-foreground-muted mb-1">Asset Type</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as AssetType)}
            className="rounded-xs border border-border bg-input-bg px-3 py-2 text-foreground text-sm"
          >
            {assetTypes.map((t) => (
              <option key={t.value} value={t.value} className="bg-surface">{t.label}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => fileRef.current?.click()}
            loading={uploading}
          >
            Upload Asset
          </Button>
        </div>
      </div>

      {assets.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {assets.map((asset, i) => (
            <div key={i} className="relative group rounded-xs border border-border overflow-hidden bg-surface">
              <img
                src={asset.url}
                alt={asset.name}
                className="w-full aspect-square object-contain p-2"
              />
              <div className="absolute inset-0 bg-surface-overlay opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                <span className="text-xs text-foreground px-1 text-center truncate w-full">{asset.name}</span>
                <span className="text-[10px] uppercase tracking-wider text-foreground-faint">{asset.type}</span>
                <button
                  onClick={() => handleRemove(i)}
                  className="mt-1 text-xs text-destructive hover:text-destructive/80"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {assets.length === 0 && (
        <p className="text-sm text-foreground-faint">No assets uploaded yet.</p>
      )}
    </div>
  );
}
