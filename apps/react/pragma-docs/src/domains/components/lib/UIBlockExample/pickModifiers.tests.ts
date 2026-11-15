import { describe, expect, it } from "vitest";
import pickModifiers from "./pickModifiers.js";

describe("pickModifiers", () => {
  it("keeps the families the example honours", () => {
    expect(
      pickModifiers("button", {
        importance: "primary",
        anticipation: "caution",
      }),
    ).toEqual({ importance: "primary", anticipation: "caution" });
  });

  it("leaves out a family the example has no prop for", () => {
    expect(
      pickModifiers("button", {
        importance: "secondary",
        criticality: "error",
      }),
    ).toEqual({ importance: "secondary" });
    expect(pickModifiers("keyboardKey", { importance: "primary" })).toEqual({});
  });
});
