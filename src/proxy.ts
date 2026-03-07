import { NextRequest, NextResponse } from "next/server";

const APP_DOMAINS = [
  "localhost",
  "sweeneysnap.com",
  "www.sweeneysnap.com",
  "sweeneysnap.vercel.app",
];

export function proxy(request: NextRequest) {
  const hostname = (request.headers.get("host")?.split(":")[0] ?? "").toLowerCase();

  // Skip for app's own domains
  if (APP_DOMAINS.some((d) => hostname === d || hostname.endsWith(`.${d}`))) {
    return NextResponse.next();
  }

  // Rewrite custom domain to internal route
  const url = request.nextUrl.clone();
  url.pathname = `/_custom-domain/${hostname}${url.pathname === "/" ? "" : url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next|_static|favicon.ico|icons|manifest.json|sw.js|api).*)"],
};
