import { convexTest } from "convex-test";
import { expect, test, describe, vi, beforeEach, afterEach } from "vitest";
import schema from "./schema";
import { api, internal } from "./_generated/api";

// Use fake timers to prevent scheduled functions (ctx.scheduler.runAfter)
// from firing outside of test transactions, which causes
// "Write outside of transaction" errors in convex-test.
beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

// --- Helpers ---

async function seedAdminAndEvent(t: ReturnType<typeof convexTest>) {
  const asAdmin = t.withIdentity({ email: "admin@test.com", name: "Admin" });
  await t.run(async (ctx) => {
    await ctx.db.insert("adminProfiles", {
      email: "admin@test.com",
      displayName: "Admin",
      role: "super_admin",
    });
  });
  const eventId = await asAdmin.mutation(api.events.create, {
    slug: "test-event",
    name: "Test Event",
    isActive: true,
    uploadConfig: {},
    displayConfig: {},
    primaryColor: "#ffffff",
    moderationEnabled: false,
  });
  return { asAdmin, eventId };
}

async function seedSelfie(
  t: ReturnType<typeof convexTest>,
  eventId: string,
  overrides: Record<string, unknown> = {}
) {
  let selfieId: string = "";
  await t.run(async (ctx) => {
    const storageId = await ctx.storage.store(new Blob(["fake-image"]));
    selfieId = await ctx.db.insert("selfies", {
      eventId: eventId as any,
      storageId,
      displayName: "Test User",
      status: "pending",
      ...overrides,
    } as any);
  });
  return selfieId;
}

// --- Tests ---

describe("selfies.listApprovedByEvent", () => {
  test("returns only approved selfies", async () => {
    const t = convexTest(schema);
    const { eventId } = await seedAdminAndEvent(t);
    await seedSelfie(t, eventId, { status: "approved" });
    await seedSelfie(t, eventId, { status: "pending" });
    await seedSelfie(t, eventId, { status: "rejected" });

    const result = await t.query(api.selfies.listApprovedByEvent, {
      eventId: eventId as any,
    });
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("approved");
  });

  test("returns empty array for inactive event", async () => {
    const t = convexTest(schema);
    const { asAdmin, eventId } = await seedAdminAndEvent(t);
    await seedSelfie(t, eventId, { status: "approved" });

    // Deactivate the event
    await asAdmin.mutation(api.events.update, {
      id: eventId,
      slug: "test-event",
      name: "Test Event",
      isActive: false,
      uploadConfig: {},
      displayConfig: {},
      primaryColor: "#ffffff",
      moderationEnabled: false,
    });

    const result = await t.query(api.selfies.listApprovedByEvent, {
      eventId: eventId as any,
    });
    expect(result).toHaveLength(0);
  });
});

describe("selfies.listByEvent", () => {
  test("requires admin or crew token", async () => {
    const t = convexTest(schema);
    const { eventId } = await seedAdminAndEvent(t);
    // No auth, no crew token
    await expect(
      t.query(api.selfies.listByEvent, { eventId: eventId as any })
    ).rejects.toThrow("Not authorized");
  });

  test("returns selfies for admin", async () => {
    const t = convexTest(schema);
    const { asAdmin, eventId } = await seedAdminAndEvent(t);
    await seedSelfie(t, eventId);

    const result = await asAdmin.query(api.selfies.listByEvent, {
      eventId: eventId as any,
    });
    expect(result).toHaveLength(1);
  });

  test("returns selfies filtered by status", async () => {
    const t = convexTest(schema);
    const { asAdmin, eventId } = await seedAdminAndEvent(t);
    await seedSelfie(t, eventId, { status: "approved" });
    await seedSelfie(t, eventId, { status: "pending" });

    const result = await asAdmin.query(api.selfies.listByEvent, {
      eventId: eventId as any,
      status: "approved",
    });
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("approved");
  });
});

describe("selfies.countByEvent", () => {
  test("counts all selfies for event", async () => {
    const t = convexTest(schema);
    const { asAdmin, eventId } = await seedAdminAndEvent(t);
    await seedSelfie(t, eventId, { status: "approved" });
    await seedSelfie(t, eventId, { status: "pending" });
    await seedSelfie(t, eventId, { status: "rejected" });

    const count = await asAdmin.query(api.selfies.countByEvent, {
      eventId: eventId as any,
    });
    expect(count).toBe(3);
  });
});

describe("selfies.countByEventAndStatus", () => {
  test("counts selfies by specific status", async () => {
    const t = convexTest(schema);
    const { asAdmin, eventId } = await seedAdminAndEvent(t);
    await seedSelfie(t, eventId, { status: "approved" });
    await seedSelfie(t, eventId, { status: "approved" });
    await seedSelfie(t, eventId, { status: "pending" });

    const count = await asAdmin.query(api.selfies.countByEventAndStatus, {
      eventId: eventId as any,
      status: "approved",
    });
    expect(count).toBe(2);
  });
});

describe("selfies.generateUploadUrl", () => {
  test("validates event exists when eventId provided", async () => {
    const t = convexTest(schema);
    const { eventId } = await seedAdminAndEvent(t);
    // Use the event's actual ID -- event exists and is active, should succeed
    const url = await t.mutation(api.selfies.generateUploadUrl, {
      eventId: eventId as any,
    });
    expect(typeof url).toBe("string");
  });

  test("throws for nonexistent event", async () => {
    const t = convexTest(schema);
    await seedAdminAndEvent(t);
    // Fabricate a fake event ID via direct db access
    let fakeEventId: any;
    await t.run(async (ctx) => {
      const id = await ctx.db.insert("events", {
        slug: "temp",
        name: "temp",
        isActive: true,
        crewToken: "x",
        uploadConfig: {},
        displayConfig: {},
        primaryColor: "#fff",
        moderationEnabled: false,
        updatedAt: 0,
      } as any);
      await ctx.db.delete(id);
      fakeEventId = id;
    });
    await expect(
      t.mutation(api.selfies.generateUploadUrl, { eventId: fakeEventId })
    ).rejects.toThrow("Event not found or not active");
  });
});

describe("selfies.generateUploadUrlForEvent", () => {
  test("enforces upload limit per session", async () => {
    const t = convexTest(schema);
    const { asAdmin, eventId } = await seedAdminAndEvent(t);
    // Set maxUploadsPerSession to 2
    await asAdmin.mutation(api.events.update, {
      id: eventId,
      slug: "test-event",
      name: "Test Event",
      isActive: true,
      uploadConfig: { maxUploadsPerSession: 2 },
      displayConfig: {},
      primaryColor: "#ffffff",
      moderationEnabled: false,
    });
    const sessionId = "session-abc";
    await seedSelfie(t, eventId, { sessionId });
    await seedSelfie(t, eventId, { sessionId });

    await expect(
      t.mutation(api.selfies.generateUploadUrlForEvent, {
        eventId: eventId as any,
        sessionId,
      })
    ).rejects.toThrow("Upload limit reached for this session");
  });
});

describe("selfies.create", () => {
  test("validates event exists and is active", async () => {
    const t = convexTest(schema);
    const { asAdmin, eventId } = await seedAdminAndEvent(t);
    // Deactivate event
    await asAdmin.mutation(api.events.update, {
      id: eventId,
      slug: "test-event",
      name: "Test Event",
      isActive: false,
      uploadConfig: {},
      displayConfig: {},
      primaryColor: "#ffffff",
      moderationEnabled: false,
    });

    let storageId: any;
    await t.run(async (ctx) => {
      storageId = await ctx.storage.store(new Blob(["fake"]));
    });

    await expect(
      t.mutation(api.selfies.create, {
        eventId: eventId as any,
        storageId,
        status: "pending",
      })
    ).rejects.toThrow("Event is not active");
  });

  test("validates displayName length", async () => {
    const t = convexTest(schema);
    const { eventId } = await seedAdminAndEvent(t);

    let storageId: any;
    await t.run(async (ctx) => {
      storageId = await ctx.storage.store(new Blob(["fake"]));
    });

    await expect(
      t.mutation(api.selfies.create, {
        eventId: eventId as any,
        storageId,
        displayName: "a".repeat(101),
        status: "pending",
      })
    ).rejects.toThrow("displayName exceeds maximum length");
  });

  test("sets deliveryStatus when email is provided", async () => {
    const t = convexTest(schema);
    const { eventId } = await seedAdminAndEvent(t);

    let storageId: any;
    await t.run(async (ctx) => {
      storageId = await ctx.storage.store(new Blob(["fake"]));
    });

    const selfieId = await t.mutation(api.selfies.create, {
      eventId: eventId as any,
      storageId,
      displayName: "Test",
      status: "pending",
      email: "user@example.com",
    });

    await t.run(async (ctx) => {
      const selfie = await ctx.db.get(selfieId);
      expect(selfie).not.toBeNull();
      expect(selfie!.deliveryStatus).toBe("pending");
      expect(selfie!.email).toBe("user@example.com");
    });
  });

  test("sets deliveryStatus when phone is provided", async () => {
    const t = convexTest(schema);
    const { eventId } = await seedAdminAndEvent(t);

    let storageId: any;
    await t.run(async (ctx) => {
      storageId = await ctx.storage.store(new Blob(["fake"]));
    });

    const selfieId = await t.mutation(api.selfies.create, {
      eventId: eventId as any,
      storageId,
      displayName: "Test",
      status: "pending",
      phone: "+1234567890",
    });

    await t.run(async (ctx) => {
      const selfie = await ctx.db.get(selfieId);
      expect(selfie!.deliveryStatus).toBe("pending");
    });
  });

  test("creates selfie successfully with valid data", async () => {
    const t = convexTest(schema);
    const { eventId } = await seedAdminAndEvent(t);

    let storageId: any;
    await t.run(async (ctx) => {
      storageId = await ctx.storage.store(new Blob(["image"]));
    });

    const selfieId = await t.mutation(api.selfies.create, {
      eventId: eventId as any,
      storageId,
      displayName: "John",
      message: "Hello!",
      status: "approved",
      sessionId: "sess-1",
    });
    expect(selfieId).toBeTruthy();

    await t.run(async (ctx) => {
      const selfie = await ctx.db.get(selfieId);
      expect(selfie!.displayName).toBe("John");
      expect(selfie!.status).toBe("approved");
    });
  });
});

describe("selfies.updateStatus", () => {
  test("requires admin", async () => {
    const t = convexTest(schema);
    const { eventId } = await seedAdminAndEvent(t);
    const selfieId = await seedSelfie(t, eventId);

    await expect(
      t.mutation(api.selfies.updateStatus, {
        id: selfieId as any,
        status: "approved",
      })
    ).rejects.toThrow("Not authenticated");
  });

  test("updates selfie status", async () => {
    const t = convexTest(schema);
    const { asAdmin, eventId } = await seedAdminAndEvent(t);
    const selfieId = await seedSelfie(t, eventId, { status: "pending" });

    await asAdmin.mutation(api.selfies.updateStatus, {
      id: selfieId as any,
      status: "approved",
    });

    await t.run(async (ctx) => {
      const selfie = await ctx.db.get(selfieId as any);
      expect(selfie!.status).toBe("approved");
    });
  });
});

describe("selfies.remove", () => {
  test("deletes storage and record", async () => {
    const t = convexTest(schema);
    const { asAdmin, eventId } = await seedAdminAndEvent(t);
    const selfieId = await seedSelfie(t, eventId);

    await asAdmin.mutation(api.selfies.remove, { id: selfieId as any });

    await t.run(async (ctx) => {
      const selfie = await ctx.db.get(selfieId as any);
      expect(selfie).toBeNull();
    });
  });

  test("requires admin", async () => {
    const t = convexTest(schema);
    const { eventId } = await seedAdminAndEvent(t);
    const selfieId = await seedSelfie(t, eventId);

    await expect(
      t.mutation(api.selfies.remove, { id: selfieId as any })
    ).rejects.toThrow("Not authenticated");
  });
});

describe("selfies.bulkUpdateStatus", () => {
  test("updates multiple selfies", async () => {
    const t = convexTest(schema);
    const { asAdmin, eventId } = await seedAdminAndEvent(t);
    const id1 = await seedSelfie(t, eventId, { status: "pending" });
    const id2 = await seedSelfie(t, eventId, { status: "pending" });

    await asAdmin.mutation(api.selfies.bulkUpdateStatus, {
      ids: [id1 as any, id2 as any],
      status: "approved",
    });

    await t.run(async (ctx) => {
      const s1 = await ctx.db.get(id1 as any);
      const s2 = await ctx.db.get(id2 as any);
      expect(s1!.status).toBe("approved");
      expect(s2!.status).toBe("approved");
    });
  });

  test("requires admin", async () => {
    const t = convexTest(schema);
    const { eventId } = await seedAdminAndEvent(t);
    const id1 = await seedSelfie(t, eventId);

    await expect(
      t.mutation(api.selfies.bulkUpdateStatus, {
        ids: [id1 as any],
        status: "approved",
      })
    ).rejects.toThrow("Not authenticated");
  });
});

describe("selfies.removeAllByEvent", () => {
  test("deletes selfies and reports hasMore", async () => {
    const t = convexTest(schema);
    const { asAdmin, eventId } = await seedAdminAndEvent(t);
    // Seed a few selfies
    await seedSelfie(t, eventId);
    await seedSelfie(t, eventId);
    await seedSelfie(t, eventId);

    const result = await asAdmin.mutation(api.selfies.removeAllByEvent, {
      eventId: eventId as any,
    });
    expect(result.deleted).toBe(3);
    expect(result.hasMore).toBe(false);
  });
});

describe("selfies.countsByEvents", () => {
  test("returns counts grouped by event", async () => {
    const t = convexTest(schema);
    const { asAdmin, eventId } = await seedAdminAndEvent(t);
    await seedSelfie(t, eventId, { status: "approved" });
    await seedSelfie(t, eventId, { status: "pending" });
    await seedSelfie(t, eventId, { status: "rejected" });

    const result = await asAdmin.query(api.selfies.countsByEvents, {
      eventIds: [eventId as any],
    });
    expect(result[eventId]).toBeDefined();
    expect(result[eventId].total).toBe(3);
    expect(result[eventId].approved).toBe(1);
    expect(result[eventId].pending).toBe(1);
    expect(result[eventId].rejected).toBe(1);
  });
});

describe("selfies.countBySessionAndEvent", () => {
  test("returns 0 for inactive event", async () => {
    const t = convexTest(schema);
    const { asAdmin, eventId } = await seedAdminAndEvent(t);
    await seedSelfie(t, eventId, { sessionId: "sess-1" });

    // Deactivate event
    await asAdmin.mutation(api.events.update, {
      id: eventId,
      slug: "test-event",
      name: "Test Event",
      isActive: false,
      uploadConfig: {},
      displayConfig: {},
      primaryColor: "#ffffff",
      moderationEnabled: false,
    });

    const count = await t.query(api.selfies.countBySessionAndEvent, {
      eventId: eventId as any,
      sessionId: "sess-1",
    });
    expect(count).toBe(0);
  });

  test("returns count for active event", async () => {
    const t = convexTest(schema);
    const { eventId } = await seedAdminAndEvent(t);
    await seedSelfie(t, eventId, { sessionId: "sess-1" });
    await seedSelfie(t, eventId, { sessionId: "sess-1" });
    await seedSelfie(t, eventId, { sessionId: "sess-2" });

    const count = await t.query(api.selfies.countBySessionAndEvent, {
      eventId: eventId as any,
      sessionId: "sess-1",
    });
    expect(count).toBe(2);
  });
});
