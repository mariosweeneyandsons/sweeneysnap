import { internalMutation } from "./_generated/server";

export const checkAndToggleEvents = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const events = await ctx.db.query("events").collect();

    for (const event of events) {
      if (event.archived) continue;
      if (!event.startsAt && !event.endsAt) continue;

      const shouldBeActive =
        (!event.startsAt || now >= event.startsAt) &&
        (!event.endsAt || now <= event.endsAt);

      if (event.isActive !== shouldBeActive) {
        await ctx.db.patch(event._id, {
          isActive: shouldBeActive,
          updatedAt: now,
        });
      }
    }
  },
});
