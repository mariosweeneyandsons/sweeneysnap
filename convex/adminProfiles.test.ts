import { describe, it, expect } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api } from "./_generated/api";

// Helper: seed an admin profile into the DB
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

describe("adminProfiles.getCurrentUserIdentity", () => {
  it("returns null when not authenticated", async () => {
    const t = convexTest(schema);
    const result = await t.query(api.adminProfiles.getCurrentUserIdentity, {});
    expect(result).toBeNull();
  });

  it("returns identity when authenticated", async () => {
    const t = convexTest(schema);
    const asUser = t.withIdentity({
      email: "user@test.com",
      name: "Test User",
    });
    const result = await asUser.query(
      api.adminProfiles.getCurrentUserIdentity,
      {}
    );
    expect(result).not.toBeNull();
    expect(result!.email).toBe("user@test.com");
    expect(result!.name).toBe("Test User");
  });
});

describe("adminProfiles.getByCurrentUser", () => {
  it("returns null when not authenticated", async () => {
    const t = convexTest(schema);
    const result = await t.query(api.adminProfiles.getByCurrentUser, {});
    expect(result).toBeNull();
  });

  it("returns null when authenticated but not an admin", async () => {
    const t = convexTest(schema);
    const asUser = t.withIdentity({
      email: "nobody@test.com",
      name: "Nobody",
    });
    const result = await asUser.query(api.adminProfiles.getByCurrentUser, {});
    expect(result).toBeNull();
  });

  it("returns admin profile when authenticated as admin", async () => {
    const t = convexTest(schema);
    await seedAdmin(t);
    const asAdmin = t.withIdentity({
      email: "admin@test.com",
      name: "Admin User",
    });
    const result = await asAdmin.query(api.adminProfiles.getByCurrentUser, {});
    expect(result).not.toBeNull();
    expect(result!.email).toBe("admin@test.com");
    expect(result!.role).toBe("super_admin");
  });
});

describe("adminProfiles.list", () => {
  it("throws when not authenticated", async () => {
    const t = convexTest(schema);
    await expect(
      t.query(api.adminProfiles.list, {})
    ).rejects.toThrow("Not authenticated");
  });

  it("throws when authenticated but not admin", async () => {
    const t = convexTest(schema);
    const asUser = t.withIdentity({
      email: "nobody@test.com",
      name: "Nobody",
    });
    await expect(
      asUser.query(api.adminProfiles.list, {})
    ).rejects.toThrow("Not authorized");
  });

  it("returns all admin profiles when called by admin", async () => {
    const t = convexTest(schema);
    await seedAdmin(t);
    await seedAdmin(t, "other@test.com", "Other Admin");
    const asAdmin = t.withIdentity({
      email: "admin@test.com",
      name: "Admin User",
    });
    const result = await asAdmin.query(api.adminProfiles.list, {});
    expect(result).toHaveLength(2);
  });
});

describe("adminProfiles.create", () => {
  it("creates a new admin profile", async () => {
    const t = convexTest(schema);
    await seedAdmin(t);
    const asAdmin = t.withIdentity({
      email: "admin@test.com",
      name: "Admin User",
    });
    const newId = await asAdmin.mutation(api.adminProfiles.create, {
      email: "new@test.com",
      displayName: "New Admin",
    });
    expect(newId).toBeDefined();

    // Verify it was created
    const all = await asAdmin.query(api.adminProfiles.list, {});
    const newAdmin = all.find((a: any) => a.email === "new@test.com");
    expect(newAdmin).toBeDefined();
    expect(newAdmin!.displayName).toBe("New Admin");
    expect(newAdmin!.role).toBe("super_admin");
  });

  it("throws when creating duplicate email", async () => {
    const t = convexTest(schema);
    await seedAdmin(t);
    const asAdmin = t.withIdentity({
      email: "admin@test.com",
      name: "Admin User",
    });
    await expect(
      asAdmin.mutation(api.adminProfiles.create, {
        email: "admin@test.com",
        displayName: "Duplicate",
      })
    ).rejects.toThrow("Admin profile already exists for this email");
  });
});

describe("adminProfiles.remove", () => {
  it("prevents self-removal", async () => {
    const t = convexTest(schema);
    await seedAdmin(t);
    const asAdmin = t.withIdentity({
      email: "admin@test.com",
      name: "Admin User",
    });
    // Get the admin's own ID
    const profile = await asAdmin.query(api.adminProfiles.getByCurrentUser, {});
    expect(profile).not.toBeNull();

    await expect(
      asAdmin.mutation(api.adminProfiles.remove, { id: profile!._id })
    ).rejects.toThrow("You cannot remove your own admin account");
  });

  it("removes another admin profile", async () => {
    const t = convexTest(schema);
    await seedAdmin(t);
    await seedAdmin(t, "other@test.com", "Other Admin");
    const asAdmin = t.withIdentity({
      email: "admin@test.com",
      name: "Admin User",
    });
    // Find the other admin
    const all = await asAdmin.query(api.adminProfiles.list, {});
    const other = all.find((a: any) => a.email === "other@test.com");
    expect(other).toBeDefined();

    await asAdmin.mutation(api.adminProfiles.remove, { id: other!._id });

    // Verify removal
    const remaining = await asAdmin.query(api.adminProfiles.list, {});
    expect(remaining).toHaveLength(1);
    expect(remaining[0].email).toBe("admin@test.com");
  });
});
