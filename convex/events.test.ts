import { convexTest } from "convex-test";
import { expect, test, describe } from "vitest";
import schema from "./schema";
import { api } from "./_generated/api";

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

// --- Tests ---

describe("events.list", () => {
  test("requires admin identity", async () => {
    const t = convexTest(schema);
    await expect(
      t.query(api.events.list, {})
    ).rejects.toThrow("Not authenticated");
  });

  test("returns events for authenticated admin", async () => {
    const t = convexTest(schema);
    const { asAdmin } = await seedAdminAndEvent(t);
    const events = await asAdmin.query(api.events.list, {});
    expect(events).toHaveLength(1);
    expect(events[0].slug).toBe("test-event");
  });

  test("excludes archived events by default", async () => {
    const t = convexTest(schema);
    const { asAdmin, eventId } = await seedAdminAndEvent(t);
    await asAdmin.mutation(api.events.archive, { id: eventId });
    const events = await asAdmin.query(api.events.list, {});
    expect(events).toHaveLength(0);
  });

  test("includes archived events when flag is set", async () => {
    const t = convexTest(schema);
    const { asAdmin, eventId } = await seedAdminAndEvent(t);
    await asAdmin.mutation(api.events.archive, { id: eventId });
    const events = await asAdmin.query(api.events.list, {
      includeArchived: true,
    });
    expect(events).toHaveLength(1);
    expect(events[0].archived).toBe(true);
  });
});

describe("events.getById", () => {
  test("requires admin identity", async () => {
    const t = convexTest(schema);
    const { eventId } = await seedAdminAndEvent(t);
    // Unauthenticated user should be denied
    await expect(
      t.query(api.events.getById, { id: eventId })
    ).rejects.toThrow("Not authenticated");
  });

  test("returns event for admin", async () => {
    const t = convexTest(schema);
    const { asAdmin, eventId } = await seedAdminAndEvent(t);
    const event = await asAdmin.query(api.events.getById, { id: eventId });
    expect(event).not.toBeNull();
    expect(event!.slug).toBe("test-event");
  });
});

describe("events.getBySlug", () => {
  test("returns null for nonexistent slug", async () => {
    const t = convexTest(schema);
    const result = await t.query(api.events.getBySlug, {
      slug: "does-not-exist",
    });
    expect(result).toBeNull();
  });

  test("returns null for inactive event", async () => {
    const t = convexTest(schema);
    const { asAdmin } = await seedAdminAndEvent(t);
    // Create an inactive event
    await asAdmin.mutation(api.events.create, {
      slug: "inactive-event",
      name: "Inactive Event",
      isActive: false,
      uploadConfig: {},
      displayConfig: {},
      primaryColor: "#000000",
      moderationEnabled: false,
    });
    const result = await t.query(api.events.getBySlug, {
      slug: "inactive-event",
    });
    expect(result).toBeNull();
  });

  test("omits crewToken from result", async () => {
    const t = convexTest(schema);
    await seedAdminAndEvent(t);
    const result = await t.query(api.events.getBySlug, { slug: "test-event" });
    expect(result).not.toBeNull();
    expect(result).not.toHaveProperty("crewToken");
    expect(result!.slug).toBe("test-event");
  });
});

describe("events.getByCustomDomain", () => {
  test("returns null for nonexistent domain", async () => {
    const t = convexTest(schema);
    const result = await t.query(api.events.getByCustomDomain, {
      domain: "nope.example.com",
    });
    expect(result).toBeNull();
  });

  test("omits crewToken from result", async () => {
    const t = convexTest(schema);
    const { asAdmin } = await seedAdminAndEvent(t);
    await asAdmin.mutation(api.events.create, {
      slug: "domain-event",
      name: "Domain Event",
      isActive: true,
      uploadConfig: {},
      displayConfig: {},
      primaryColor: "#ffffff",
      moderationEnabled: false,
      customDomain: "photos.example.com",
    });
    const result = await t.query(api.events.getByCustomDomain, {
      domain: "photos.example.com",
    });
    expect(result).not.toBeNull();
    expect(result).not.toHaveProperty("crewToken");
  });
});

describe("events.create", () => {
  test("validates slug exceeding max length", async () => {
    const t = convexTest(schema);
    const asAdmin = t.withIdentity({ email: "admin@test.com", name: "Admin" });
    await t.run(async (ctx) => {
      await ctx.db.insert("adminProfiles", {
        email: "admin@test.com",
        displayName: "Admin",
        role: "super_admin",
      });
    });
    const longSlug = "a".repeat(101);
    await expect(
      asAdmin.mutation(api.events.create, {
        slug: longSlug,
        name: "Test",
        isActive: true,
        uploadConfig: {},
        displayConfig: {},
        primaryColor: "#ffffff",
        moderationEnabled: false,
      })
    ).rejects.toThrow("slug exceeds maximum length");
  });

  test("validates custom domain with spaces", async () => {
    const t = convexTest(schema);
    const { asAdmin } = await seedAdminAndEvent(t);
    await expect(
      asAdmin.mutation(api.events.create, {
        slug: "domain-test",
        name: "Domain Test",
        isActive: true,
        uploadConfig: {},
        displayConfig: {},
        primaryColor: "#ffffff",
        moderationEnabled: false,
        customDomain: "my domain.com",
      })
    ).rejects.toThrow("Custom domain cannot contain spaces");
  });

  test("validates custom domain with http prefix", async () => {
    const t = convexTest(schema);
    const { asAdmin } = await seedAdminAndEvent(t);
    await expect(
      asAdmin.mutation(api.events.create, {
        slug: "domain-test2",
        name: "Domain Test 2",
        isActive: true,
        uploadConfig: {},
        displayConfig: {},
        primaryColor: "#ffffff",
        moderationEnabled: false,
        customDomain: "http://example.com",
      })
    ).rejects.toThrow("Custom domain should not include http://");
  });

  test("generates a crewToken on creation", async () => {
    const t = convexTest(schema);
    const { asAdmin, eventId } = await seedAdminAndEvent(t);
    const event = await asAdmin.query(api.events.getById, { id: eventId });
    expect(event).not.toBeNull();
    expect(event!.crewToken).toBeTruthy();
    expect(typeof event!.crewToken).toBe("string");
    expect(event!.crewToken.length).toBeGreaterThan(0);
  });

  test("enforces custom domain uniqueness", async () => {
    const t = convexTest(schema);
    const { asAdmin } = await seedAdminAndEvent(t);
    await asAdmin.mutation(api.events.create, {
      slug: "first-domain",
      name: "First Domain",
      isActive: true,
      uploadConfig: {},
      displayConfig: {},
      primaryColor: "#ffffff",
      moderationEnabled: false,
      customDomain: "unique.example.com",
    });
    await expect(
      asAdmin.mutation(api.events.create, {
        slug: "second-domain",
        name: "Second Domain",
        isActive: true,
        uploadConfig: {},
        displayConfig: {},
        primaryColor: "#ffffff",
        moderationEnabled: false,
        customDomain: "unique.example.com",
      })
    ).rejects.toThrow("Custom domain already in use");
  });
});

describe("events.update", () => {
  test("updates event with valid data", async () => {
    const t = convexTest(schema);
    const { asAdmin, eventId } = await seedAdminAndEvent(t);
    await asAdmin.mutation(api.events.update, {
      id: eventId,
      slug: "updated-slug",
      name: "Updated Event",
      isActive: true,
      uploadConfig: {},
      displayConfig: {},
      primaryColor: "#000000",
      moderationEnabled: true,
    });
    const updated = await asAdmin.query(api.events.getById, { id: eventId });
    expect(updated!.slug).toBe("updated-slug");
    expect(updated!.name).toBe("Updated Event");
    expect(updated!.primaryColor).toBe("#000000");
    expect(updated!.moderationEnabled).toBe(true);
  });

  test("validates custom domain uniqueness but allows same event", async () => {
    const t = convexTest(schema);
    const { asAdmin, eventId } = await seedAdminAndEvent(t);
    // First set a domain on the existing event
    await asAdmin.mutation(api.events.update, {
      id: eventId,
      slug: "test-event",
      name: "Test Event",
      isActive: true,
      uploadConfig: {},
      displayConfig: {},
      primaryColor: "#ffffff",
      moderationEnabled: false,
      customDomain: "mydomain.com",
    });
    // Should be able to update same event with same domain (no error)
    await asAdmin.mutation(api.events.update, {
      id: eventId,
      slug: "test-event",
      name: "Test Event Renamed",
      isActive: true,
      uploadConfig: {},
      displayConfig: {},
      primaryColor: "#ffffff",
      moderationEnabled: false,
      customDomain: "mydomain.com",
    });
    const event = await asAdmin.query(api.events.getById, { id: eventId });
    expect(event!.name).toBe("Test Event Renamed");
    expect(event!.customDomain).toBe("mydomain.com");
  });
});

describe("events.duplicate", () => {
  test("creates copy with -copy suffix", async () => {
    const t = convexTest(schema);
    const { asAdmin, eventId } = await seedAdminAndEvent(t);
    const copyId = await asAdmin.mutation(api.events.duplicate, {
      id: eventId,
    });
    const copy = await asAdmin.query(api.events.getById, { id: copyId });
    expect(copy).not.toBeNull();
    expect(copy!.slug).toBe("test-event-copy");
    expect(copy!.name).toBe("Test Event (Copy)");
    expect(copy!.isActive).toBe(false);
  });

  test("appends counter when -copy slug already exists", async () => {
    const t = convexTest(schema);
    const { asAdmin, eventId } = await seedAdminAndEvent(t);
    // Create first copy
    await asAdmin.mutation(api.events.duplicate, { id: eventId });
    // Create second copy
    const copy2Id = await asAdmin.mutation(api.events.duplicate, {
      id: eventId,
    });
    const copy2 = await asAdmin.query(api.events.getById, { id: copy2Id });
    expect(copy2!.slug).toBe("test-event-copy-2");
  });
});

describe("events.archive", () => {
  test("toggles archived flag", async () => {
    const t = convexTest(schema);
    const { asAdmin, eventId } = await seedAdminAndEvent(t);
    const result1 = await asAdmin.mutation(api.events.archive, {
      id: eventId,
    });
    expect(result1.archived).toBe(true);
    const result2 = await asAdmin.mutation(api.events.archive, {
      id: eventId,
    });
    expect(result2.archived).toBe(false);
  });

  test("auto-deactivates when archiving", async () => {
    const t = convexTest(schema);
    const { asAdmin, eventId } = await seedAdminAndEvent(t);
    // Event starts active
    const before = await asAdmin.query(api.events.getById, { id: eventId });
    expect(before!.isActive).toBe(true);
    // Archive it
    await asAdmin.mutation(api.events.archive, { id: eventId });
    const after = await asAdmin.query(api.events.getById, { id: eventId });
    expect(after!.archived).toBe(true);
    expect(after!.isActive).toBe(false);
  });
});

describe("events.updateSortOrders", () => {
  test("updates sort orders for multiple events", async () => {
    const t = convexTest(schema);
    const { asAdmin, eventId } = await seedAdminAndEvent(t);
    const eventId2 = await asAdmin.mutation(api.events.create, {
      slug: "second-event",
      name: "Second Event",
      isActive: true,
      uploadConfig: {},
      displayConfig: {},
      primaryColor: "#ffffff",
      moderationEnabled: false,
    });
    await asAdmin.mutation(api.events.updateSortOrders, {
      items: [
        { id: eventId, sortOrder: 2 },
        { id: eventId2, sortOrder: 1 },
      ],
    });
    const e1 = await asAdmin.query(api.events.getById, { id: eventId });
    const e2 = await asAdmin.query(api.events.getById, { id: eventId2 });
    expect(e1!.sortOrder).toBe(2);
    expect(e2!.sortOrder).toBe(1);
  });
});

describe("events.addAsset", () => {
  test("appends asset to assets array", async () => {
    const t = convexTest(schema);
    const { asAdmin, eventId } = await seedAdminAndEvent(t);
    await asAdmin.mutation(api.events.addAsset, {
      id: eventId,
      asset: {
        url: "https://example.com/logo.png",
        type: "logo",
        name: "Test Logo",
      },
    });
    const event = await asAdmin.query(api.events.getById, { id: eventId });
    expect(event!.assets).toHaveLength(1);
    expect(event!.assets![0].name).toBe("Test Logo");
    expect(event!.assets![0].type).toBe("logo");
  });
});

describe("events.removeAsset", () => {
  test("removes asset by index", async () => {
    const t = convexTest(schema);
    const { asAdmin, eventId } = await seedAdminAndEvent(t);
    await asAdmin.mutation(api.events.addAsset, {
      id: eventId,
      asset: { url: "https://example.com/a.png", type: "logo", name: "A" },
    });
    await asAdmin.mutation(api.events.addAsset, {
      id: eventId,
      asset: {
        url: "https://example.com/b.png",
        type: "background",
        name: "B",
      },
    });
    // Remove first asset
    await asAdmin.mutation(api.events.removeAsset, {
      id: eventId,
      assetIndex: 0,
    });
    const event = await asAdmin.query(api.events.getById, { id: eventId });
    expect(event!.assets).toHaveLength(1);
    expect(event!.assets![0].name).toBe("B");
  });

  test("throws on invalid asset index", async () => {
    const t = convexTest(schema);
    const { asAdmin, eventId } = await seedAdminAndEvent(t);
    await expect(
      asAdmin.mutation(api.events.removeAsset, {
        id: eventId,
        assetIndex: 5,
      })
    ).rejects.toThrow("Invalid asset index");
  });
});
