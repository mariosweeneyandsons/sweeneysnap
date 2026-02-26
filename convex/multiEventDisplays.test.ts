import { describe, it, expect } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const displayConfig = {
  gridColumns: 3,
  swapInterval: 5,
  transition: "fade" as const,
};

const uploadConfig = {
  maxFileSizeMb: 10,
  allowGallery: false,
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

async function setupEvents(t: ReturnType<typeof convexTest>) {
  let eventIds: Id<"events">[] = [];
  await t.run(async (ctx) => {
    const id1 = await ctx.db.insert("events", {
      slug: "event-1",
      name: "Event One",
      isActive: true,
      crewToken: "crew-token-1",
      uploadConfig,
      displayConfig,
      primaryColor: "#ff0000",
      moderationEnabled: false,
      updatedAt: Date.now(),
    });
    const id2 = await ctx.db.insert("events", {
      slug: "event-2",
      name: "Event Two",
      isActive: true,
      crewToken: "crew-token-2",
      uploadConfig,
      displayConfig,
      primaryColor: "#00ff00",
      moderationEnabled: false,
      updatedAt: Date.now(),
    });
    eventIds = [id1, id2];
  });
  return eventIds;
}

function displayData(
  eventIds: Id<"events">[],
  overrides?: Record<string, unknown>
) {
  return {
    name: "Test Multi Display",
    eventIds,
    slug: "test-display",
    displayConfig,
    ...overrides,
  };
}

describe("multiEventDisplays", () => {
  describe("create", () => {
    it("requires admin authentication", async () => {
      const t = convexTest(schema);
      const eventIds = await setupEvents(t);

      await expect(
        t.mutation(api.multiEventDisplays.create, displayData(eventIds))
      ).rejects.toThrow("Not authenticated");
    });

    it("creates a multi-event display with updatedAt", async () => {
      const t = convexTest(schema);
      const asAdmin = await setupAdmin(t);
      const eventIds = await setupEvents(t);

      const id = await asAdmin.mutation(
        api.multiEventDisplays.create,
        displayData(eventIds)
      );

      let display: Record<string, unknown> | null = null;
      await t.run(async (ctx) => {
        display = await ctx.db.get(id);
      });
      expect(display).not.toBeNull();
      expect((display as any).name).toBe("Test Multi Display");
      expect((display as any).slug).toBe("test-display");
      expect((display as any).updatedAt).toBeTypeOf("number");
    });

    it("throws for duplicate slug", async () => {
      const t = convexTest(schema);
      const asAdmin = await setupAdmin(t);
      const eventIds = await setupEvents(t);

      await asAdmin.mutation(
        api.multiEventDisplays.create,
        displayData(eventIds, { slug: "unique-slug" })
      );

      await expect(
        asAdmin.mutation(
          api.multiEventDisplays.create,
          displayData(eventIds, { slug: "unique-slug", name: "Another" })
        )
      ).rejects.toThrow("Slug already in use");
    });

    it("validates slug uniqueness (different slugs succeed)", async () => {
      const t = convexTest(schema);
      const asAdmin = await setupAdmin(t);
      const eventIds = await setupEvents(t);

      await asAdmin.mutation(
        api.multiEventDisplays.create,
        displayData(eventIds, { slug: "slug-one" })
      );

      const id2 = await asAdmin.mutation(
        api.multiEventDisplays.create,
        displayData(eventIds, { slug: "slug-two", name: "Second Display" })
      );

      expect(id2).toBeDefined();
    });
  });

  describe("update", () => {
    it("patches display fields and updates updatedAt", async () => {
      const t = convexTest(schema);
      const asAdmin = await setupAdmin(t);
      const eventIds = await setupEvents(t);

      const id = await asAdmin.mutation(
        api.multiEventDisplays.create,
        displayData(eventIds)
      );

      await asAdmin.mutation(api.multiEventDisplays.update, {
        id,
        name: "Updated Display Name",
        showEventBadges: true,
      });

      let display: Record<string, unknown> | null = null;
      await t.run(async (ctx) => {
        display = await ctx.db.get(id);
      });
      expect((display as any).name).toBe("Updated Display Name");
      expect((display as any).showEventBadges).toBe(true);
    });

    it("requires admin authentication", async () => {
      const t = convexTest(schema);
      const asAdmin = await setupAdmin(t);
      const eventIds = await setupEvents(t);

      const id = await asAdmin.mutation(
        api.multiEventDisplays.create,
        displayData(eventIds)
      );

      await expect(
        t.mutation(api.multiEventDisplays.update, {
          id,
          name: "Hack attempt",
        })
      ).rejects.toThrow("Not authenticated");
    });
  });

  describe("list", () => {
    it("returns all displays in descending order", async () => {
      const t = convexTest(schema);
      const asAdmin = await setupAdmin(t);
      const eventIds = await setupEvents(t);

      await asAdmin.mutation(
        api.multiEventDisplays.create,
        displayData(eventIds, { slug: "first", name: "First" })
      );
      await asAdmin.mutation(
        api.multiEventDisplays.create,
        displayData(eventIds, { slug: "second", name: "Second" })
      );

      const result = await asAdmin.query(api.multiEventDisplays.list, {});
      expect(result).toHaveLength(2);
      // desc order: newest first
      expect(result[0].name).toBe("Second");
      expect(result[1].name).toBe("First");
    });

    it("requires admin authentication", async () => {
      const t = convexTest(schema);
      await expect(
        t.query(api.multiEventDisplays.list, {})
      ).rejects.toThrow("Not authenticated");
    });
  });

  describe("getBySlug", () => {
    it("returns display by slug", async () => {
      const t = convexTest(schema);
      const asAdmin = await setupAdmin(t);
      const eventIds = await setupEvents(t);

      await asAdmin.mutation(
        api.multiEventDisplays.create,
        displayData(eventIds, { slug: "my-display" })
      );

      // getBySlug is a public query (no admin required)
      const result = await t.query(api.multiEventDisplays.getBySlug, {
        slug: "my-display",
      });
      expect(result).not.toBeNull();
      expect(result!.slug).toBe("my-display");
      expect(result!.name).toBe("Test Multi Display");
    });

    it("returns null for nonexistent slug", async () => {
      const t = convexTest(schema);

      const result = await t.query(api.multiEventDisplays.getBySlug, {
        slug: "does-not-exist",
      });
      expect(result).toBeNull();
    });
  });

  describe("remove", () => {
    it("deletes a display", async () => {
      const t = convexTest(schema);
      const asAdmin = await setupAdmin(t);
      const eventIds = await setupEvents(t);

      const id = await asAdmin.mutation(
        api.multiEventDisplays.create,
        displayData(eventIds)
      );

      const before = await asAdmin.query(api.multiEventDisplays.list, {});
      expect(before).toHaveLength(1);

      await asAdmin.mutation(api.multiEventDisplays.remove, { id });

      const after = await asAdmin.query(api.multiEventDisplays.list, {});
      expect(after).toHaveLength(0);
    });

    it("requires admin authentication", async () => {
      const t = convexTest(schema);
      const asAdmin = await setupAdmin(t);
      const eventIds = await setupEvents(t);

      const id = await asAdmin.mutation(
        api.multiEventDisplays.create,
        displayData(eventIds)
      );

      await expect(
        t.mutation(api.multiEventDisplays.remove, { id })
      ).rejects.toThrow("Not authenticated");
    });
  });
});
