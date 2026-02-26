import { describe, it, expect } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const uploadConfig = {
  maxFileSizeMb: 10,
  allowGallery: false,
};

const displayConfig = {
  gridColumns: 3,
  swapInterval: 5,
};

async function setupAdmin(t: ReturnType<typeof convexTest>) {
  const asAdmin = t.withIdentity({ email: "admin@test.com", name: "Admin" });
  await t.run(async (ctx) => {
    await ctx.db.insert("adminProfiles", {
      email: "admin@test.com",
      displayName: "Admin",
      role: "super_admin",
    });
  });
  return asAdmin;
}

async function setupEvent(t: ReturnType<typeof convexTest>) {
  let eventId: Id<"events">;
  const crewToken = "crew-token-123";
  await t.run(async (ctx) => {
    eventId = await ctx.db.insert("events", {
      slug: "test-event",
      name: "Test Event",
      isActive: true,
      crewToken,
      uploadConfig,
      displayConfig,
      primaryColor: "#ff0000",
      moderationEnabled: false,
      updatedAt: Date.now(),
    });
  });
  return { eventId: eventId!, crewToken };
}

async function setupCrewMember(
  t: ReturnType<typeof convexTest>,
  eventId: Id<"events">
) {
  let memberId: Id<"crewMembers">;
  const memberToken = "member-token-456";
  await t.run(async (ctx) => {
    memberId = await ctx.db.insert("crewMembers", {
      eventId,
      name: "Test Crew Member",
      token: memberToken,
      permission: "moderator",
      createdAt: Date.now(),
    });
  });
  return { memberId: memberId!, memberToken };
}

describe("crewActivityLog", () => {
  describe("listByEvent", () => {
    it("requires admin or crew authentication", async () => {
      const t = convexTest(schema);
      const { eventId } = await setupEvent(t);

      // No auth, no crew token
      await expect(
        t.query(api.crewActivityLog.listByEvent, { eventId })
      ).rejects.toThrow("Not authorized");
    });

    it("allows access with valid crew token", async () => {
      const t = convexTest(schema);
      const { eventId, crewToken } = await setupEvent(t);

      const result = await t.query(api.crewActivityLog.listByEvent, {
        eventId,
        crewToken,
      });
      expect(result).toEqual([]);
    });

    it("allows access with admin identity", async () => {
      const t = convexTest(schema);
      const asAdmin = await setupAdmin(t);
      const { eventId } = await setupEvent(t);

      const result = await asAdmin.query(api.crewActivityLog.listByEvent, {
        eventId,
      });
      expect(result).toEqual([]);
    });

    it("returns activity logs for event", async () => {
      const t = convexTest(schema);
      const { eventId, crewToken } = await setupEvent(t);

      await t.run(async (ctx) => {
        await ctx.db.insert("crewActivityLog", {
          eventId,
          crewToken,
          action: "approve",
          timestamp: Date.now(),
        });
        await ctx.db.insert("crewActivityLog", {
          eventId,
          crewToken,
          action: "reject",
          timestamp: Date.now() + 1000,
        });
      });

      const result = await t.query(api.crewActivityLog.listByEvent, {
        eventId,
        crewToken,
      });
      expect(result).toHaveLength(2);
      // desc order, so newest first
      expect(result[0].action).toBe("reject");
      expect(result[1].action).toBe("approve");
    });

    it("resolves crew member names", async () => {
      const t = convexTest(schema);
      const { eventId, crewToken } = await setupEvent(t);
      const { memberId } = await setupCrewMember(t, eventId);

      await t.run(async (ctx) => {
        await ctx.db.insert("crewActivityLog", {
          eventId,
          crewMemberId: memberId,
          crewToken,
          action: "approve",
          timestamp: Date.now(),
        });
      });

      const result = await t.query(api.crewActivityLog.listByEvent, {
        eventId,
        crewToken,
      });
      expect(result).toHaveLength(1);
      expect(result[0].crewMemberName).toBe("Test Crew Member");
    });

    it("returns null for crewMemberName when no crewMemberId", async () => {
      const t = convexTest(schema);
      const { eventId, crewToken } = await setupEvent(t);

      await t.run(async (ctx) => {
        await ctx.db.insert("crewActivityLog", {
          eventId,
          crewToken,
          action: "delete",
          timestamp: Date.now(),
        });
      });

      const result = await t.query(api.crewActivityLog.listByEvent, {
        eventId,
        crewToken,
      });
      expect(result[0].crewMemberName).toBeNull();
    });
  });

  describe("log", () => {
    it("creates activity log entry", async () => {
      const t = convexTest(schema);
      const { eventId, crewToken } = await setupEvent(t);

      const logId = await t.mutation(api.crewActivityLog.log, {
        eventId,
        crewToken,
        action: "approve",
      });

      expect(logId).toBeDefined();

      const logs = await t.query(api.crewActivityLog.listByEvent, {
        eventId,
        crewToken,
      });
      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe("approve");
      expect(logs[0].eventId).toBe(eventId);
    });

    it("sets timestamp automatically", async () => {
      const t = convexTest(schema);
      const { eventId, crewToken } = await setupEvent(t);
      const before = Date.now();

      await t.mutation(api.crewActivityLog.log, {
        eventId,
        crewToken,
        action: "reject",
      });

      const logs = await t.query(api.crewActivityLog.listByEvent, {
        eventId,
        crewToken,
      });
      expect(logs[0].timestamp).toBeGreaterThanOrEqual(before);
    });

    it("requires admin or crew auth", async () => {
      const t = convexTest(schema);
      const { eventId } = await setupEvent(t);

      await expect(
        t.mutation(api.crewActivityLog.log, {
          eventId,
          crewToken: "wrong-token",
          action: "approve",
        })
      ).rejects.toThrow("Not authorized");
    });

    it("allows crew member token for auth", async () => {
      const t = convexTest(schema);
      const { eventId } = await setupEvent(t);
      const { memberToken } = await setupCrewMember(t, eventId);

      const logId = await t.mutation(api.crewActivityLog.log, {
        eventId,
        crewToken: memberToken,
        action: "reset",
      });

      expect(logId).toBeDefined();
    });
  });
});
