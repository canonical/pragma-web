import { describe, expect, it } from "vitest";
import isWrapperCallee from "./isWrapperCallee.js";

describe("isWrapperCallee", () => {
  it("accepts memo and forwardRef, bare or on React", () => {
    expect(isWrapperCallee("memo")).toBe(true);
    expect(isWrapperCallee("React.forwardRef")).toBe(true);
  });

  it("refuses any other callee", () => {
    expect(isWrapperCallee("createContext")).toBe(false);
  });
});
