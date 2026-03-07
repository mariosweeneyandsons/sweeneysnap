"use client";

import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Preset } from "@/types/database";
import { useToast } from "@/components/ui/Toast";
import { BrandAssetManager } from "./BrandAssetManager";
import { PresetPreview } from "./PresetPreview";
import { FontPicker } from "./FontPicker";
import { CustomFontUpload } from "./CustomFontUpload";
import {
  DisplaySettingsFields,
  DisplayConfigFormState,
  initDisplayConfigState,
  buildDisplayConfig,
} from "./DisplaySettingsFields";

interface PresetFormProps {
  preset?: Preset;
}

export function PresetForm({ preset }: PresetFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const createPreset = useMutation(api.presets.create);
  const updatePreset = useMutation(api.presets.update);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(preset?.name || "");
  const [primaryColor, setPrimaryColor] = useState(preset?.primaryColor || "#ffffff");
  const [fontFamily, setFontFamily] = useState(preset?.fontFamily || "Inter");
  const [customCss, setCustomCss] = useState(preset?.customCss || "");
  const [cssOpen, setCssOpen] = useState(false);
  const [fontUploadOpen, setFontUploadOpen] = useState(false);

  const [displayState, setDisplayState] = useState<DisplayConfigFormState>(
    () => initDisplayConfigState(preset?.displayConfig || {})
  );

  const handleDisplayChange = useCallback((field: string, value: unknown) => {
    setDisplayState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const assets = preset?.assets || [];
  const customFonts = assets.filter((a) => a.type === "font");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const displayConfig = buildDisplayConfig(displayState);

    // Cast needed: config may spread storage IDs as string, but mutation expects Id<"_storage">
    const payload = {
      name,
      primaryColor,
      fontFamily,
      customCss: customCss || undefined,
      displayConfig: displayConfig as typeof displayConfig & {
        backgroundImageId?: Id<"_storage">;
        backgroundVideoId?: Id<"_storage">;
      },
      uploadConfig: preset?.uploadConfig || {},
    };

    try {
      if (preset) {
        await updatePreset({ id: preset._id as Id<"presets">, ...payload });
        toast("Preset saved successfully", "success");
      } else {
        await createPreset(payload);
        toast("Preset created successfully", "success");
      }
      router.push("/admin/presets");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-6 items-start">
      <form onSubmit={handleSubmit} className="max-w-2xl flex-1">
        <Card className="flex flex-col gap-5">
          <Input label="Preset Name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Corporate Blue" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-1">Primary Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" />
                <span className="text-foreground-muted font-mono text-sm">{primaryColor}</span>
              </div>
            </div>
            <FontPicker
              value={fontFamily}
              onChange={setFontFamily}
              customFonts={customFonts}
              onUploadCustomFont={preset ? () => setFontUploadOpen(true) : undefined}
            />
          </div>

          <hr className="border-border" />
          <h3 className="font-semibold">Display Settings</h3>

          <DisplaySettingsFields config={displayState} onChange={handleDisplayChange} />

          {preset && (
            <>
              <hr className="border-border" />
              <BrandAssetManager
                target={{ type: "preset", id: preset._id }}
                assets={assets}
              />
            </>
          )}

          <hr className="border-border" />
          <div>
            <button
              type="button"
              onClick={() => setCssOpen(!cssOpen)}
              className="flex items-center gap-2 text-sm font-medium text-foreground-muted hover:text-foreground transition-colors"
            >
              <svg className={`w-4 h-4 transition-transform ${cssOpen ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
              Custom CSS
            </button>
            {cssOpen && (
              <textarea
                value={customCss}
                onChange={(e) => setCustomCss(e.target.value)}
                placeholder={`.selfie-frame { border-radius: 50%; }`}
                className="mt-2 w-full h-32 rounded-xs border border-border bg-input-bg px-3 py-2 text-foreground font-mono text-sm resize-y"
              />
            )}
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" loading={loading}>
              {preset ? "Save Changes" : "Create Preset"}
            </Button>
          </div>
        </Card>
      </form>
      <div className="w-80 shrink-0 sticky top-6">
        <Card>
          <PresetPreview
            primaryColor={primaryColor}
            fontFamily={fontFamily}
            backgroundColor={displayState.backgroundColor}
            gridColumns={displayState.gridColumns}
            showNames={displayState.showNames}
            layoutTemplateId={displayState.layoutTemplateId}
          />
        </Card>
      </div>

      {preset && (
        <CustomFontUpload
          target={{ type: "preset", id: preset._id }}
          open={fontUploadOpen}
          onClose={() => setFontUploadOpen(false)}
          onUploaded={(fontName) => setFontFamily(fontName)}
        />
      )}
    </div>
  );
}
