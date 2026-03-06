// Temporary diagnostic file — delete after OAuth is fixed
// This runs in Convex's DEFAULT V8 runtime (no "use node")
import { action } from "./_generated/server";

// Captured at module init time (when the module is first loaded)
const initTimeEnv = {
  hasGoogleId: typeof process !== "undefined" && !!process.env?.AUTH_GOOGLE_ID,
  hasGoogleSecret: typeof process !== "undefined" && !!process.env?.AUTH_GOOGLE_SECRET,
  googleIdPrefix: typeof process !== "undefined" ? process.env?.AUTH_GOOGLE_ID?.substring(0, 12) ?? "MISSING" : "NO_PROCESS",
  hasConvexSiteUrl: typeof process !== "undefined" && !!process.env?.CONVEX_SITE_URL,
  envKeyCount: typeof process !== "undefined" ? Object.keys(process.env ?? {}).length : -1,
};

export const checkEnv = action({
  args: {},
  handler: async () => {
    // Captured at function invocation time
    const runtimeEnv = {
      hasGoogleId: typeof process !== "undefined" && !!process.env?.AUTH_GOOGLE_ID,
      hasGoogleSecret: typeof process !== "undefined" && !!process.env?.AUTH_GOOGLE_SECRET,
      googleIdPrefix: typeof process !== "undefined" ? process.env?.AUTH_GOOGLE_ID?.substring(0, 12) ?? "MISSING" : "NO_PROCESS",
      hasConvexSiteUrl: typeof process !== "undefined" && !!process.env?.CONVEX_SITE_URL,
      envKeyCount: typeof process !== "undefined" ? Object.keys(process.env ?? {}).length : -1,
    };

    return {
      initTime: initTimeEnv,
      runtime: runtimeEnv,
    };
  },
});
