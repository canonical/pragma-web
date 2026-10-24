import { describe, expect, it } from "vitest";
import { BUTTON_ANATOMY_DSL } from "../../../../../../../testing/anatomyTexts.js";
import readAnatomy from "./readAnatomy.js";

describe("readAnatomy", () => {
  it("reads a valid anatomy text", () => {
    expect(readAnatomy(BUTTON_ANATOMY_DSL)?.root.uri).toBe(
      "global.component.button",
    );
  });

  it("reads text the parser refuses as no anatomy", () => {
    expect(readAnatomy("node: [this is not an anatomy")).toBeUndefined();
    expect(readAnatomy("just: words")).toBeUndefined();
  });

  it("reads an absent or blank text as no anatomy", () => {
    expect(readAnatomy(null)).toBeUndefined();
    expect(readAnatomy(undefined)).toBeUndefined();
    expect(readAnatomy("  ")).toBeUndefined();
  });
});
