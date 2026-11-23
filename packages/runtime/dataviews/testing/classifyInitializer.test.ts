import { describe, expect, it } from "vitest";
import classifyInitializer from "./classifyInitializer.js";

describe("classifyInitializer", () => {
  it("reads a function expression as a function", () => {
    expect(classifyInitializer(" async function () {}")).toBe("function");
  });

  it("reads a generic async arrow as a function", () => {
    expect(classifyInitializer(" async <T,>(a: T) => a")).toBe("function");
  });

  it("reads an arrow with a return type as a function", () => {
    expect(classifyInitializer(" (a): Map<() => void, b> => a")).toBe(
      "function",
    );
  });

  it("reads a parenthesised value with a type after it as a value", () => {
    expect(classifyInitializer(" (a): b, c")).toBe("value");
  });

  it("reads a return type that never reaches an arrow as a value", () => {
    expect(classifyInitializer(" (a): b")).toBe("value");
  });

  it("reads a parenthesised value as a value", () => {
    expect(classifyInitializer(" (a) + b")).toBe("value");
  });

  it("reads a bare-parameter arrow as a function", () => {
    expect(classifyInitializer(" a => a")).toBe("function");
  });

  it("reads a memo call as a function", () => {
    expect(classifyInitializer(" React.memo(Row)")).toBe("function");
  });

  it("reads any other call as a value", () => {
    expect(classifyInitializer(" createContext(null)")).toBe("value");
  });

  it("reads a literal as a value", () => {
    expect(classifyInitializer(" 3")).toBe("value");
  });
});
