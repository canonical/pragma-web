import { flushSync } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { UseDelayedToggleProps } from "./index.js";
import { useDelayedToggle } from "./index.js";

/** Runs the hook in an effect root, as a component would. */
const setup = (props: UseDelayedToggleProps = {}) => {
  let toggle!: ReturnType<typeof useDelayedToggle>;
  const destroy = $effect.root(() => {
    toggle = useDelayedToggle(() => props);
  });
  flushSync();
  return { toggle, destroy };
};

describe("useDelayedToggle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initializes the flag to false", () => {
    const { toggle } = setup();
    expect(toggle.flag).toBe(false);
  });

  it("works without props", () => {
    let toggle!: ReturnType<typeof useDelayedToggle>;
    const destroy = $effect.root(() => {
      toggle = useDelayedToggle();
    });
    toggle.activate(new Event("open"));
    vi.advanceTimersByTime(150);
    expect(toggle.flag).toBe(true);
    destroy();
  });

  it("sets the flag to true after activateDelay", () => {
    const { toggle } = setup({ activateDelay: 100 });
    toggle.activate(new Event("open"));
    vi.advanceTimersByTime(99);
    expect(toggle.flag).toBe(false);
    vi.advanceTimersByTime(1);
    expect(toggle.flag).toBe(true);
  });

  it("sets the flag to false after deactivateDelay", () => {
    const { toggle } = setup({ deactivateDelay: 100 });
    toggle.activate(new Event("open"));
    vi.advanceTimersByTime(150);
    toggle.deactivate(new Event("close"));
    vi.advanceTimersByTime(100);
    expect(toggle.flag).toBe(false);
  });

  it("calls onActivate", () => {
    const onActivate = vi.fn();
    const { toggle } = setup({ activateDelay: 100, onActivate });
    const event = new Event("open");
    toggle.activate(event);
    vi.advanceTimersByTime(100);
    expect(onActivate).toHaveBeenCalledExactlyOnceWith(event);
  });

  it("calls onDeactivate", () => {
    const onDeactivate = vi.fn();
    const { toggle } = setup({ deactivateDelay: 100, onDeactivate });
    toggle.activate(new Event("open"));
    vi.advanceTimersByTime(150);
    toggle.deactivate(new Event("close"));
    vi.advanceTimersByTime(100);
    expect(onDeactivate).toHaveBeenCalledOnce();
  });

  it("clears the previous timeout on subsequent activate calls", () => {
    const onActivate = vi.fn();
    const { toggle } = setup({ activateDelay: 200, onActivate });
    toggle.activate(new Event("open"));
    vi.advanceTimersByTime(100);
    toggle.activate(new Event("open"));
    vi.advanceTimersByTime(200);
    expect(toggle.flag).toBe(true);
    expect(onActivate).toHaveBeenCalledOnce();
  });

  it("clears the previous timeout on subsequent deactivate calls", () => {
    const onDeactivate = vi.fn();
    const { toggle } = setup({ deactivateDelay: 200, onDeactivate });
    toggle.activate(new Event("open"));
    vi.advanceTimersByTime(200);
    toggle.deactivate(new Event("close"));
    vi.advanceTimersByTime(100);
    toggle.deactivate(new Event("close"));
    vi.advanceTimersByTime(200);
    expect(toggle.flag).toBe(false);
    expect(onDeactivate).toHaveBeenCalledOnce();
  });

  it("clears a pending toggle when destroyed", () => {
    const { toggle, destroy } = setup({ activateDelay: 100 });
    toggle.activate(new Event("open"));
    destroy();
    expect(vi.getTimerCount()).toBe(0);
  });
});
