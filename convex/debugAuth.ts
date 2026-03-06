// Temporary — delete after OAuth fix
import { query } from "./_generated/server";

// Capture at module init (same time as convexAuth runs)
const initGoogleId = process.env.AUTH_GOOGLE_ID?.substring(0, 12) ?? "MISSING";
const initEnvKeys = Object.keys(process.env).length;

export const checkEnv = query({
  args: {},
  handler: async () => {
    return {
      initGoogleId,
      initEnvKeys,
      runtimeGoogleId: process.env.AUTH_GOOGLE_ID?.substring(0, 12) ?? "MISSING",
      runtimeEnvKeys: Object.keys(process.env).length,
    };
  },
});
