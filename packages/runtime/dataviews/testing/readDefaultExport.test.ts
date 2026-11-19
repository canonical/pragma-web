import { describe, expect, it } from "vitest";
import readDefaultExport from "./readDefaultExport.js";

describe("readDefaultExport", () => {
  it("reads a named or anonymous function", () => {
    expect(readDefaultExport("", "function Row() {}")).toEqual({
      name: "Row",
      kind: "function",
      isDefault: true,
      isAtEnd: false,
    });
    expect(readDefaultExport("", "async function () {}").name).toBeNull();
  });

  it("reads a named or anonymous class", () => {
    expect(readDefaultExport("", "class A {}").name).toBe("A");
    expect(readDefaultExport("", "class {}").name).toBeNull();
  });

  it("reads an interface as a type", () => {
    expect(readDefaultExport("", "interface A {}").kind).toBe("type");
  });

  it("reads a local binding exported at the end", () => {
    expect(readDefaultExport("function A() {}", "A;")).toEqual({
      name: "A",
      kind: "function",
      isDefault: true,
      isAtEnd: true,
    });
  });

  it("reads a wrapped binding as not at the end", () => {
    expect(
      readDefaultExport("const A = createContext(null);", "A as B").isAtEnd,
    ).toBe(false);
  });

  it("reads a memo over a function declaration", () => {
    expect(readDefaultExport("function A() {}", "memo(A);")).toEqual({
      name: "A",
      kind: "function",
      isDefault: true,
      isAtEnd: false,
      wrapper: "memo",
      wrapsFunction: true,
    });
  });

  it("reads a memo over an arrow as fine", () => {
    expect(
      readDefaultExport("const A = () => null;", "memo<P>(A) as typeof A;")
        .wrapsFunction,
    ).toBe(false);
  });

  it("reads another call as a value with no name", () => {
    expect(readDefaultExport("", "Object.assign(A, { b });")).toEqual({
      name: null,
      kind: "value",
      isDefault: true,
      isAtEnd: false,
      wrapper: "Object.assign",
      wrapsFunction: false,
    });
  });

  it("reads any other expression as an anonymous value", () => {
    expect(readDefaultExport("", "{ a: 1 };")).toEqual({
      name: null,
      kind: "value",
      isDefault: true,
      isAtEnd: false,
    });
  });
});
