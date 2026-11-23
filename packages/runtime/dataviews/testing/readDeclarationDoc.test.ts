import { describe, expect, it } from "vitest";
import readDeclarationDoc from "./readDeclarationDoc.js";

describe("readDeclarationDoc", () => {
  it("reads the block before a function, a const and a type", () => {
    const source = [
      "/** Reads. */",
      "export default function readThing() {}",
      "/**",
      " * Many lines.",
      " */",
      "export const LIMIT = 3;",
      "/** A shape. */",
      "export type Shape = { readonly id: string };",
    ].join("\n");
    expect(readDeclarationDoc(source, "readThing")).toBe("/** Reads. */");
    expect(readDeclarationDoc(source, "LIMIT")).toBe(
      "/**\n * Many lines.\n */",
    );
    expect(readDeclarationDoc(source, "Shape")).toBe("/** A shape. */");
  });

  it("answers empty for an undocumented declaration", () => {
    expect(readDeclarationDoc("export interface Plain {}", "Plain")).toBe("");
  });

  it("answers null when the text does not declare the name", () => {
    expect(readDeclarationDoc("export const LIMITED = 1;", "LIMIT")).toBeNull();
    expect(readDeclarationDoc("const LIMIT = 1;", "LIMIT")).toBeNull();
  });

  it("reads a name with a dollar sign", () => {
    expect(readDeclarationDoc("/** D. */\nexport const a$ = 1;", "a$")).toBe(
      "/** D. */",
    );
  });
});
