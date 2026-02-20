"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Event } from "@/types/database";

interface DisplaySettingsFormProps {
  event: Event;
  backHref: string;
}

export function DisplaySettingsForm({ event, backHref }: DisplaySettingsFormProps) {
  const router = useRouter();
  const config = event.displayConfig;
  const updateDisplayConfig = useMutation(api.events.updateDisplayConfig);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [gridColumns, setGridColumns] = useState(config.gridColumns ?? 3);
  const [swapInterval, setSwapInterval] = useState(config.swapInterval ?? 6);
  const [backgroundColor, setBackgroundColor] = useState(config.backgroundColor || "#000000");
  const [showNames, setShowNames] = useState(config.showNames ?? true);
  const [showMessages, setShowMessages] = useState(config.showMessages ?? false);
  const [transition, setTransition] = useState<"fade" | "slide" | "zoom">(config.transition || "fade");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const displayConfig = {
      ...config,
      gridColumns,
      swapInterval,
      backgroundColor,
      showNames,
      showMessages,
      transition,
    };

    try {
      await updateDisplayConfig({
        id: event._id as Id<"events">,
        displayConfig,
      });
      router.push(backHref);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <Card className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Grid Size</label>
            <select
              value={gridColumns}
              onChange={(e) => setGridColumns(Number(e.target.value))}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white"
            >
              {[2, 3, 4, 5].map((n) => (
                <option key={n} value={n} className="bg-gray-900">{n}x{n} ({n * n} frames)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Swap Interval (sec)</label>
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
          <label className="block text-sm font-medium text-white/70 mb-1">Transition</label>
          <select
            value={transition}
            onChange={(e) => setTransition(e.target.value as "fade" | "slide" | "zoom")}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white"
          >
            <option value="fade" className="bg-gray-900">Fade</option>
            <option value="slide" className="bg-gray-900">Slide</option>
            <option value="zoom" className="bg-gray-900">Zoom</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Background Color</label>
          <div className="flex items-center gap-2">
            <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" />
            <span className="text-white/50 font-mono text-sm">{backgroundColor}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showNames} onChange={(e) => setShowNames(e.target.checked)} className="rounded" />
            <span className="text-sm text-white/70">Show names on display</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showMessages} onChange={(e) => setShowMessages(e.target.checked)} className="rounded" />
            <span className="text-sm text-white/70">Show messages on display</span>
          </label>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={() => router.push(backHref)}>Cancel</Button>
          <Button type="submit" loading={loading}>Save Display Settings</Button>
        </div>
      </Card>
    </form>
  );
}
