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

interface PresetFormProps {
  preset?: Preset;
}

export function PresetForm({ preset }: PresetFormProps) {
  const router = useRouter();
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
      displayConfig,
      uploadConfig: {},
    };

    try {
      if (preset) {
        await updatePreset({ id: preset._id as Id<"presets">, ...payload });
      } else {
        await createPreset(payload);
      }
      router.push("/admin/presets");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
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

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" loading={loading}>
            {preset ? "Save Changes" : "Create Preset"}
          </Button>
        </div>
      </Card>
    </form>
  );
}
