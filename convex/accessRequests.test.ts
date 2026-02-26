import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api } from "./_generated/api";

// Use fake timers to prevent scheduled functions (ctx.scheduler.runAfter)
// from firing outside of test transactions, which causes
// "Write outside of transaction" errors in convex-test.
beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

// Helper: seed an admin profile
async function seedAdmin(
  t: ReturnType<typeof convexTest>,
  email = "admin@test.com",
  displayName = "Admin User"
) {
  await t.run(async (ctx) => {
    await ctx.db.insert("adminProfiles", {
      email,
      displayName,
      role: "super_admin",
    });
  });
}

describe("accessRequests.requestAccess", () => {
  it("creates a new access request", async () => {
    const t = convexTest(schema);
    const asUser = t.withIdentity({
      email: "requester@test.com",
      name: "Requester",
    });
    const id = await asUser.mutation(api.accessRequests.requestAccess, {});
    expect(id).toBeDefined();

    // Verify via getMyRequest
    const request = await asUser.query(api.accessRequests.getMyRequest, {});
    expect(request).not.toBeNull();
    expect(request!.email).toBe("requester@test.com");
    expect(request!.displayName).toBe("Requester");
    expect(request!.status).toBe("pending");
  });

  it("throws when not authenticated", async () => {
    const t = convexTest(schema);
    await expect(
      t.mutation(api.accessRequests.requestAccess, {})
    ).rejects.toThrow("Not authenticated");
  });

  it("returns existing id for duplicate pending request", async () => {
    const t = convexTest(schema);
    const asUser = t.withIdentity({
      email: "requester@test.com",
      name: "Requester",
    });
    const id1 = await asUser.mutation(api.accessRequests.requestAccess, {});
    const id2 = await asUser.mutation(api.accessRequests.requestAccess, {});
    expect(id1).toEqual(id2);
  });

  it("throws if already approved", async () => {
    const t = convexTest(schema);
    // Seed an approved request directly
    await t.run(async (ctx) => {
      await ctx.db.insert("accessRequests", {
        email: "requester@test.com",
        displayName: "Requester",
        status: "approved",
        requestedAt: Date.now(),
      });
    });
    const asUser = t.withIdentity({
      email: "requester@test.com",
      name: "Requester",
    });
    await expect(
      asUser.mutation(api.accessRequests.requestAccess, {})
    ).rejects.toThrow("Already approved");
  });

  it("allows re-request if denied", async () => {
    const t = convexTest(schema);
    // Seed a denied request directly
    await t.run(async (ctx) => {
      await ctx.db.insert("accessRequests", {
        email: "requester@test.com",
        displayName: "Requester",
        status: "denied",
        requestedAt: Date.now(),
      });
    });
    const asUser = t.withIdentity({
      email: "requester@test.com",
      name: "Requester",
    });
    const id = await asUser.mutation(api.accessRequests.requestAccess, {});
    expect(id).toBeDefined();

    // Verify status is back to pending
    const request = await asUser.query(api.accessRequests.getMyRequest, {});
    expect(request!.status).toBe("pending");
  });
});

describe("accessRequests.getMyRequest", () => {
  it("returns null when not authenticated", async () => {
    const t = convexTest(schema);
    const result = await t.query(api.accessRequests.getMyRequest, {});
    expect(result).toBeNull();
  });

  it("returns null when no request exists", async () => {
    const t = convexTest(schema);
    const asUser = t.withIdentity({
      email: "nobody@test.com",
      name: "Nobody",
    });
    const result = await asUser.query(api.accessRequests.getMyRequest, {});
    expect(result).toBeNull();
  });
});

describe("accessRequests.listPending", () => {
  it("throws when not admin", async () => {
    const t = convexTest(schema);
    await expect(
      t.query(api.accessRequests.listPending, {})
    ).rejects.toThrow("Not authenticated");
  });

  it("returns only pending requests", async () => {
    const t = convexTest(schema);
    await seedAdmin(t);
    // Seed different status requests
    await t.run(async (ctx) => {
      await ctx.db.insert("accessRequests", {
        email: "pending@test.com",
        displayName: "Pending",
        status: "pending",
        requestedAt: Date.now(),
      });
      await ctx.db.insert("accessRequests", {
        email: "approved@test.com",
        displayName: "Approved",
        status: "approved",
        requestedAt: Date.now(),
      });
      await ctx.db.insert("accessRequests", {
        email: "denied@test.com",
        displayName: "Denied",
        status: "denied",
        requestedAt: Date.now(),
      });
    });
    const asAdmin = t.withIdentity({
      email: "admin@test.com",
      name: "Admin User",
    });
    const result = await asAdmin.query(api.accessRequests.listPending, {});
    expect(result).toHaveLength(1);
    expect(result[0].email).toBe("pending@test.com");
  });
});

describe("accessRequests.approve", () => {
  it("approves a pending request and creates admin profile", async () => {
    const t = convexTest(schema);
    await seedAdmin(t);

    // Create a pending request
    let requestId: any;
    await t.run(async (ctx) => {
      requestId = await ctx.db.insert("accessRequests", {
        email: "newadmin@test.com",
        displayName: "New Admin",
        status: "pending",
        requestedAt: Date.now(),
      });
    });

    const asAdmin = t.withIdentity({
      email: "admin@test.com",
      name: "Admin User",
    });
    await asAdmin.mutation(api.accessRequests.approve, { requestId });

    // Verify request status changed
    const request = await t.run(async (ctx) => {
      return await ctx.db.get(requestId);
    });
    expect(request!.status).toBe("approved");

    // Verify admin profile was created
    const profile = await t.run(async (ctx) => {
      return await ctx.db
        .query("adminProfiles")
        .withIndex("by_email", (q) => q.eq("email", "newadmin@test.com"))
        .unique();
    });
    expect(profile).not.toBeNull();
    expect(profile!.displayName).toBe("New Admin");
    expect(profile!.role).toBe("super_admin");
  });

  it("throws if request is not pending", async () => {
    const t = convexTest(schema);
    await seedAdmin(t);

    let requestId: any;
    await t.run(async (ctx) => {
      requestId = await ctx.db.insert("accessRequests", {
        email: "already@test.com",
        displayName: "Already Done",
        status: "approved",
        requestedAt: Date.now(),
      });
    });

    const asAdmin = t.withIdentity({
      email: "admin@test.com",
      name: "Admin User",
    });
    await expect(
      asAdmin.mutation(api.accessRequests.approve, { requestId })
    ).rejects.toThrow("Request is not pending");
  });
});

describe("accessRequests.deny", () => {
  it("denies a pending request", async () => {
    const t = convexTest(schema);
    await seedAdmin(t);

    let requestId: any;
    await t.run(async (ctx) => {
      requestId = await ctx.db.insert("accessRequests", {
        email: "requester@test.com",
        displayName: "Requester",
        status: "pending",
        requestedAt: Date.now(),
      });
    });

    const asAdmin = t.withIdentity({
      email: "admin@test.com",
      name: "Admin User",
    });
    await asAdmin.mutation(api.accessRequests.deny, { requestId });

    // Verify status changed to denied
    const request = await t.run(async (ctx) => {
      return await ctx.db.get(requestId);
    });
    expect(request!.status).toBe("denied");
  });

  it("throws if request is not pending", async () => {
    const t = convexTest(schema);
    await seedAdmin(t);

    let requestId: any;
    await t.run(async (ctx) => {
      requestId = await ctx.db.insert("accessRequests", {
        email: "denied@test.com",
        displayName: "Denied",
        status: "denied",
        requestedAt: Date.now(),
      });
    });

    const asAdmin = t.withIdentity({
      email: "admin@test.com",
      name: "Admin User",
    });
    await expect(
      asAdmin.mutation(api.accessRequests.deny, { requestId })
    ).rejects.toThrow("Request is not pending");
  });
});
