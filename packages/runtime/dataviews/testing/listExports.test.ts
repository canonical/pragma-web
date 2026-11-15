import { describe, expect, it } from "vitest";
import listExports from "./listExports.js";

describe("listExports", () => {
  it("reads only top-level exports, past comments and strings", () => {
    const source = [
      "// export const Hidden = 1;",
      'const text = "export default 1";',
      "namespace N { export const Inner = 1; }",
      "export const A = (a) => a;",
      "export * from './b.js';",
      "export * as c from './c.js';",
      "export type { D } from './d.js';",
      "export { E } from './e.js';",
      "export default memo(F);",
    ].join("\n");
    expect(listExports(source)).toEqual([
      { name: "A", kind: "function", isDefault: false, isAtEnd: false },
      { name: "*", kind: "reexport", isDefault: false, isAtEnd: false },
      { name: "c", kind: "reexport", isDefault: false, isAtEnd: false },
      { name: "D", kind: "type", isDefault: false, isAtEnd: false },
      { name: "E", kind: "reexport", isDefault: false, isAtEnd: false },
      {
        name: "F",
        kind: "function",
        isDefault: true,
        isAtEnd: false,
        wrapper: "memo",
        wrapsFunction: false,
      },
    ]);
  });

  it("reads a function's overload signatures as one export", () => {
    const source = [
      "export default function a(b: string): string;",
      "export default function a(b: number): number;",
      "export default function a(b: unknown) { return b; }",
      "export function c(d: string): void;",
      "export function c(d: unknown) {}",
    ].join("\n");
    expect(listExports(source)).toEqual([
      { name: "a", kind: "function", isDefault: true, isAtEnd: false },
      { name: "c", kind: "function", isDefault: false, isAtEnd: false },
    ]);
  });

  it("reads nothing from a file with no export", () => {
    expect(listExports("const a = [1];")).toEqual([]);
  });
});
