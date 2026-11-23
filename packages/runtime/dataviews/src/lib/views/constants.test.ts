import { describe, expect, it } from "vitest";
import { INITIAL_VIEWS_STATE, NO_VIEW_OPEN } from "./constants.js";

describe("constants", () => {
  it("starts a session unlisted, with nothing open, frozen", () => {
    expect(INITIAL_VIEWS_STATE).toEqual({
      listing: { status: "idle" },
      views: [],
      unreadable: [],
      current: null,
      modified: false,
      command: null,
    });
    expect(Object.isFrozen(INITIAL_VIEWS_STATE)).toBe(true);
    expect(Object.isFrozen(INITIAL_VIEWS_STATE.listing)).toBe(true);
    expect(Object.isFrozen(INITIAL_VIEWS_STATE.views)).toBe(true);
    expect(Object.isFrozen(INITIAL_VIEWS_STATE.unreadable)).toBe(true);
  });

  it("settles a command needing an open view as missing, frozen", () => {
    expect(NO_VIEW_OPEN).toEqual({ status: "missing" });
    expect(Object.isFrozen(NO_VIEW_OPEN)).toBe(true);
  });
});
