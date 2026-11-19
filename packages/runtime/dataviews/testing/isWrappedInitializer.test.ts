import { describe, expect, it } from "vitest";
import isWrappedInitializer from "./isWrappedInitializer.js";

describe("isWrappedInitializer", () => {
  it("accepts a call up to its semicolon", () => {
    expect(isWrappedInitializer(" createContext<A | null>(null);\nf();")).toBe(
      true,
    );
  });

  it("accepts a value ending in an as cast", () => {
    expect(isWrappedInitializer(" { a: [1] } as unknown as B;")).toBe(true);
  });

  it("refuses an arrow whose body is cast", () => {
    expect(isWrappedInitializer(" (a) => a as B;")).toBe(false);
  });

  it("refuses a call with more after it", () => {
    expect(isWrappedInitializer(" f(a) + 1;")).toBe(false);
  });

  it("stops at the end of an enclosing block", () => {
    expect(isWrappedInitializer(" 1 } as B")).toBe(false);
  });
});
