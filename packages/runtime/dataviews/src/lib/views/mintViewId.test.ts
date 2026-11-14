import { describe, expect, it } from "vitest";
import mintViewId from "./mintViewId.js";

describe("mintViewId", () => {
  it("mints 128 bits as 32 hex digits", () => {
    expect(mintViewId()).toMatch(/^[0-9a-f]{32}$/);
  });

  it("mints a fresh id on every call", () => {
    expect(mintViewId()).not.toBe(mintViewId());
  });
});
