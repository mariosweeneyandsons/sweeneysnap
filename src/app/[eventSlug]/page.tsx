import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { UploadForm } from "@/components/upload/UploadForm";
import { Event, UploadConfig } from "@/types/database";

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
    title: event ? `${event.name} — SweeneySnap` : "Event Not Found",
  };
}

export default async function UploadPage({ params }: Props) {
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
  const config = event.upload_config as UploadConfig;

  return (
    <main className="min-h-dvh bg-black text-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {event.logo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.logo_url} alt="" className="h-12 w-auto mb-6" />
        )}
        <h1 className="text-2xl font-bold mb-2 text-center">{event.name}</h1>
        <p className="text-white/60 mb-8 text-center">
          {config.welcome_text || "Take a selfie and see it on the big screen!"}
        </p>
        <div className="w-full max-w-sm">
          <UploadForm event={event} />
        </div>
      </div>
    </main>
  );
}
