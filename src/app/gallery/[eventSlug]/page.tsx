"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { GalleryPage } from "@/components/gallery/GalleryPage";

export default function GalleryRoute() {
  const { eventSlug } = useParams<{ eventSlug: string }>();
  const event = useQuery(api.events.getBySlugForGallery, { slug: eventSlug });

  if (event === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-white/50">Loading gallery...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/50 text-lg">Gallery not available</p>
          <p className="text-white/30 text-sm mt-2">
            This gallery may not be enabled yet or the event hasn&apos;t ended.
          </p>
        </div>
      </div>
    );
  }

  return <GalleryPage event={event} />;
}
