import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";
import { NextResponse } from "next/server";

const APP_DOMAINS = [
  "localhost",
  "sweeneysnap.com",
  "www.sweeneysnap.com",
  "sweeneysnap.vercel.app",
];

export default convexAuthNextjsMiddleware(
  (request, { event, convexAuth }) => {
    const hostname = (
      request.headers.get("host")?.split(":")[0] ?? ""
    ).toLowerCase();

    // Custom domain proxy — rewrite non-app domains to internal route
    if (!APP_DOMAINS.some((d) => hostname === d || hostname.endsWith(`.${d}`))) {
      const url = request.nextUrl.clone();
      url.pathname = `/_custom-domain/${hostname}${url.pathname === "/" ? "" : url.pathname}`;
      return NextResponse.rewrite(url);
    }

    return NextResponse.next();
  }
);

export const config = {
  matcher: ["/((?!_next|_static|favicon.ico|icons|manifest.json|sw.js).*)"],
};
