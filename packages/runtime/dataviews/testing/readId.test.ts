import { describe, expect, it } from "vitest";
import readId from "./readId.js";

describe("readId", () => {
  it("reads a record's own id as text", () => {
    expect(readId({ id: 7 })).toBe("7");
  });
});
