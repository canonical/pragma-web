import { describe, expect, it } from "vitest";
import readComponentAddress from "./readComponentAddress.js";

describe("readComponentAddress", () => {
  it("reads a component's compact address from a bare or a prefixed URI", () => {
    expect(readComponentAddress("global.component.icon")).toBe(
      "ds:global.component.icon",
    );
    expect(readComponentAddress("ds:global.component.icon")).toBe(
      "ds:global.component.icon",
    );
  });

  it("gives no address to a block that is no component", () => {
    expect(readComponentAddress("global.pattern.hero")).toBeUndefined();
    expect(readComponentAddress("icon")).toBeUndefined();
  });
});
