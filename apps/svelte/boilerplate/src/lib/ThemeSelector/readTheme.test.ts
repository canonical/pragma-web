import { describe, expect, it } from "vitest";
import readTheme from "./readTheme.js";

describe("readTheme", () => {
  it("reads a pinned theme from the cookie header", () => {
    expect(readTheme("locale=fr; theme=dark")).toBe("dark");
  });

  it("ignores a missing or unknown theme", () => {
    expect(readTheme(null)).toBeUndefined();
    expect(readTheme("theme=sepia")).toBeUndefined();
  });
});
