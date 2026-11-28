import { describe, expect, it, onTestFinished, vi } from "vitest";
import installFakeClock from "./installFakeClock.js";

const realDate = globalThis.Date;
const realSetTimeout = globalThis.setTimeout;
const realSetInterval = globalThis.setInterval;

describe("installFakeClock", () => {
  it("fakes timeouts and the date, then restores them as the test ends", () => {
    onTestFinished(() => {
      expect(globalThis.Date).toBe(realDate);
      expect(globalThis.setTimeout).toBe(realSetTimeout);
    });
    installFakeClock();
    vi.setSystemTime(0);
    expect(Date.now()).toBe(0);
    expect(globalThis.setTimeout).not.toBe(realSetTimeout);
  });

  it("fakes only what it is told to", () => {
    installFakeClock(["setTimeout"]);
    expect(globalThis.setTimeout).not.toBe(realSetTimeout);
    expect(globalThis.Date).toBe(realDate);
  });

  it("fakes every timer a bare useFakeTimers does when told every", () => {
    installFakeClock("every");
    expect(globalThis.setInterval).not.toBe(realSetInterval);
    expect(globalThis.Date).not.toBe(realDate);
  });
});
