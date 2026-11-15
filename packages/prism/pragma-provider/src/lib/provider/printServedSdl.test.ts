import { buildSchema } from "graphql";
import { describe, expect, it } from "vitest";
import { printServedSdl } from "./printServedSdl.js";

const COMPILED = buildSchema("type Query { a: String }");
const SERVED = buildSchema("type Query { a: String\n b: String }");

describe("printServedSdl", () => {
  it("keeps the compiler's header and prints the served schema after it", () => {
    expect(
      printServedSdl(
        "# header\ntype Query {\n  a: String\n}",
        COMPILED,
        SERVED,
      ),
    ).toBe("# header\ntype Query {\n  a: String\n  b: String\n}");
  });

  it("refuses an SDL that does not end with the compiled schema", () => {
    expect(() =>
      printServedSdl("type Query {\n  z: String\n}", COMPILED, SERVED),
    ).toThrow(
      "ke-graphql's SDL is no longer its header followed by the printed schema",
    );
  });
});
