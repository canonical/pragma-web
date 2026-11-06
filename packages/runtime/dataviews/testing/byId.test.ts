import { describe, expect, it } from "vitest";
import byId from "./byId.js";

describe("byId", () => {
  it("reads a record's own id as text", () => {
    expect(byId({ id: 7 })).toBe("7");
  });
});
