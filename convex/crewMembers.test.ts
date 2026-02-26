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

describe("crewMembers.listByEvent", () => {
  test("requires admin", async () => {
    const t = convexTest(schema);
    const { eventId } = await seedAdminAndEvent(t);
    await expect(
      t.query(api.crewMembers.listByEvent, { eventId: eventId as any })
    ).rejects.toThrow("Not authenticated");
  });

  test("returns crew members for event", async () => {
    const t = convexTest(schema);
    const { asAdmin, eventId } = await seedAdminAndEvent(t);
    await asAdmin.mutation(api.crewMembers.create, {
      eventId: eventId as any,
      name: "Camera Operator",
      permission: "moderator",
    });
    const members = await asAdmin.query(api.crewMembers.listByEvent, {
      eventId: eventId as any,
    });
    expect(members).toHaveLength(1);
    expect(members[0].name).toBe("Camera Operator");
  });
});

describe("crewMembers.getByToken", () => {
  test("returns member by token", async () => {
    const t = convexTest(schema);
    const { asAdmin, eventId } = await seedAdminAndEvent(t);
    const memberId = await asAdmin.mutation(api.crewMembers.create, {
      eventId: eventId as any,
      name: "Crew A",
      permission: "moderator",
    });
    // Get the token from the member
    const members = await asAdmin.query(api.crewMembers.listByEvent, {
      eventId: eventId as any,
    });
    const member = members.find((m) => m._id === memberId);
    expect(member).toBeDefined();

    const result = await t.query(api.crewMembers.getByToken, {
      token: member!.token,
    });
    expect(result).not.toBeNull();
    expect(result!._id).toBe(memberId);
    expect(result!.name).toBe("Crew A");
  });

  test("returns null for invalid token", async () => {
    const t = convexTest(schema);
    const result = await t.query(api.crewMembers.getByToken, {
      token: "nonexistent-token-abc",
    });
    expect(result).toBeNull();
  });
});

describe("crewMembers.create", () => {
  test("generates unique token", async () => {
    const t = convexTest(schema);
    const { asAdmin, eventId } = await seedAdminAndEvent(t);
    const memberId1 = await asAdmin.mutation(api.crewMembers.create, {
      eventId: eventId as any,
      name: "Crew A",
      permission: "moderator",
    });
    const memberId2 = await asAdmin.mutation(api.crewMembers.create, {
      eventId: eventId as any,
      name: "Crew B",
      permission: "viewer",
    });
    const members = await asAdmin.query(api.crewMembers.listByEvent, {
      eventId: eventId as any,
    });
    const m1 = members.find((m) => m._id === memberId1);
    const m2 = members.find((m) => m._id === memberId2);
    expect(m1!.token).toBeTruthy();
    expect(m2!.token).toBeTruthy();
    expect(m1!.token).not.toBe(m2!.token);
  });

  test("requires admin", async () => {
    const t = convexTest(schema);
    const { eventId } = await seedAdminAndEvent(t);
    await expect(
      t.mutation(api.crewMembers.create, {
        eventId: eventId as any,
        name: "Unauthorized Crew",
        permission: "moderator",
      })
    ).rejects.toThrow("Not authenticated");
  });
});

describe("crewMembers.update", () => {
  test("patches name and permission", async () => {
    const t = convexTest(schema);
    const { asAdmin, eventId } = await seedAdminAndEvent(t);
    const memberId = await asAdmin.mutation(api.crewMembers.create, {
      eventId: eventId as any,
      name: "Original Name",
      permission: "viewer",
    });
    await asAdmin.mutation(api.crewMembers.update, {
      id: memberId,
      name: "Updated Name",
      permission: "moderator",
    });
    const members = await asAdmin.query(api.crewMembers.listByEvent, {
      eventId: eventId as any,
    });
    const updated = members.find((m) => m._id === memberId);
    expect(updated!.name).toBe("Updated Name");
    expect(updated!.permission).toBe("moderator");
  });
});

describe("crewMembers.remove", () => {
  test("deletes member", async () => {
    const t = convexTest(schema);
    const { asAdmin, eventId } = await seedAdminAndEvent(t);
    const memberId = await asAdmin.mutation(api.crewMembers.create, {
      eventId: eventId as any,
      name: "To Delete",
      permission: "viewer",
    });
    await asAdmin.mutation(api.crewMembers.remove, { id: memberId });
    const members = await asAdmin.query(api.crewMembers.listByEvent, {
      eventId: eventId as any,
    });
    expect(members).toHaveLength(0);
  });
});

describe("crewMembers.regenerateToken", () => {
  test("generates new token different from old", async () => {
    const t = convexTest(schema);
    const { asAdmin, eventId } = await seedAdminAndEvent(t);
    const memberId = await asAdmin.mutation(api.crewMembers.create, {
      eventId: eventId as any,
      name: "Crew Token Test",
      permission: "moderator",
    });
    // Get original token
    const membersBefore = await asAdmin.query(api.crewMembers.listByEvent, {
      eventId: eventId as any,
    });
    const oldToken = membersBefore.find((m) => m._id === memberId)!.token;

    // Regenerate
    const newToken = await asAdmin.mutation(api.crewMembers.regenerateToken, {
      id: memberId,
    });
    expect(newToken).toBeTruthy();
    expect(typeof newToken).toBe("string");
    expect(newToken).not.toBe(oldToken);

    // Verify old token no longer works
    const byOld = await t.query(api.crewMembers.getByToken, {
      token: oldToken,
    });
    expect(byOld).toBeNull();

    // Verify new token works
    const byNew = await t.query(api.crewMembers.getByToken, {
      token: newToken,
    });
    expect(byNew).not.toBeNull();
    expect(byNew!._id).toBe(memberId);
  });
});
