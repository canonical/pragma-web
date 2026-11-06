import { flushSync } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ChainingManager } from "./ChainingManager.js";
import { useDelayedOpen } from "./useDelayedOpen.svelte.js";

describe("useDelayedOpen", () => {
  let chainingManager: ChainingManager;
  let destroy: (() => void) | undefined;

  beforeEach(() => {
    vi.useFakeTimers();
    chainingManager = new ChainingManager(350);
  });

  afterEach(() => {
    destroy?.();
    destroy = undefined;
    vi.useRealTimers();
  });

  it.each([false, true])("returns the initial open state: %s", (open) => {
    destroy = $effect.root(() => {
      const getDelayedOpen = useDelayedOpen(
        () => open,
        () => 500,
        chainingManager,
      );
      expect(getDelayedOpen()).toBe(open);
    });
    flushSync();
    expect(chainingManager.chaining).toBe(open);
  });

  it("opens after the full delay and closes immediately", () => {
    let open = $state(false);
    destroy = $effect.root(() => {
      const getDelayedOpen = useDelayedOpen(
        () => open,
        () => 500,
        chainingManager,
      );
      open = true;
      flushSync();

      vi.advanceTimersByTime(499);
      expect(getDelayedOpen()).toBe(false);
      expect(chainingManager.chaining).toBe(false);
      vi.advanceTimersByTime(1);
      flushSync();
      expect(getDelayedOpen()).toBe(true);
      expect(chainingManager.chaining).toBe(true);

      open = false;
      flushSync();
      expect(getDelayedOpen()).toBe(false);
      vi.advanceTimersByTime(349);
      expect(chainingManager.chaining).toBe(true);
      vi.advanceTimersByTime(1);
      expect(chainingManager.chaining).toBe(false);
    });
  });

  it("opens overlapping tooltips immediately and waits for the last close", () => {
    let firstOpen = $state(false);
    let secondOpen = $state(false);
    destroy = $effect.root(() => {
      const getFirst = useDelayedOpen(
        () => firstOpen,
        () => 500,
        chainingManager,
      );
      const getSecond = useDelayedOpen(
        () => secondOpen,
        () => 500,
        chainingManager,
      );
      firstOpen = true;
      flushSync();
      vi.advanceTimersByTime(500);
      flushSync();
      expect(getFirst()).toBe(true);
      vi.advanceTimersByTime(1000);

      secondOpen = true;
      flushSync();
      expect(getSecond()).toBe(true);

      secondOpen = false;
      flushSync();
      vi.advanceTimersByTime(1000);
      expect(chainingManager.chaining).toBe(true);
      expect(getFirst()).toBe(true);

      firstOpen = false;
      flushSync();
      vi.advanceTimersByTime(350);
      expect(chainingManager.chaining).toBe(false);
    });
  });

  it("opens during cooldown without allowing it to expire while visible", () => {
    let open = $state(true);
    destroy = $effect.root(() => {
      const getDelayedOpen = useDelayedOpen(
        () => open,
        () => 500,
        chainingManager,
      );
      flushSync();
      open = false;
      flushSync();
      vi.advanceTimersByTime(349);
      open = true;
      flushSync();
      expect(getDelayedOpen()).toBe(true);
      vi.advanceTimersByTime(1000);
      expect(chainingManager.chaining).toBe(true);
    });
  });

  it("cancels a pending opening without enabling chaining", () => {
    let open = $state(false);
    destroy = $effect.root(() => {
      const getDelayedOpen = useDelayedOpen(
        () => open,
        () => 500,
        chainingManager,
      );
      open = true;
      flushSync();
      vi.advanceTimersByTime(499);
      open = false;
      flushSync();
      vi.advanceTimersByTime(1000);
      expect(getDelayedOpen()).toBe(false);
      expect(chainingManager.chaining).toBe(false);
      expect(vi.getTimerCount()).toBe(0);
    });
  });

  it("applies delay changes only to the next opening", () => {
    let open = $state(false);
    let delay = $state(500);
    destroy = $effect.root(() => {
      const getDelayedOpen = useDelayedOpen(
        () => open,
        () => delay,
        chainingManager,
      );
      open = true;
      flushSync();
      vi.advanceTimersByTime(100);
      delay = 1000;
      flushSync();
      vi.advanceTimersByTime(400);
      flushSync();
      expect(getDelayedOpen()).toBe(true);

      open = false;
      flushSync();
      vi.advanceTimersByTime(350);
      open = true;
      flushSync();
      vi.advanceTimersByTime(999);
      expect(getDelayedOpen()).toBe(false);
      vi.advanceTimersByTime(1);
      flushSync();
      expect(getDelayedOpen()).toBe(true);
    });
  });

  it("releases its registration when destroyed while visible", () => {
    destroy = $effect.root(() => {
      useDelayedOpen(
        () => true,
        () => 500,
        chainingManager,
      );
    });
    flushSync();
    expect(chainingManager.chaining).toBe(true);
    destroy();
    destroy = undefined;
    vi.advanceTimersByTime(349);
    expect(chainingManager.chaining).toBe(true);
    vi.advanceTimersByTime(1);
    expect(chainingManager.chaining).toBe(false);
  });

  it("cancels its opening timer when destroyed before becoming visible", () => {
    let open = $state(false);
    destroy = $effect.root(() => {
      useDelayedOpen(
        () => open,
        () => 500,
        chainingManager,
      );
    });
    open = true;
    flushSync();
    destroy();
    destroy = undefined;
    vi.advanceTimersByTime(1000);
    expect(chainingManager.chaining).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });
});
