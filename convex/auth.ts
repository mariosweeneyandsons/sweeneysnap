import { convexAuth } from "@convex-dev/auth/server";
import Google from "@auth/core/providers/google";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [Google],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, args) {
      if (args.profile.email) {
        const adminProfile = await ctx.db
          .query("adminProfiles")
          .withIndex("by_email", (q) => q.eq("email", args.profile.email!))
          .unique();
        if (adminProfile && adminProfile.userId !== args.userId) {
          await ctx.db.patch(adminProfile._id, { userId: args.userId });
        }
      }
    },
  },
});
