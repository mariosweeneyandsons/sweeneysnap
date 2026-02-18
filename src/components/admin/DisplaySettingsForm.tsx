"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Event, DisplayConfig } from "@/types/database";

interface DisplaySettingsFormProps {
  event: Event;
  backHref: string;
}

export function DisplaySettingsForm({ event, backHref }: DisplaySettingsFormProps) {
  const router = useRouter();
  const config = event.display_config as DisplayConfig;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [gridColumns, setGridColumns] = useState(config.grid_columns ?? 3);
  const [swapInterval, setSwapInterval] = useState(config.swap_interval ?? 6);
  const [backgroundColor, setBackgroundColor] = useState(config.background_color || "#000000");
  const [showNames, setShowNames] = useState(config.show_names ?? true);
  const [showMessages, setShowMessages] = useState(config.show_messages ?? false);
  const [transition, setTransition] = useState<"fade" | "slide" | "zoom">(config.transition || "fade");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const displayConfig: DisplayConfig = {
      ...config,
      grid_columns: gridColumns,
      swap_interval: swapInterval,
      background_color: backgroundColor,
      show_names: showNames,
      show_messages: showMessages,
      transition,
    };

    const { error: updateError } = await supabase
      .from("events")
      .update({ display_config: displayConfig })
      .eq("id", event.id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push(backHref);
    router.refresh();
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
