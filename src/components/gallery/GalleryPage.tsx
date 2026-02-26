"use client";

import { useState, useCallback } from "react";
import { usePaginatedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { PublicEvent, SelfieWithUrls } from "@/types/database";
import { GalleryGrid } from "./GalleryGrid";
import { Lightbox } from "./Lightbox";
import { Button } from "@/components/ui/Button";

interface GalleryPageProps {
  event: PublicEvent;
}

export function GalleryPage({ event }: GalleryPageProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { results, status, loadMore } = usePaginatedQuery(
    api.selfies.listApprovedByEventPaginated,
    { eventId: event._id as Id<"events"> },
    { initialNumItems: 24 }
  );

  const selfies = results as SelfieWithUrls[];
  const allowDownload = event.uploadConfig.galleryAllowDownload !== false;
  const headerText = event.uploadConfig.galleryHeaderText || `${event.name} Photo Gallery`;

  const currentSelfie = lightboxIndex !== null ? selfies[lightboxIndex] : null;

  const handleSelfieClick = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  const handleLightboxClose = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const handleLightboxPrev = useCallback(() => {
    setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i));
  }, []);

  const handleLightboxNext = useCallback(() => {
    setLightboxIndex((i) => {
      if (i === null) return null;
      if (i < selfies.length - 1) return i + 1;
      // Try to load more when reaching the end
      if (status === "CanLoadMore") loadMore(24);
      return i;
    });
  }, [selfies.length, status, loadMore]);

  // Format event date
  const eventDate = event.startsAt
    ? new Date(event.startsAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4">
            {event.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={event.logoUrl}
                alt={event.name}
                className="w-12 h-12 rounded-lg object-contain"
              />
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {headerText}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                {eventDate && (
                  <p className="text-white/50 text-sm">{eventDate}</p>
                )}
                <p className="text-white/30 text-sm">
                  {selfies.length} photo{selfies.length !== 1 ? "s" : ""}
                  {status === "CanLoadMore" ? "+" : ""}
                </p>
              </div>
            </div>
          </div>
          {/* CTA to upload */}
          <div className="mt-4">
            <a
              href={`/${event.slug}`}
              className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
              Take your own selfie
            </a>
          </div>
        </div>
      </header>

      {/* Gallery */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <GalleryGrid
          selfies={selfies}
          allowDownload={allowDownload}
          onSelfieClick={handleSelfieClick}
        />

        {/* Load more */}
        {status === "CanLoadMore" && (
          <div className="text-center mt-8">
            <Button
              variant="secondary"
              onClick={() => loadMore(24)}
            >
              Load More Photos
            </Button>
          </div>
        )}

        {status === "LoadingMore" && (
          <div className="text-center mt-8">
            <p className="text-white/40 text-sm">Loading more...</p>
          </div>
        )}
      </main>

      {/* Lightbox */}
      <Lightbox
        selfie={currentSelfie}
        onClose={handleLightboxClose}
        onPrev={handleLightboxPrev}
        onNext={handleLightboxNext}
        hasPrev={lightboxIndex !== null && lightboxIndex > 0}
        hasNext={lightboxIndex !== null && lightboxIndex < selfies.length - 1}
        allowDownload={allowDownload}
      />
    </div>
  );
}
