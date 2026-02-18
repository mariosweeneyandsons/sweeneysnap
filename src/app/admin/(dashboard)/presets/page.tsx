import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { DeletePresetButton } from "@/components/admin/DeletePresetButton";
import { DisplayConfig } from "@/types/database";

export default async function PresetsPage() {
  const supabase = await createClient();
  const { data: presets } = await supabase
    .from("presets")
    .select("*")
    .order("created_at", { ascending: false });

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

      {(!presets || presets.length === 0) ? (
        <Card className="text-center py-12">
          <p className="text-white/50 mb-4">No presets yet</p>
          <Link href="/admin/presets/new" className="text-white underline hover:no-underline">
            Create your first preset
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {presets.map((preset) => (
            <Card key={preset.id} className="group relative">
              <Link href={`/admin/presets/${preset.id}`} className="block">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white/20"
                    style={{ backgroundColor: preset.primary_color }}
                  />
                  <h3 className="font-semibold text-lg">{preset.name}</h3>
                </div>
                <p className="text-white/50 text-sm">
                  {preset.font_family} &middot; {(preset.display_config as unknown as DisplayConfig)?.grid_columns || 3}x grid
                </p>
              </Link>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <DeletePresetButton presetId={preset.id} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
