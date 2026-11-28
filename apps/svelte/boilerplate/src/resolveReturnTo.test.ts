import { describe, expect, it } from "vitest";
import { resolveReturnTo } from "./resolveReturnTo.js";

const origin = "http://localhost:5180";

describe("resolveReturnTo", () => {
  it("returns to a same-origin referer", () => {
    expect(resolveReturnTo(`${origin}/catalog?x=1`, origin)).toBe(
      `${origin}/catalog?x=1`,
    );
  });

  it("falls back to / for another origin", () => {
    expect(resolveReturnTo("https://evil.example/", origin)).toBe("/");
  });

  it("keeps a protocol-relative path on this origin", () => {
    expect(resolveReturnTo(`${origin}//evil.example/path`, origin)).toBe(
      `${origin}//evil.example/path`,
    );
  });

  it("falls back to / without a referer or with a malformed one", () => {
    expect(resolveReturnTo(null, origin)).toBe("/");
    expect(resolveReturnTo("not a url", origin)).toBe("/");
  });
});
