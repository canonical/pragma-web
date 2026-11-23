import { describe, expect, it } from "vitest";
import skipTypeAnnotation from "./skipTypeAnnotation.js";

describe("skipTypeAnnotation", () => {
  it("returns the offset of the initializer's equals sign", () => {
    expect(skipTypeAnnotation(" Map<a, b> = x", 0)).toBe(11);
  });

  it("skips the arrow and the brackets of a function type", () => {
    const text = " (a: { b: 1 }) => [c] = x";
    expect(skipTypeAnnotation(text, 0)).toBe(text.indexOf("= x"));
  });

  it("keeps the depth across an arrow inside brackets", () => {
    const text = " Map<() => void, b> = x";
    expect(skipTypeAnnotation(text, 0)).toBe(text.indexOf("= x"));
  });

  it("skips an arrow at the top of the type", () => {
    expect(skipTypeAnnotation(" () =>void = x", 0)).toBe(11);
  });

  it("skips an equality sign", () => {
    expect(skipTypeAnnotation(" a == b = x", 0)).toBe(8);
  });

  it("returns -1 at a semicolon before any initializer", () => {
    expect(skipTypeAnnotation(" string; = x", 0)).toBe(-1);
  });

  it("returns -1 at the end of the text", () => {
    expect(skipTypeAnnotation(" string", 0)).toBe(-1);
  });
});
