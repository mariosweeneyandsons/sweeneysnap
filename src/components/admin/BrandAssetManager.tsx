"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { BrandAsset } from "@/types/database";
import { Button } from "@/components/ui/Button";

type AssetType = BrandAsset["type"];

interface BrandAssetManagerProps {
  target: { type: "preset"; id: string } | { type: "event"; id: string };
  assets: BrandAsset[];
  filterTypes?: AssetType[];
}

interface AssetSection {
  type: AssetType;
  label: string;
  description: string;
  accept: string;
  singular: boolean;
}

const SECTIONS: AssetSection[] = [
  { type: "logo", label: "Logo", description: "Shown in the display overlay", accept: "image/*", singular: true },
  { type: "background", label: "Background", description: "Full-screen display background image", accept: "image/*", singular: true },
  { type: "overlay", label: "Overlay", description: "Rendered on top of the display", accept: "image/*", singular: false },
  { type: "frame", label: "Frame", description: "Decorative frame around each selfie", accept: "image/*", singular: false },
  { type: "sticker", label: "Sticker", description: "Fun stickers guests can add to selfies", accept: "image/*", singular: false },
  { type: "font", label: "Custom Font", description: "Upload .ttf, .woff2, or .otf files", accept: ".ttf,.woff2,.otf,font/*", singular: false },
];

export function BrandAssetManager({ target, assets, filterTypes }: BrandAssetManagerProps) {
  const sections = filterTypes
    ? SECTIONS.filter((s) => filterTypes.includes(s.type))
    : SECTIONS;

  return (
    <div className="space-y-6">
      <h3 className="font-semibold">Brand Assets</h3>
      {sections.map((section) => (
        <AssetSectionPanel
          key={section.type}
          section={section}
          target={target}
          assets={assets.filter((a) => a.type === section.type)}
          allAssets={assets}
        />
      ))}
    </div>
  );
}

function AssetSectionPanel({
  section,
  target,
  assets,
  allAssets,
}: {
  section: AssetSection;
  target: BrandAssetManagerProps["target"];
  assets: BrandAsset[];
  allAssets: BrandAsset[];
}) {
  const [uploading, setUploading] = useState(false);
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

      // For singular types, remove existing asset first
      if (section.singular && assets.length > 0) {
        const existingIndex = allAssets.findIndex((a) => a.type === section.type);
        if (existingIndex !== -1) {
          if (target.type === "preset") {
            await removeFromPreset({ presetId: target.id as Id<"presets">, assetIndex: existingIndex });
          } else {
            await removeFromEvent({ eventId: target.id as Id<"events">, assetIndex: existingIndex });
          }
        }
      }

      if (target.type === "preset") {
        await addToPreset({
          presetId: target.id as Id<"presets">,
          storageId,
          type: section.type,
          name: file.name,
        });
      } else {
        await addToEvent({
          eventId: target.id as Id<"events">,
          storageId,
          type: section.type,
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

  const handleRemove = async (asset: BrandAsset) => {
    if (!confirm("Remove this asset?")) return;
    const index = allAssets.indexOf(asset);
    if (index === -1) return;
    if (target.type === "preset") {
      await removeFromPreset({ presetId: target.id as Id<"presets">, assetIndex: index });
    } else {
      await removeFromEvent({ eventId: target.id as Id<"events">, assetIndex: index });
    }
  };

  const isFont = section.type === "font";

  return (
    <div className="border border-border rounded-xs p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-sm font-semibold text-foreground">{section.label}</h4>
          <p className="text-xs text-foreground-faint">{section.description}</p>
        </div>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept={section.accept}
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
            {section.singular && assets.length > 0 ? "Replace" : "Upload"}
          </Button>
        </div>
      </div>

      {assets.length > 0 ? (
        <div className={isFont ? "flex flex-col gap-2" : "grid grid-cols-3 sm:grid-cols-4 gap-3"}>
          {assets.map((asset, i) => (
            <div
              key={i}
              className={
                isFont
                  ? "flex items-center justify-between gap-3 rounded-xs border border-border p-2 bg-surface"
                  : "relative group rounded-xs border border-border overflow-hidden bg-surface"
              }
            >
              {isFont ? (
                <>
                  <div className="flex items-center gap-2 min-w-0">
                    <svg className="w-4 h-4 shrink-0 text-foreground-faint" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" />
                    </svg>
                    <span className="text-sm text-foreground truncate">{asset.name}</span>
                  </div>
                  <button
                    onClick={() => handleRemove(asset)}
                    className="text-xs text-destructive hover:text-destructive/80 shrink-0"
                  >
                    Remove
                  </button>
                </>
              ) : (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="w-full aspect-square object-contain p-2"
                  />
                  <div className="absolute inset-0 bg-surface-overlay opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                    <span className="text-xs text-foreground px-1 text-center truncate w-full">{asset.name}</span>
                    <button
                      onClick={() => handleRemove(asset)}
                      className="mt-1 text-xs text-destructive hover:text-destructive/80"
                    >
                      Remove
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-foreground-faint">
          {section.singular ? `No ${section.label.toLowerCase()} uploaded.` : `No ${section.label.toLowerCase()}s uploaded yet.`}
        </p>
      )}
    </div>
  );
}
