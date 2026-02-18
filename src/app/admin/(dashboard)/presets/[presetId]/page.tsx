import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PresetForm } from "@/components/admin/PresetForm";
import { Preset } from "@/types/database";

interface Props {
  params: Promise<{ presetId: string }>;
}

export default async function EditPresetPage({ params }: Props) {
  const { presetId } = await params;
  const supabase = await createClient();

  const { data: row } = await supabase
    .from("presets")
    .select("*")
    .eq("id", presetId)
    .single();

  if (!row) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Edit Preset</h1>
      <PresetForm preset={row as unknown as Preset} />
    </div>
  );
}
