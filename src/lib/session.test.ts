import { describe, it, expect, beforeEach } from "vitest";
import { getSessionId } from "./session";

describe("getSessionId", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("returns a non-empty string", () => {
    const id = getSessionId();
    expect(id).toBeTruthy();
    expect(typeof id).toBe("string");
  });

  it("returns the same ID on subsequent calls", () => {
    const id1 = getSessionId();
    const id2 = getSessionId();
    expect(id1).toBe(id2);
  });

  it("stores the ID in sessionStorage", () => {
    const id = getSessionId();
    expect(sessionStorage.getItem("selfie_session_id")).toBe(id);
  });

  it("returns existing ID from sessionStorage", () => {
    sessionStorage.setItem("selfie_session_id", "test-id-123");
    expect(getSessionId()).toBe("test-id-123");
  });

  it("generates a UUID-like format", () => {
    const id = getSessionId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
  });
});
