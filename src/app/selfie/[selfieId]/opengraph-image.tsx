import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SweeneySnap Selfie";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ selfieId: string }>;
}) {
  const { selfieId } = await params;
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return new ImageResponse(
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#000", color: "#fff", alignItems: "center", justifyContent: "center", fontSize: 48 }}>
        SweeneySnap
      </div>,
      { ...size }
    );
  }

  // Fetch selfie data via Convex HTTP
  try {
    const apiUrl = convexUrl.replace("/.functions", "");
    const res = await fetch(`${apiUrl}/api/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: "selfies:getPublicById",
        args: { selfieId },
      }),
    });

    if (!res.ok) throw new Error("fetch failed");
    const data = await res.json();
    const selfie = data.value;

    if (!selfie?.imageUrl) throw new Error("no selfie");

    return new ImageResponse(
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#000",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
          padding: 40,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={selfie.imageUrl}
          width={500}
          height={500}
          style={{ borderRadius: 24, objectFit: "cover" }}
        />
        <div style={{ display: "flex", flexDirection: "column", color: "#fff", maxWidth: 500 }}>
          {selfie.displayName && (
            <div style={{ fontSize: 48, fontWeight: "bold", marginBottom: 16 }}>
              {selfie.displayName}
            </div>
          )}
          <div style={{ fontSize: 24, opacity: 0.6 }}>
            {selfie.eventName}
          </div>
          <div style={{ fontSize: 20, opacity: 0.4, marginTop: 24 }}>
            SweeneySnap
          </div>
        </div>
      </div>,
      { ...size }
    );
  } catch {
    return new ImageResponse(
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#000", color: "#fff", alignItems: "center", justifyContent: "center", fontSize: 48 }}>
        SweeneySnap
      </div>,
      { ...size }
    );
  }
}
