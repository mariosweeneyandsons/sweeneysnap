"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { PresetForm } from "@/components/admin/PresetForm";

export default function EditPresetPage() {
  const { presetId } = useParams<{ presetId: string }>();
  const preset = useQuery(api.presets.getById, { id: presetId as Id<"presets"> });

  if (preset === undefined) {
    return <div className="text-center py-12 text-white/50">Loading...</div>;
  }
  if (!preset) {
    return <div className="text-center py-12 text-white/50">Preset not found</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Edit Preset</h1>
      <PresetForm preset={preset} />
    </div>
  );
}
