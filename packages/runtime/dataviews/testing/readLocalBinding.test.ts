import { describe, expect, it } from "vitest";
import readLocalBinding from "./readLocalBinding.js";

describe("readLocalBinding", () => {
  it("reads a function declaration", () => {
    expect(readLocalBinding("function* Row$() {}", "Row$")).toEqual({
      kind: "function",
      form: "function",
    });
  });

  it("reads a class declaration", () => {
    expect(readLocalBinding("abstract class A {}", "A")).toEqual({
      kind: "class",
      form: "class",
    });
  });

  it("reads a type or an interface", () => {
    expect(readLocalBinding("interface A {}", "A")).toEqual({
      kind: "type",
      form: "other",
    });
  });

  it("reads an enum as a value", () => {
    expect(readLocalBinding("enum A {}", "A")).toEqual({
      kind: "value",
      form: "other",
    });
  });

  it("reads a typed variable holding an arrow", () => {
    expect(readLocalBinding("const A: () => void = () => {};", "A")).toEqual({
      kind: "function",
      form: "variable",
    });
  });

  it("reads a typed variable with no initializer as a value", () => {
    expect(readLocalBinding("let A: number;", "A")).toEqual({
      kind: "value",
      form: "variable",
    });
  });

  it("reads an untyped variable with no initializer as a value", () => {
    expect(readLocalBinding("let A;", "A")).toEqual({
      kind: "value",
      form: "variable",
    });
  });

  it("reads a variable holding a call as wrapped", () => {
    expect(readLocalBinding("const A = createContext(null);", "A")).toEqual({
      kind: "value",
      form: "wrapped",
    });
  });

  it("reads an import as a re-export", () => {
    expect(readLocalBinding('import { A } from " ";', "A")).toEqual({
      kind: "reexport",
      form: "other",
    });
  });

  it("reads a name declared nowhere as unknown", () => {
    expect(readLocalBinding("", "A")).toEqual({
      kind: "unknown",
      form: "other",
    });
  });
});
