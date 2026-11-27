import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ChainingManager } from "./ChainingManager.js";

describe("ChainingManager", () => {
  let chainingManager: ChainingManager;
  const CHAINING_THRESHOLD = 1000;

  beforeEach(() => {
    vi.useFakeTimers();
    chainingManager = new ChainingManager(CHAINING_THRESHOLD);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initializes with chaining disabled", () => {
    expect(chainingManager.chaining).toBe(false);
  });

  it("keeps chaining active while a tooltip is registered", () => {
    const release = chainingManager.acquire();
    expect(chainingManager.chaining).toBe(true);

    vi.advanceTimersByTime(CHAINING_THRESHOLD * 3);
    expect(chainingManager.chaining).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
    release();
  });

  it("expires exactly one threshold after the last tooltip closes", () => {
    const releaseFirst = chainingManager.acquire();
    const releaseSecond = chainingManager.acquire();

    releaseSecond();
    vi.advanceTimersByTime(CHAINING_THRESHOLD * 2);
    expect(chainingManager.chaining).toBe(true);
    expect(vi.getTimerCount()).toBe(0);

    releaseFirst();
    vi.advanceTimersByTime(CHAINING_THRESHOLD - 1);
    expect(chainingManager.chaining).toBe(true);
    vi.advanceTimersByTime(1);
    expect(chainingManager.chaining).toBe(false);
  });

  it("cancels cooldown on acquisition and restarts it on release", () => {
    chainingManager.acquire()();
    vi.advanceTimersByTime(CHAINING_THRESHOLD / 2);

    const release = chainingManager.acquire();
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(CHAINING_THRESHOLD * 2);
    expect(chainingManager.chaining).toBe(true);

    release();
    vi.advanceTimersByTime(CHAINING_THRESHOLD - 1);
    expect(chainingManager.chaining).toBe(true);
    vi.advanceTimersByTime(1);
    expect(chainingManager.chaining).toBe(false);
  });

  it("releases each registration only once", () => {
    const releaseFirst = chainingManager.acquire();
    const releaseSecond = chainingManager.acquire();

    releaseFirst();
    releaseFirst();
    expect(vi.getTimerCount()).toBe(0);
    expect(chainingManager.chaining).toBe(true);

    releaseSecond();
    vi.advanceTimersByTime(CHAINING_THRESHOLD - 1);
    releaseSecond();
    vi.advanceTimersByTime(1);
    expect(chainingManager.chaining).toBe(false);
  });
});
