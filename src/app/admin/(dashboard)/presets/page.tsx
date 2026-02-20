"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card } from "@/components/ui/Card";
import { DeletePresetButton } from "@/components/admin/DeletePresetButton";

export default function PresetsPage() {
  const presets = useQuery(api.presets.list);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Presets</h1>
        <Link
          href="/admin/presets/new"
          className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Preset
        </Link>
      </div>

      {!presets ? (
        <div className="text-center py-12 text-white/50">Loading...</div>
      ) : presets.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-white/50 mb-4">No presets yet</p>
          <Link href="/admin/presets/new" className="text-white underline hover:no-underline">
            Create your first preset
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {presets.map((preset) => (
            <Card key={preset._id} className="group relative">
              <Link href={`/admin/presets/${preset._id}`} className="block">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white/20"
                    style={{ backgroundColor: preset.primaryColor }}
                  />
                  <h3 className="font-semibold text-lg">{preset.name}</h3>
                </div>
                <p className="text-white/50 text-sm">
                  {preset.fontFamily} &middot; {preset.displayConfig.gridColumns || 3}x grid
                </p>
              </Link>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <DeletePresetButton presetId={preset._id} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
