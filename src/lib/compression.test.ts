import { describe, it, expect, vi } from "vitest";

// Mock browser-image-compression before importing the module
vi.mock("browser-image-compression", () => ({
  default: vi.fn(async (file: File) => {
    // Return a smaller mock file
    return new File(["compressed"], file.name, { type: "image/webp" });
  }),
}));

import { compressImage } from "./compression";
import imageCompression from "browser-image-compression";

describe("compressImage", () => {
  it("returns a File object", async () => {
    const file = new File(["test-image-data"], "photo.jpg", { type: "image/jpeg" });
    const result = await compressImage(file);
    expect(result).toBeInstanceOf(File);
  });

  it("calls imageCompression with default options", async () => {
    const file = new File(["test"], "photo.jpg", { type: "image/jpeg" });
    await compressImage(file);

    expect(imageCompression).toHaveBeenCalledWith(file, {
      maxSizeMB: 0.2,
      maxWidthOrHeight: 1080,
      useWebWorker: true,
      fileType: "image/webp",
    });
  });

  it("uses custom maxSizeMB when provided", async () => {
    const file = new File(["test"], "photo.jpg", { type: "image/jpeg" });
    await compressImage(file, { maxSizeMB: 0.5 });

    expect(imageCompression).toHaveBeenCalledWith(file, {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1080,
      useWebWorker: true,
      fileType: "image/webp",
    });
  });

  it("always sets maxWidthOrHeight to 1080", async () => {
    const file = new File(["test"], "photo.jpg", { type: "image/jpeg" });
    await compressImage(file);

    expect(imageCompression).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ maxWidthOrHeight: 1080 })
    );
  });

  it("always outputs webp format", async () => {
    const file = new File(["test"], "photo.png", { type: "image/png" });
    await compressImage(file);

    expect(imageCompression).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ fileType: "image/webp" })
    );
  });

  it("enables web workers", async () => {
    const file = new File(["test"], "photo.jpg", { type: "image/jpeg" });
    await compressImage(file);

    expect(imageCompression).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ useWebWorker: true })
    );
  });

  it("defaults maxSizeMB to 0.2 when no options provided", async () => {
    const file = new File(["test"], "photo.jpg", { type: "image/jpeg" });
    await compressImage(file, {});

    expect(imageCompression).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ maxSizeMB: 0.2 })
    );
  });
});
