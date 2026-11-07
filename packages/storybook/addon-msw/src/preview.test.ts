import { describe, expect, it } from "vitest";
import { KEY } from "./constants.js";
import preview from "./preview.js";

describe("preview", () => {
  it("turns MSW on for every story until the toolbar turns it off", () => {
    expect(preview.initialGlobals).toEqual({ [KEY]: true });
  });
});
