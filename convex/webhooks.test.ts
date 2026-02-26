import { convexTest } from "convex-test";
import { expect, test, describe } from "vitest";
import schema from "./schema";
import { api, internal } from "./_generated/api";

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

describe("webhooks.listByEvent", () => {
  test("requires admin", async () => {
    const t = convexTest(schema);
    const { eventId } = await seedAdminAndEvent(t);
    await expect(
      t.query(api.webhooks.listByEvent, { eventId: eventId as any })
    ).rejects.toThrow("Not authenticated");
  });

  test("returns webhooks for event", async () => {
    const t = convexTest(schema);
    const { asAdmin, eventId } = await seedAdminAndEvent(t);
    await asAdmin.mutation(api.webhooks.create, {
      eventId: eventId as any,
      url: "https://example.com/hook",
      triggers: ["selfie.created"],
    });
    const webhooks = await asAdmin.query(api.webhooks.listByEvent, {
      eventId: eventId as any,
    });
    expect(webhooks).toHaveLength(1);
    expect(webhooks[0].url).toBe("https://example.com/hook");
  });
});

describe("webhooks.create", () => {
  test("generates a secret", async () => {
    const t = convexTest(schema);
    const { asAdmin, eventId } = await seedAdminAndEvent(t);
    const webhookId = await asAdmin.mutation(api.webhooks.create, {
      eventId: eventId as any,
      url: "https://example.com/hook",
      triggers: ["selfie.created"],
    });
    const webhooks = await asAdmin.query(api.webhooks.listByEvent, {
      eventId: eventId as any,
    });
    const webhook = webhooks.find((w) => w._id === webhookId);
    expect(webhook).toBeDefined();
    expect(webhook!.secret).toBeTruthy();
    expect(typeof webhook!.secret).toBe("string");
    expect(webhook!.secret.length).toBeGreaterThan(0);
  });

  test("sets isActive to true by default", async () => {
    const t = convexTest(schema);
    const { asAdmin, eventId } = await seedAdminAndEvent(t);
    const webhookId = await asAdmin.mutation(api.webhooks.create, {
      eventId: eventId as any,
      url: "https://example.com/hook",
      triggers: ["selfie.approved"],
    });
    const webhooks = await asAdmin.query(api.webhooks.listByEvent, {
      eventId: eventId as any,
    });
    const webhook = webhooks.find((w) => w._id === webhookId);
    expect(webhook!.isActive).toBe(true);
  });
});

describe("webhooks.update", () => {
  test("patches fields", async () => {
    const t = convexTest(schema);
    const { asAdmin, eventId } = await seedAdminAndEvent(t);
    const webhookId = await asAdmin.mutation(api.webhooks.create, {
      eventId: eventId as any,
      url: "https://example.com/hook",
      triggers: ["selfie.created"],
    });
    await asAdmin.mutation(api.webhooks.update, {
      id: webhookId,
      url: "https://example.com/hook-v2",
      isActive: false,
    });
    const webhooks = await asAdmin.query(api.webhooks.listByEvent, {
      eventId: eventId as any,
    });
    const webhook = webhooks.find((w) => w._id === webhookId);
    expect(webhook!.url).toBe("https://example.com/hook-v2");
    expect(webhook!.isActive).toBe(false);
  });
});

describe("webhooks.remove", () => {
  test("deletes webhook", async () => {
    const t = convexTest(schema);
    const { asAdmin, eventId } = await seedAdminAndEvent(t);
    const webhookId = await asAdmin.mutation(api.webhooks.create, {
      eventId: eventId as any,
      url: "https://example.com/hook",
      triggers: ["selfie.created"],
    });
    await asAdmin.mutation(api.webhooks.remove, { id: webhookId });
    const webhooks = await asAdmin.query(api.webhooks.listByEvent, {
      eventId: eventId as any,
    });
    expect(webhooks).toHaveLength(0);
  });
});

describe("webhooks.getWebhooksForTrigger", () => {
  test("returns only active webhooks matching trigger", async () => {
    const t = convexTest(schema);
    const { asAdmin, eventId } = await seedAdminAndEvent(t);
    // Create active webhook with selfie.created trigger
    await asAdmin.mutation(api.webhooks.create, {
      eventId: eventId as any,
      url: "https://example.com/hook1",
      triggers: ["selfie.created"],
    });
    // Create active webhook with selfie.approved trigger
    await asAdmin.mutation(api.webhooks.create, {
      eventId: eventId as any,
      url: "https://example.com/hook2",
      triggers: ["selfie.approved"],
    });
    // Create inactive webhook with selfie.created trigger
    const inactiveId = await asAdmin.mutation(api.webhooks.create, {
      eventId: eventId as any,
      url: "https://example.com/hook3",
      triggers: ["selfie.created"],
    });
    await asAdmin.mutation(api.webhooks.update, {
      id: inactiveId,
      isActive: false,
    });

    // Internal query: get webhooks for selfie.created trigger
    const result = await t.query(
      internal.webhooks.getWebhooksForTrigger,
      {
        eventId: eventId as any,
        trigger: "selfie.created",
      }
    );
    expect(result).toHaveLength(1);
    expect(result[0].url).toBe("https://example.com/hook1");
  });

  test("returns empty when no matching triggers", async () => {
    const t = convexTest(schema);
    const { asAdmin, eventId } = await seedAdminAndEvent(t);
    await asAdmin.mutation(api.webhooks.create, {
      eventId: eventId as any,
      url: "https://example.com/hook",
      triggers: ["selfie.created"],
    });

    const result = await t.query(
      internal.webhooks.getWebhooksForTrigger,
      {
        eventId: eventId as any,
        trigger: "selfie.rejected",
      }
    );
    expect(result).toHaveLength(0);
  });
});
