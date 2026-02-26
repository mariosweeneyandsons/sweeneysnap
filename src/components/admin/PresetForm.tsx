"use client";

import { useState } from "react";
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
  const [logoUrl, setLogoUrl] = useState(preset?.logoUrl || "");
  const [gridColumns, setGridColumns] = useState(preset?.displayConfig.gridColumns ?? 3);
  const [swapInterval, setSwapInterval] = useState(preset?.displayConfig.swapInterval ?? 6);
  const [backgroundColor, setBackgroundColor] = useState(
    preset?.displayConfig.backgroundColor || "#000000"
  );
  const [showNames, setShowNames] = useState(preset?.displayConfig.showNames ?? true);
  const [customCss, setCustomCss] = useState(preset?.customCss || "");
  const [cssOpen, setCssOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const displayConfig = {
      gridColumns,
      swapInterval,
      backgroundColor,
      showNames,
      transition: "fade" as const,
    };

    const payload = {
      name,
      primaryColor,
      fontFamily,
      logoUrl: logoUrl || undefined,
      customCss: customCss || undefined,
      displayConfig,
      uploadConfig: {},
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
        <Input label="Logo URL" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Primary Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" />
              <span className="text-white/50 font-mono text-sm">{primaryColor}</span>
            </div>
          </div>
          <Input label="Font Family" value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} />
        </div>

        <hr className="border-white/10" />
        <h3 className="font-semibold">Display Settings</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Grid Columns</label>
            <select
              value={gridColumns}
              onChange={(e) => setGridColumns(Number(e.target.value))}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white"
            >
              {[2, 3, 4, 5].map((n) => (
                <option key={n} value={n} className="bg-gray-900">{n}x{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Swap Interval (seconds)</label>
            <input
              type="number"
              min={2}
              max={30}
              value={swapInterval}
              onChange={(e) => setSwapInterval(Number(e.target.value))}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Background Color</label>
          <div className="flex items-center gap-2">
            <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" />
            <span className="text-white/50 font-mono text-sm">{backgroundColor}</span>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={showNames} onChange={(e) => setShowNames(e.target.checked)} className="rounded" />
          <span className="text-sm text-white/70">Show names on display</span>
        </label>

        {preset && (
          <>
            <hr className="border-white/10" />
            <BrandAssetManager
              target={{ type: "preset", id: preset._id }}
              assets={preset.assets}
            />
          </>
        )}

        <hr className="border-white/10" />
        <div>
          <button
            type="button"
            onClick={() => setCssOpen(!cssOpen)}
            className="flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
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
              className="mt-2 w-full h-32 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white font-mono text-sm resize-y"
            />
          )}
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

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
          backgroundColor={backgroundColor}
          gridColumns={gridColumns}
          showNames={showNames}
          logoUrl={logoUrl || undefined}
        />
      </Card>
    </div>
    </div>
  );
}
