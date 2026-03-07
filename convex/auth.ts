import { convexAuth } from "@convex-dev/auth/server";
import Google from "@auth/core/providers/google";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [Google],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, args) {
      try {
        if (args.profile.email) {
          const adminProfile = await ctx.db
            .query("adminProfiles")
            // @ts-expect-error — auth callback ctx doesn't carry full DataModel index types
            .withIndex("by_email", (q) => q.eq("email", args.profile.email!))
            .unique();
          if (adminProfile) {
            const patch: Record<string, unknown> = {};
            if (adminProfile.userId !== args.userId) {
              patch.userId = args.userId;
            }
            // Auto-populate displayName from Google profile on first sign-in
            // Updates if displayName is still just the email prefix (placeholder)
            const profileName = args.profile.name as string | undefined;
            const emailPrefix = adminProfile.email?.split("@")[0]?.toLowerCase();
            if (profileName && adminProfile.displayName.toLowerCase() === emailPrefix) {
              patch.displayName = profileName;
            }
            if (Object.keys(patch).length > 0) {
              await ctx.db.patch(adminProfile._id, patch);
            }
          }
        }
      } catch (error) {
        console.error("[auth] afterUserCreatedOrUpdated failed:", error);
        // Don't throw — let the sign-in succeed even if admin profile linking fails
      }
    },
  },
});
