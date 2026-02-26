import { describe, it, expect } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api, internal } from "./_generated/api";
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

async function setupEventAndSelfie(
  t: ReturnType<typeof convexTest>,
  printStationToken?: string
) {
  let eventId: Id<"events">;
  let selfieId: Id<"selfies">;
  await t.run(async (ctx) => {
    eventId = await ctx.db.insert("events", {
      slug: "test-event",
      name: "Test Event",
      isActive: true,
      crewToken: "crew-token-123",
      uploadConfig,
      displayConfig,
      primaryColor: "#ff0000",
      moderationEnabled: false,
      updatedAt: Date.now(),
      printConfig: printStationToken
        ? {
            enabled: true,
            printStationToken,
          }
        : undefined,
    });

    // We need a storage ID for the selfie. In convex-test we can insert directly.
    const storageId = (await ctx.storage.store(
      new Blob(["fake image data"])
    )) as Id<"_storage">;

    selfieId = await ctx.db.insert("selfies", {
      eventId,
      storageId,
      displayName: "Test User",
      status: "approved",
    });
  });
  return { eventId: eventId!, selfieId: selfieId! };
}

describe("printJobs", () => {
  describe("create", () => {
    it("inserts print job with status 'queued'", async () => {
      const t = convexTest(schema);
      const asAdmin = await setupAdmin(t);
      const { eventId, selfieId } = await setupEventAndSelfie(t);

      const jobId = await asAdmin.mutation(api.printJobs.create, {
        selfieId,
        eventId,
      });

      let job: Record<string, unknown> | null = null;
      await t.run(async (ctx) => {
        job = await ctx.db.get(jobId);
      });
      expect(job).not.toBeNull();
      expect((job as any).status).toBe("queued");
      expect((job as any).queuedAt).toBeTypeOf("number");
    });

    it("defaults copies to 1 when not provided", async () => {
      const t = convexTest(schema);
      const asAdmin = await setupAdmin(t);
      const { eventId, selfieId } = await setupEventAndSelfie(t);

      const jobId = await asAdmin.mutation(api.printJobs.create, {
        selfieId,
        eventId,
      });

      let job: Record<string, unknown> | null = null;
      await t.run(async (ctx) => {
        job = await ctx.db.get(jobId);
      });
      expect((job as any).copies).toBe(1);
    });

    it("accepts custom copies value", async () => {
      const t = convexTest(schema);
      const asAdmin = await setupAdmin(t);
      const { eventId, selfieId } = await setupEventAndSelfie(t);

      const jobId = await asAdmin.mutation(api.printJobs.create, {
        selfieId,
        eventId,
        copies: 3,
      });

      let job: Record<string, unknown> | null = null;
      await t.run(async (ctx) => {
        job = await ctx.db.get(jobId);
      });
      expect((job as any).copies).toBe(3);
    });

    it("requires admin authentication", async () => {
      const t = convexTest(schema);
      const { eventId, selfieId } = await setupEventAndSelfie(t);

      await expect(
        t.mutation(api.printJobs.create, { selfieId, eventId })
      ).rejects.toThrow("Not authenticated");
    });
  });

  describe("listByEvent", () => {
    it("returns jobs for event", async () => {
      const t = convexTest(schema);
      const asAdmin = await setupAdmin(t);
      const { eventId, selfieId } = await setupEventAndSelfie(t);

      await asAdmin.mutation(api.printJobs.create, { selfieId, eventId });

      const result = await asAdmin.query(api.printJobs.listByEvent, {
        eventId,
      });
      expect(result).toHaveLength(1);
      expect(result[0].selfieId).toBe(selfieId);
      expect(result[0].displayName).toBe("Test User");
    });
  });

  describe("updateStatus", () => {
    it("validates token matches event's printStationToken", async () => {
      const t = convexTest(schema);
      const asAdmin = await setupAdmin(t);
      const printStationToken = "print-station-abc";
      const { eventId, selfieId } = await setupEventAndSelfie(
        t,
        printStationToken
      );

      const jobId = await asAdmin.mutation(api.printJobs.create, {
        selfieId,
        eventId,
      });

      // Wrong token should fail
      await expect(
        t.mutation(api.printJobs.updateStatus, {
          id: jobId,
          status: "printing",
          token: "wrong-token",
        })
      ).rejects.toThrow("Invalid token");
    });

    it("succeeds with correct print station token", async () => {
      const t = convexTest(schema);
      const asAdmin = await setupAdmin(t);
      const printStationToken = "print-station-abc";
      const { eventId, selfieId } = await setupEventAndSelfie(
        t,
        printStationToken
      );

      const jobId = await asAdmin.mutation(api.printJobs.create, {
        selfieId,
        eventId,
      });

      await t.mutation(api.printJobs.updateStatus, {
        id: jobId,
        status: "printing",
        token: printStationToken,
      });

      let job: Record<string, unknown> | null = null;
      await t.run(async (ctx) => {
        job = await ctx.db.get(jobId);
      });
      expect((job as any).status).toBe("printing");
    });

    it("sets printedAt when status is 'printed'", async () => {
      const t = convexTest(schema);
      const asAdmin = await setupAdmin(t);
      const printStationToken = "print-station-abc";
      const { eventId, selfieId } = await setupEventAndSelfie(
        t,
        printStationToken
      );

      const jobId = await asAdmin.mutation(api.printJobs.create, {
        selfieId,
        eventId,
      });

      await t.mutation(api.printJobs.updateStatus, {
        id: jobId,
        status: "printed",
        token: printStationToken,
      });

      let job: Record<string, unknown> | null = null;
      await t.run(async (ctx) => {
        job = await ctx.db.get(jobId);
      });
      expect((job as any).status).toBe("printed");
      expect((job as any).printedAt).toBeTypeOf("number");
    });
  });

  describe("adminUpdateStatus", () => {
    it("requires admin authentication", async () => {
      const t = convexTest(schema);
      const asAdmin = await setupAdmin(t);
      const { eventId, selfieId } = await setupEventAndSelfie(t);

      const jobId = await asAdmin.mutation(api.printJobs.create, {
        selfieId,
        eventId,
      });

      // Attempt without auth
      await expect(
        t.mutation(api.printJobs.adminUpdateStatus, {
          id: jobId,
          status: "printed",
        })
      ).rejects.toThrow("Not authenticated");
    });

    it("sets printedAt when status is 'printed'", async () => {
      const t = convexTest(schema);
      const asAdmin = await setupAdmin(t);
      const { eventId, selfieId } = await setupEventAndSelfie(t);

      const jobId = await asAdmin.mutation(api.printJobs.create, {
        selfieId,
        eventId,
      });

      await asAdmin.mutation(api.printJobs.adminUpdateStatus, {
        id: jobId,
        status: "printed",
      });

      let job: Record<string, unknown> | null = null;
      await t.run(async (ctx) => {
        job = await ctx.db.get(jobId);
      });
      expect((job as any).status).toBe("printed");
      expect((job as any).printedAt).toBeTypeOf("number");
    });

    it("does not set printedAt for non-printed statuses", async () => {
      const t = convexTest(schema);
      const asAdmin = await setupAdmin(t);
      const { eventId, selfieId } = await setupEventAndSelfie(t);

      const jobId = await asAdmin.mutation(api.printJobs.create, {
        selfieId,
        eventId,
      });

      await asAdmin.mutation(api.printJobs.adminUpdateStatus, {
        id: jobId,
        status: "failed",
        errorMessage: "Printer offline",
      });

      let job: Record<string, unknown> | null = null;
      await t.run(async (ctx) => {
        job = await ctx.db.get(jobId);
      });
      expect((job as any).status).toBe("failed");
      expect((job as any).errorMessage).toBe("Printer offline");
      expect((job as any).printedAt).toBeUndefined();
    });
  });

  describe("autoQueue", () => {
    it("creates a print job for new selfie", async () => {
      const t = convexTest(schema);
      const { eventId, selfieId } = await setupEventAndSelfie(t);

      await t.mutation(internal.printJobs.autoQueue, { selfieId, eventId });

      let jobs: any[] = [];
      await t.run(async (ctx) => {
        jobs = await ctx.db
          .query("printJobs")
          .withIndex("by_selfieId", (q: any) => q.eq("selfieId", selfieId))
          .collect();
      });
      expect(jobs).toHaveLength(1);
      expect(jobs[0].status).toBe("queued");
      expect(jobs[0].copies).toBe(1);
    });

    it("skips if selfie already has a print job queued", async () => {
      const t = convexTest(schema);
      const { eventId, selfieId } = await setupEventAndSelfie(t);

      // Queue once
      await t.mutation(internal.printJobs.autoQueue, { selfieId, eventId });
      // Queue again — should be a no-op
      await t.mutation(internal.printJobs.autoQueue, { selfieId, eventId });

      let jobs: any[] = [];
      await t.run(async (ctx) => {
        jobs = await ctx.db
          .query("printJobs")
          .withIndex("by_selfieId", (q: any) => q.eq("selfieId", selfieId))
          .collect();
      });
      expect(jobs).toHaveLength(1);
    });
  });
});
