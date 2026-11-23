import { describe, expect, it, vi } from "vitest";
import fakeAnnouncerClock from "./fakeAnnouncerClock.js";

describe("fakeAnnouncerClock", () => {
  it("fakes the timeouts, and only them, while the test runs", () => {
    const realInterval = globalThis.setInterval;
    fakeAnnouncerClock();
    expect(vi.isFakeTimers()).toBe(true);
    const fired = vi.fn();
    setTimeout(fired, 1000);
    vi.advanceTimersByTime(1000);
    expect(fired).toHaveBeenCalledTimes(1);
    expect(globalThis.setInterval).toBe(realInterval);
  });

  it("gives the real clock back once the test finishes", () => {
    expect(vi.isFakeTimers()).toBe(false);
  });
});
