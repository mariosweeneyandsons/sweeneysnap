import { describe, it, expect } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { validateStringLength } from "./lib";

describe("validateStringLength", () => {
  it("does nothing for undefined value", () => {
    expect(() => validateStringLength(undefined, "name", 100)).not.toThrow();
  });

  it("does nothing for empty string", () => {
    expect(() => validateStringLength("", "name", 100)).not.toThrow();
  });

  it("does nothing for string within limit", () => {
    expect(() => validateStringLength("hello", "name", 100)).not.toThrow();
  });

  it("does nothing for string at exact limit", () => {
    expect(() => validateStringLength("abc", "name", 3)).not.toThrow();
  });

  it("throws for string exceeding limit", () => {
    expect(() => validateStringLength("hello", "name", 3)).toThrow(
      "name exceeds maximum length of 3 characters"
    );
  });

  it("includes field name and max length in error message", () => {
    expect(() => validateStringLength("too long", "description", 5)).toThrow(
      "description exceeds maximum length of 5 characters"
    );
  });
});

describe("requireAdmin", () => {
  it("throws when not authenticated", async () => {
    const t = convexTest(schema);
    await expect(
      t.run(async (ctx) => {
        const { requireAdmin } = await import("./lib");
        await requireAdmin(ctx);
      })
    ).rejects.toThrow("Not authenticated");
  });

  it("throws when user is not in adminProfiles", async () => {
    const t = convexTest(schema);
    const asUser = t.withIdentity({
      email: "nobody@test.com",
      name: "Nobody",
    });
    await expect(
      asUser.run(async (ctx) => {
        const { requireAdmin } = await import("./lib");
        await requireAdmin(ctx);
      })
    ).rejects.toThrow("Not authorized");
  });

  it("succeeds when user is an admin", async () => {
    const t = convexTest(schema);
    // Insert admin profile first
    await t.run(async (ctx) => {
      await ctx.db.insert("adminProfiles", {
        email: "admin@test.com",
        displayName: "Admin User",
        role: "super_admin",
      });
    });
    const asAdmin = t.withIdentity({
      email: "admin@test.com",
      name: "Admin User",
    });
    const result = await asAdmin.run(async (ctx) => {
      const { requireAdmin } = await import("./lib");
      return await requireAdmin(ctx);
    });
    expect(result.identity).toBeDefined();
    expect(result.admin).toBeDefined();
    expect(result.admin.email).toBe("admin@test.com");
  });
});

describe("requireAdminOrCrew", () => {
  it("succeeds with admin auth", async () => {
    const t = convexTest(schema);
    await t.run(async (ctx) => {
      await ctx.db.insert("adminProfiles", {
        email: "admin@test.com",
        displayName: "Admin User",
        role: "super_admin",
      });
    });
    // We need an event ID to call requireAdminOrCrew
    let eventId: any;
    await t.run(async (ctx) => {
      eventId = await ctx.db.insert("events", {
        slug: "test-event",
        name: "Test Event",
        isActive: true,
        crewToken: "crew-token-123",
        uploadConfig: {},
        displayConfig: {},
        primaryColor: "#000000",
        moderationEnabled: false,
        updatedAt: Date.now(),
      });
    });

    const asAdmin = t.withIdentity({
      email: "admin@test.com",
      name: "Admin User",
    });
    const result = await asAdmin.run(async (ctx) => {
      const { requireAdminOrCrew } = await import("./lib");
      return await requireAdminOrCrew(ctx, eventId);
    });
    expect(result.type).toBe("admin");
  });

  it("succeeds with crew token matching event", async () => {
    const t = convexTest(schema);
    let eventId: any;
    await t.run(async (ctx) => {
      eventId = await ctx.db.insert("events", {
        slug: "test-event",
        name: "Test Event",
        isActive: true,
        crewToken: "crew-token-123",
        uploadConfig: {},
        displayConfig: {},
        primaryColor: "#000000",
        moderationEnabled: false,
        updatedAt: Date.now(),
      });
    });
    const result = await t.run(async (ctx) => {
      const { requireAdminOrCrew } = await import("./lib");
      return await requireAdminOrCrew(ctx, eventId, "crew-token-123");
    });
    expect(result.type).toBe("crew");
  });

  it("throws with no auth and no crew token", async () => {
    const t = convexTest(schema);
    let eventId: any;
    await t.run(async (ctx) => {
      eventId = await ctx.db.insert("events", {
        slug: "test-event",
        name: "Test Event",
        isActive: true,
        crewToken: "crew-token-123",
        uploadConfig: {},
        displayConfig: {},
        primaryColor: "#000000",
        moderationEnabled: false,
        updatedAt: Date.now(),
      });
    });
    await expect(
      t.run(async (ctx) => {
        const { requireAdminOrCrew } = await import("./lib");
        return await requireAdminOrCrew(ctx, eventId);
      })
    ).rejects.toThrow("Not authorized");
  });

  it("throws with invalid crew token", async () => {
    const t = convexTest(schema);
    let eventId: any;
    await t.run(async (ctx) => {
      eventId = await ctx.db.insert("events", {
        slug: "test-event",
        name: "Test Event",
        isActive: true,
        crewToken: "crew-token-123",
        uploadConfig: {},
        displayConfig: {},
        primaryColor: "#000000",
        moderationEnabled: false,
        updatedAt: Date.now(),
      });
    });
    await expect(
      t.run(async (ctx) => {
        const { requireAdminOrCrew } = await import("./lib");
        return await requireAdminOrCrew(ctx, eventId, "wrong-token");
      })
    ).rejects.toThrow("Not authorized");
  });
});

describe("getEventBySlug", () => {
  it("returns event when slug matches", async () => {
    const t = convexTest(schema);
    await t.run(async (ctx) => {
      await ctx.db.insert("events", {
        slug: "my-event",
        name: "My Event",
        isActive: true,
        crewToken: "token-abc",
        uploadConfig: {},
        displayConfig: {},
        primaryColor: "#ff0000",
        moderationEnabled: false,
        updatedAt: Date.now(),
      });
    });
    const result = await t.run(async (ctx) => {
      const { getEventBySlug } = await import("./lib");
      return await getEventBySlug(ctx, "my-event");
    });
    expect(result).not.toBeNull();
    expect(result!.name).toBe("My Event");
    expect(result!.slug).toBe("my-event");
  });

  it("returns null when slug does not match", async () => {
    const t = convexTest(schema);
    const result = await t.run(async (ctx) => {
      const { getEventBySlug } = await import("./lib");
      return await getEventBySlug(ctx, "nonexistent");
    });
    expect(result).toBeNull();
  });
});
