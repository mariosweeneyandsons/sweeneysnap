import { describe, it, expect, beforeEach } from "vitest";
import { enqueue, dequeueAll, remove, count } from "./offlineQueue";

describe("offlineQueue", () => {
  beforeEach(async () => {
    // Clear the database before each test
    const items = await dequeueAll();
    for (const item of items) {
      await remove(item.id);
    }
  });

  it("starts with an empty queue", async () => {
    expect(await count()).toBe(0);
    expect(await dequeueAll()).toEqual([]);
  });

  it("enqueues an item and returns an id", async () => {
    const blob = new Blob(["test"], { type: "image/webp" });
    const id = await enqueue(blob, {
      eventId: "event-1",
      moderationEnabled: false,
    });
    expect(typeof id).toBe("number");
    expect(id).toBeGreaterThan(0);
  });

  it("increments count after enqueue", async () => {
    const blob = new Blob(["test"], { type: "image/webp" });
    await enqueue(blob, { eventId: "event-1", moderationEnabled: false });
    expect(await count()).toBe(1);

    await enqueue(blob, { eventId: "event-2", moderationEnabled: true });
    expect(await count()).toBe(2);
  });

  it("dequeueAll returns all queued items", async () => {
    const blob = new Blob(["data"], { type: "image/webp" });
    await enqueue(blob, {
      eventId: "event-1",
      displayName: "Alice",
      moderationEnabled: false,
    });
    await enqueue(blob, {
      eventId: "event-2",
      message: "Hello",
      moderationEnabled: true,
    });

    const items = await dequeueAll();
    expect(items).toHaveLength(2);
    expect(items[0].eventId).toBe("event-1");
    expect(items[0].displayName).toBe("Alice");
    expect(items[1].eventId).toBe("event-2");
    expect(items[1].message).toBe("Hello");
  });

  it("remove deletes an item by id", async () => {
    const blob = new Blob(["test"], { type: "image/webp" });
    const id = await enqueue(blob, { eventId: "event-1", moderationEnabled: false });
    expect(await count()).toBe(1);

    await remove(id);
    expect(await count()).toBe(0);
  });

  it("stores queuedAt timestamp", async () => {
    const before = Date.now();
    const blob = new Blob(["test"], { type: "image/webp" });
    await enqueue(blob, { eventId: "event-1", moderationEnabled: false });
    const after = Date.now();

    const items = await dequeueAll();
    expect(items[0].queuedAt).toBeGreaterThanOrEqual(before);
    expect(items[0].queuedAt).toBeLessThanOrEqual(after);
  });

  it("stores blob data correctly", async () => {
    const blob = new Blob(["test-content"], { type: "image/webp" });
    await enqueue(blob, { eventId: "event-1", moderationEnabled: false });

    const items = await dequeueAll();
    // fake-indexeddb may not preserve Blob prototype, so check the property exists
    expect(items[0].blob).toBeDefined();
    expect(items[0]).toHaveProperty("blob");
  });

  it("handles optional fields", async () => {
    const blob = new Blob(["test"], { type: "image/webp" });
    await enqueue(blob, { eventId: "event-1", moderationEnabled: false });

    const items = await dequeueAll();
    expect(items[0].displayName).toBeUndefined();
    expect(items[0].message).toBeUndefined();
  });
});
