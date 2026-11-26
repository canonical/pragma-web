import type { MouseEvent } from "react";
import { describe, expect, it } from "vitest";
import isPlainClick from "./isPlainClick.js";

/** A click as React hands it, with the keys and button given. */
const click = (init: Partial<MouseEvent> = {}): MouseEvent =>
  ({
    button: 0,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    ...init,
  }) as MouseEvent;

describe("isPlainClick", () => {
  it("holds for the main button with no key held", () => {
    expect(isPlainClick(click())).toBe(true);
  });

  it("fails for another button, or any key that sends the link elsewhere", () => {
    for (const init of [
      { button: 1 },
      { metaKey: true },
      { ctrlKey: true },
      { shiftKey: true },
      { altKey: true },
    ]) {
      expect(isPlainClick(click(init))).toBe(false);
    }
  });
});
