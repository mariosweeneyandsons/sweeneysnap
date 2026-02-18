import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { DisplayWall } from "@/components/display/DisplayWall";
import { Event, Selfie } from "@/types/database";

interface Props {
  params: Promise<{ eventSlug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { eventSlug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("name")
    .eq("slug", eventSlug)
    .eq("is_active", true)
    .single();

  const event = data as { name: string } | null;

  return {
    title: event ? `${event.name} — Display` : "Event Not Found",
  };
}

export default async function DisplayPage({ params }: Props) {
  const { eventSlug } = await params;
  const supabase = await createClient();

  const { data: row } = await supabase
    .from("events")
    .select("*")
    .eq("slug", eventSlug)
    .eq("is_active", true)
    .single();

  if (!row) notFound();

  const event = row as unknown as Event;

  // Fetch initial approved selfies
  const { data: selfieRows } = await supabase
    .from("selfies")
    .select("*")
    .eq("event_id", event.id)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(100);

  const selfies = (selfieRows || []) as unknown as Selfie[];

  return <DisplayWall event={event} initialSelfies={selfies} />;
}
