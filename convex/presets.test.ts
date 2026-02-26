import { describe, it, expect } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api } from "./_generated/api";

const uploadConfig = {
  maxFileSizeMb: 10,
  allowGallery: false,
  requireName: true,
};

const displayConfig = {
  gridColumns: 3,
  swapInterval: 5,
  transition: "fade" as const,
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

function presetData(overrides?: Record<string, unknown>) {
  return {
    name: "Test Preset",
    uploadConfig,
    displayConfig,
    primaryColor: "#ff0000",
    fontFamily: "Inter",
    ...overrides,
  };
}

describe("presets", () => {
  describe("list", () => {
    it("requires admin authentication", async () => {
      const t = convexTest(schema);
      await expect(t.query(api.presets.list, {})).rejects.toThrow(
        "Not authenticated"
      );
    });

    it("rejects authenticated user without admin profile", async () => {
      const t = convexTest(schema);
      const asUser = t.withIdentity({
        email: "user@test.com",
        name: "Regular User",
      });
      await expect(asUser.query(api.presets.list, {})).rejects.toThrow(
        "Not authorized"
      );
    });

    it("returns presets in descending order", async () => {
      const t = convexTest(schema);
      const asAdmin = await setupAdmin(t);

      await asAdmin.mutation(api.presets.create, presetData({ name: "Alpha" }));
      await asAdmin.mutation(
        api.presets.create,
        presetData({ name: "Bravo" })
      );
      await asAdmin.mutation(
        api.presets.create,
        presetData({ name: "Charlie" })
      );

      const result = await asAdmin.query(api.presets.list, {});
      expect(result).toHaveLength(3);
      // desc order by _creationTime means latest first
      expect(result[0].name).toBe("Charlie");
      expect(result[2].name).toBe("Alpha");
    });
  });

  describe("listByName", () => {
    it("returns presets sorted alphabetically by name", async () => {
      const t = convexTest(schema);
      const asAdmin = await setupAdmin(t);

      await asAdmin.mutation(
        api.presets.create,
        presetData({ name: "Charlie" })
      );
      await asAdmin.mutation(api.presets.create, presetData({ name: "Alpha" }));
      await asAdmin.mutation(
        api.presets.create,
        presetData({ name: "Bravo" })
      );

      const result = await asAdmin.query(api.presets.listByName, {});
      expect(result).toHaveLength(3);
      expect(result[0].name).toBe("Alpha");
      expect(result[1].name).toBe("Bravo");
      expect(result[2].name).toBe("Charlie");
    });
  });

  describe("getById", () => {
    it("returns a preset by id", async () => {
      const t = convexTest(schema);
      const asAdmin = await setupAdmin(t);

      const id = await asAdmin.mutation(
        api.presets.create,
        presetData({ name: "My Preset" })
      );

      const result = await asAdmin.query(api.presets.getById, { id });
      expect(result).not.toBeNull();
      expect(result!.name).toBe("My Preset");
      expect(result!.primaryColor).toBe("#ff0000");
    });

    it("returns null for nonexistent id", async () => {
      const t = convexTest(schema);
      const asAdmin = await setupAdmin(t);

      // Create then delete to get a valid-format but nonexistent ID
      const id = await asAdmin.mutation(
        api.presets.create,
        presetData({ name: "Temp" })
      );
      await asAdmin.mutation(api.presets.remove, { id });

      const result = await asAdmin.query(api.presets.getById, { id });
      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("inserts a preset with assets=[] and updatedAt", async () => {
      const t = convexTest(schema);
      const asAdmin = await setupAdmin(t);

      const id = await asAdmin.mutation(api.presets.create, presetData());

      const preset = await asAdmin.query(api.presets.getById, { id });
      expect(preset).not.toBeNull();
      expect(preset!.assets).toEqual([]);
      expect(preset!.updatedAt).toBeTypeOf("number");
      expect(preset!.updatedAt).toBeGreaterThan(0);
    });

    it("stores all provided fields", async () => {
      const t = convexTest(schema);
      const asAdmin = await setupAdmin(t);

      const id = await asAdmin.mutation(
        api.presets.create,
        presetData({
          name: "Full Preset",
          logoUrl: "https://example.com/logo.png",
          customCss: ".test { color: red; }",
        })
      );

      const preset = await asAdmin.query(api.presets.getById, { id });
      expect(preset!.name).toBe("Full Preset");
      expect(preset!.logoUrl).toBe("https://example.com/logo.png");
      expect(preset!.customCss).toBe(".test { color: red; }");
      expect(preset!.fontFamily).toBe("Inter");
    });
  });

  describe("update", () => {
    it("patches preset fields and updates updatedAt", async () => {
      const t = convexTest(schema);
      const asAdmin = await setupAdmin(t);

      const id = await asAdmin.mutation(api.presets.create, presetData());
      const original = await asAdmin.query(api.presets.getById, { id });

      await asAdmin.mutation(api.presets.update, {
        id,
        ...presetData({ name: "Updated Preset", primaryColor: "#00ff00" }),
      });

      const updated = await asAdmin.query(api.presets.getById, { id });
      expect(updated!.name).toBe("Updated Preset");
      expect(updated!.primaryColor).toBe("#00ff00");
      expect(updated!.updatedAt).toBeGreaterThanOrEqual(original!.updatedAt);
    });
  });

  describe("remove", () => {
    it("deletes a preset", async () => {
      const t = convexTest(schema);
      const asAdmin = await setupAdmin(t);

      const id = await asAdmin.mutation(api.presets.create, presetData());
      const before = await asAdmin.query(api.presets.list, {});
      expect(before).toHaveLength(1);

      await asAdmin.mutation(api.presets.remove, { id });

      const after = await asAdmin.query(api.presets.list, {});
      expect(after).toHaveLength(0);
    });
  });
});
