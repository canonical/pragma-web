import { describe, expect, it } from "vitest";
import readDeclarationExport from "./readDeclarationExport.js";

/** Read the declaration export of a masked text that starts with `export`. */
function readAfterExport(masked: string) {
  const rest = masked.slice("export ".length);
  return readDeclarationExport(masked, rest, "export ".length);
}

describe("readDeclarationExport", () => {
  it("reads a declared type", () => {
    expect(readAfterExport("export declare type A = 1;")).toEqual({
      name: "A",
      kind: "type",
      isDefault: false,
      isAtEnd: false,
    });
  });

  it("reads an enum, a function and a class", () => {
    expect(readAfterExport("export const enum A {}").kind).toBe("value");
    expect(readAfterExport("export function A() {}").kind).toBe("function");
    expect(readAfterExport("export class A {}").kind).toBe("class");
  });

  it("reads a typed variable holding an arrow", () => {
    expect(readAfterExport("export const A: B = () => 1;").kind).toBe(
      "function",
    );
  });

  it("reads an untyped variable holding a value", () => {
    expect(readAfterExport("export const A = 1;").kind).toBe("value");
  });

  it("reads a variable with no initializer as a value", () => {
    expect(readAfterExport("export let A;").kind).toBe("value");
  });

  it("reads anything else as unknown", () => {
    expect(readAfterExport("export = A;")).toEqual({
      name: null,
      kind: "unknown",
      isDefault: false,
      isAtEnd: false,
    });
  });
});
