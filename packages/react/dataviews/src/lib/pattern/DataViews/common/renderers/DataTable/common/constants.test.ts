import { describe, expect, it } from "vitest";
import {
  DEFAULT_SIZING,
  TABBABLE_ATTRIBUTES,
  TABBABLE_SELECTORS,
} from "./constants.js";

describe("constants", () => {
  it("sizes an unsized column flexibly, with a 96px floor", () => {
    expect(DEFAULT_SIZING).toEqual({ kind: "flex", weight: 1, minPx: 96 });
  });

  it("watches every attribute the tabbable selectors read", () => {
    const read = TABBABLE_SELECTORS.flatMap((selector) =>
      [...selector.matchAll(/\[([a-z-]+)|:(disabled)/g)].map(
        ([, attribute, state]) => attribute ?? state,
      ),
    );
    expect(read).toContain("tabindex");
    expect(TABBABLE_ATTRIBUTES).toEqual(expect.arrayContaining(read));
  });
});
