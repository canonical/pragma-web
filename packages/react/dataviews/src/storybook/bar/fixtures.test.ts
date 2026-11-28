import { afterEach, describe, expect, it, vi } from "vitest";
import { BAR_COLUMNS, POOLED_COLUMNS, WINDOW_PLATFORM } from "./fixtures.js";

afterEach(() => {
  window.history.replaceState(null, "", "/");
});

const IDS = ["hostname", "status", "memory", "tags", "owner", "deployed"];

describe("fixtures", () => {
  describe("BAR_COLUMNS", () => {
    it("names the bar machines' columns", () => {
      expect(BAR_COLUMNS.map(({ id }) => id)).toEqual(IDS);
    });
  });

  describe("POOLED_COLUMNS", () => {
    it("names the same columns over the pooled machines", () => {
      expect(POOLED_COLUMNS.map(({ id }) => id)).toEqual(IDS);
    });
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
});
