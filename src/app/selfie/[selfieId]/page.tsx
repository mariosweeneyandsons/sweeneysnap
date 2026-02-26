import type { Metadata } from "next";
import SelfiePageClient from "./SelfiePageClient";

type Props = {
  params: Promise<{ selfieId: string }>;
};

async function fetchSelfie(selfieId: string) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) return null;

  try {
    const apiUrl = convexUrl.replace("/.functions", "");
    const res = await fetch(`${apiUrl}/api/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: "selfies:getPublicById",
        args: { selfieId },
      }),
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.value ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { selfieId } = await params;
  const selfie = await fetchSelfie(selfieId);

  if (!selfie) {
    return {
      title: "Selfie — SweeneySnap",
      description: "Check out this selfie on SweeneySnap!",
    };
  }

  const title = selfie.displayName
    ? `${selfie.displayName}'s selfie from ${selfie.eventName}`
    : `Selfie from ${selfie.eventName}`;

  return {
    title,
    description: selfie.message || `Check out this selfie from ${selfie.eventName} on SweeneySnap!`,
    openGraph: {
      title,
      description: selfie.message || `Check out this selfie from ${selfie.eventName} on SweeneySnap!`,
    },
  };
}

export default function SelfiePage() {
  return <SelfiePageClient />;
}
