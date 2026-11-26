import { afterEach, describe, expect, it, vi } from "vitest";
import {
  BAR_COLUMNS,
  FRAME_KEYS,
  NARROW_QUERY,
  PHONE_SIZE,
  WINDOW_PLATFORM,
} from "./constants.js";

afterEach(() => {
  window.history.replaceState(null, "", "/");
});

describe("WINDOW_PLATFORM", () => {
  it("reads the frame's address", () => {
    window.history.replaceState(null, "", "/machines?status=deployed");
    expect(WINDOW_PLATFORM.getLocation()).toBe(window.location.href);
  });

  it("pushes a step of the frame's history", () => {
    const before = window.history.length;
    WINDOW_PLATFORM.navigate("/machines?status=ready");
    expect(window.location.search).toBe("?status=ready");
    expect(window.history.length).toBe(before + 1);
  });

  it("replaces the frame's step when asked to", () => {
    const before = window.history.length;
    WINDOW_PLATFORM.navigate("/machines?status=broken", { replace: true });
    expect(window.location.search).toBe("?status=broken");
    expect(window.history.length).toBe(before);
  });

  it("tells a listener of Back and Forward until it unsubscribes", () => {
    const listener = vi.fn();
    const unsubscribe = WINDOW_PLATFORM.subscribe(listener);
    window.dispatchEvent(new PopStateEvent("popstate"));
    expect(listener).toHaveBeenCalledWith(window.location.href);
    unsubscribe();
    window.dispatchEvent(new PopStateEvent("popstate"));
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe("the bar stories' constants", () => {
  it("names the bar machines' columns", () => {
    expect(BAR_COLUMNS.map(({ id }) => id)).toEqual([
      "hostname",
      "status",
      "memory",
      "tags",
      "owner",
      "deployed",
    ]);
  });

  it("keeps the frame's own parameters", () => {
    expect(FRAME_KEYS).toEqual(["id", "viewMode", "args", "globals"]);
  });

  it("starts the narrow stories on two filter chips at a phone's width", () => {
    expect(new URLSearchParams(NARROW_QUERY).get("status")).toBe("deployed");
    expect(PHONE_SIZE).toBe("min(22.5rem, 100%)");
  });
});
