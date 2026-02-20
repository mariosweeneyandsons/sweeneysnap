// Convex Auth handles sessions client-side via the ConvexReactClient.
// Admin route protection is handled in the admin layout component.
// No server-side middleware needed for auth.

export { default } from "next/dist/client/components/noop-head";

export const config = {
  matcher: [],
};
