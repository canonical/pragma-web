import { describe, expect, it } from "vitest";
import { VIRTUALIZED } from "./constants.js";

describe("constants", () => {
  it("keys the implementation under a private symbol", () => {
    expect(typeof VIRTUALIZED).toBe("symbol");
    expect(VIRTUALIZED.description).toBe("virtualized");
    expect(VIRTUALIZED).not.toBe(Symbol.for("virtualized"));
  });
});
