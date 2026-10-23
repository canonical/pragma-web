import type { CompilerContext } from "@canonical/ke-graphql";
import { type GraphQLFieldConfig, GraphQLString } from "graphql";
import { describe, expect, it } from "vitest";
import type { ExtensionLookups } from "../extensions/index.js";
import { composeExtensions } from "./composeExtensions.js";

/** A field to add, distinguishable by its description. */
const field = (
  description: string,
): GraphQLFieldConfig<unknown, CompilerContext> => ({
  type: GraphQLString,
  description,
});

/** Lookups that know no type, which none of these factories asks for. */
const LOOKUPS: ExtensionLookups = {
  type: () => undefined,
  iface: () => undefined,
};

describe("composeExtensions", () => {
  it("merges the Query fields of two factories", () => {
    const a = field("a");
    const b = field("b");
    const composed = composeExtensions([
      () => ({ Query: { a } }),
      () => ({ Query: { b } }),
    ]);
    expect(composed(LOOKUPS)).toEqual({ Query: { a, b } });
  });

  it("keeps the fields of different types apart", () => {
    const a = field("a");
    const b = field("b");
    const composed = composeExtensions([
      () => ({ Query: { a } }),
      () => ({ Prose: { b } }),
    ]);
    expect(composed(LOOKUPS)).toEqual({ Query: { a }, Prose: { b } });
  });

  it("hands every factory the lookups", () => {
    const seen: ExtensionLookups[] = [];
    composeExtensions([
      (lookups) => {
        seen.push(lookups);
        return {};
      },
      (lookups) => {
        seen.push(lookups);
        return {};
      },
    ])(LOOKUPS);
    expect(seen).toEqual([LOOKUPS, LOOKUPS]);
  });

  it("refuses a field two factories declare", () => {
    const composed = composeExtensions([
      () => ({ Query: { search: field("first") } }),
      () => ({ Query: { search: field("second") } }),
    ]);
    expect(() => composed(LOOKUPS)).toThrow(
      "extension field Query.search is declared by more than one extension",
    );
  });

  it("composes no factories into no fields", () => {
    expect(composeExtensions([])(LOOKUPS)).toEqual({});
  });
});
