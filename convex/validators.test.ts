import { describe, it, expect } from "vitest";
import {
  uploadConfigValidator,
  displayConfigValidator,
  brandAssetValidator,
  crewPermissionValidator,
  crewActionValidator,
  selfieStatusValidator,
  webhookTriggerValidator,
} from "./validators";

describe("validators", () => {
  it("uploadConfigValidator is defined and is a Convex validator", () => {
    expect(uploadConfigValidator).toBeDefined();
    expect(uploadConfigValidator.kind).toBe("object");
  });

  it("displayConfigValidator is defined and is a Convex validator", () => {
    expect(displayConfigValidator).toBeDefined();
    expect(displayConfigValidator.kind).toBe("object");
  });

  it("brandAssetValidator is defined and is a Convex validator", () => {
    expect(brandAssetValidator).toBeDefined();
    expect(brandAssetValidator.kind).toBe("object");
  });

  it("crewPermissionValidator is defined and is a Convex validator", () => {
    expect(crewPermissionValidator).toBeDefined();
    expect(crewPermissionValidator.kind).toBe("union");
  });

  it("crewActionValidator is defined and is a Convex validator", () => {
    expect(crewActionValidator).toBeDefined();
    expect(crewActionValidator.kind).toBe("union");
  });

  it("selfieStatusValidator is defined and is a Convex validator", () => {
    expect(selfieStatusValidator).toBeDefined();
    expect(selfieStatusValidator.kind).toBe("union");
  });

  it("webhookTriggerValidator is defined and is a Convex validator", () => {
    expect(webhookTriggerValidator).toBeDefined();
    expect(webhookTriggerValidator.kind).toBe("union");
  });

  it("all validators have a type property", () => {
    const validators = [
      uploadConfigValidator,
      displayConfigValidator,
      brandAssetValidator,
      crewPermissionValidator,
      crewActionValidator,
      selfieStatusValidator,
      webhookTriggerValidator,
    ];
    for (const v of validators) {
      expect(v).toHaveProperty("type");
    }
  });
});
