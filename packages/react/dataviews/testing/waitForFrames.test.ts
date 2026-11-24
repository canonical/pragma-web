import { describe, expect, it, onTestFinished, vi } from "vitest";
import waitForFrames from "./waitForFrames.js";

describe("waitForFrames", () => {
  it("returns the value as soon as it is there", async () => {
    await expect(waitForFrames(() => "ready", "a value")).resolves.toBe(
      "ready",
    );
  });

  it("waits frames until the value comes", async () => {
    let frames = 0;
    const read = () => {
      frames += 1;
      return frames > 2 ? frames : null;
    };
    await expect(waitForFrames(read, "a count")).resolves.toBe(3);
  });

  it("advances a faked clock frame by frame", async () => {
    vi.useFakeTimers();
    onTestFinished(() => {
      vi.useRealTimers();
    });
    let frames = 0;
    requestAnimationFrame(() => {
      frames += 1;
    });
    await expect(
      waitForFrames(() => (frames > 0 ? frames : null), "a frame"),
    ).resolves.toBe(1);
  });

  it("fails, naming what it awaited, when the value never comes", async () => {
    await expect(waitForFrames(() => undefined, "nothing")).rejects.toThrow(
      "expected nothing within 60 frames",
    );
  });
});
