"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface CustomFontUploadProps {
  target: { type: "preset"; id: string } | { type: "event"; id: string };
  open: boolean;
  onClose: () => void;
  onUploaded?: (fontName: string) => void;
}

export function CustomFontUpload({ target, open, onClose, onUploaded }: CustomFontUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fontName, setFontName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.brandAssets.generateUploadUrl);
  const addToPreset = useMutation(api.brandAssets.addToPreset);
  const addToEvent = useMutation(api.brandAssets.addToEvent);

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    if (!fontName) {
      setFontName(f.name.replace(/\.(ttf|woff2?|otf)$/i, ""));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !fontName.trim()) return;

    setUploading(true);
    setError(null);
    try {
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      const { storageId } = await res.json();

      if (target.type === "preset") {
        await addToPreset({
          presetId: target.id as Id<"presets">,
          storageId,
          type: "font",
          name: fontName.trim(),
        });
      } else {
        await addToEvent({
          eventId: target.id as Id<"events">,
          storageId,
          type: "font",
          name: fontName.trim(),
        });
      }

      onUploaded?.(fontName.trim());
      setFile(null);
      setFontName("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-surface border border-border rounded-xs p-6 w-full max-w-md shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4">Upload Custom Font</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              ref={fileRef}
              type="file"
              accept=".ttf,.woff2,.otf"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileRef.current?.click()}
            >
              {file ? file.name : "Choose Font File (.ttf, .woff2, .otf)"}
            </Button>
          </div>

          <Input
            label="Font Display Name"
            value={fontName}
            onChange={(e) => setFontName(e.target.value)}
            placeholder="e.g. My Custom Font"
            required
          />

          {error && <p className="text-destructive text-sm">{error}</p>}

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={uploading} disabled={!file || !fontName.trim()}>
              Upload Font
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
