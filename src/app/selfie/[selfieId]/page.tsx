"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import Link from "next/link";

export default function SelfiePage() {
  const { selfieId } = useParams<{ selfieId: string }>();
  const selfie = useQuery(api.selfies.getPublicById, {
    selfieId: selfieId as Id<"selfies">,
  });

  if (selfie === undefined) {
    return (
      <main className="min-h-dvh bg-black text-white flex items-center justify-center">
        <p style={{ opacity: 0.5 }}>Loading...</p>
      </main>
    );
  }

  if (!selfie) {
    return (
      <main className="min-h-dvh bg-black text-white flex items-center justify-center">
        <p style={{ opacity: 0.5 }}>Selfie not found or not yet approved</p>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-black text-white flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg mx-auto">
        {selfie.eventLogoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={selfie.eventLogoUrl}
            alt=""
            className="h-10 w-auto mb-4 mx-auto"
          />
        )}
        <div className="rounded-2xl overflow-hidden mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selfie.imageUrl || ""}
            alt={selfie.displayName || "Selfie"}
            className="w-full aspect-square object-cover"
          />
        </div>
        {selfie.displayName && (
          <p className="text-lg font-semibold text-center mb-1">
            {selfie.displayName}
          </p>
        )}
        {selfie.message && (
          <p className="text-center text-white/60 mb-4">{selfie.message}</p>
        )}
        <p className="text-center text-white/40 text-sm mb-6">
          From {selfie.eventName}
        </p>
        <div className="text-center">
          <Link
            href={`/${selfie.eventSlug}`}
            className="inline-block bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-white/90 transition"
          >
            Take your own selfie!
          </Link>
        </div>
      </div>
    </main>
  );
}
