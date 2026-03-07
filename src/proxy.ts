import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const APP_DOMAINS = [
  "localhost",
  "sweeneysnap.com",
  "www.sweeneysnap.com",
  "sweeneysnap.vercel.app",
];

export default clerkMiddleware(async (auth, request) => {
  const hostname = (
    request.headers.get("host")?.split(":")[0] ?? ""
  ).toLowerCase();

  // Skip custom domain rewriting for app's own domains
  if (APP_DOMAINS.some((d) => hostname === d || hostname.endsWith(`.${d}`))) {
    return;
  }

  // Rewrite custom domain to internal route
  const url = request.nextUrl.clone();
  url.pathname = `/_custom-domain/${hostname}${url.pathname === "/" ? "" : url.pathname}`;
  return NextResponse.rewrite(url);
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
