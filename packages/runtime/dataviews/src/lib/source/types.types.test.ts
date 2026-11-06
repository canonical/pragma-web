/**
 * The source contracts a source author writes against: a declaration typed
 * by the collection's schema, and the configuration each adapter takes. A
 * contract that starts accepting what it refuses fails the build through
 * `@ts-expect-error`.
 */
import { describe, expect, expectTypeOf, it } from "vitest";
import type { RecordTypes } from "../collection/index.js";
import { createSchema } from "../schema/index.js";
import type {
  CapabilityDeclaration,
  CountCapabilities,
  CountSupport,
  ExecuteSliceConfig,
  FacetFieldNameOf,
  PaginationCapabilities,
  QuerySourceConfig,
  RelaySourceConfig,
} from "./types.js";

const machines = createSchema([
  { field: "status", kind: "choices", options: ["failed", "ready"] },
  { field: "cores", kind: "number" },
  { field: "owner", kind: "presence" },
  { field: "created", kind: "date" },
  { field: "name", kind: "text" },
]);

type Fields = typeof machines.fields;

describe("FacetFieldNameOf", () => {
  it("names every field but text, presence included", () => {
    expectTypeOf<FacetFieldNameOf<Fields>>().toEqualTypeOf<
      "status" | "cores" | "owner" | "created"
    >();
  });
});

describe("CapabilityDeclaration", () => {
  it("accepts, per field, the operators its kind has", () => {
    const declared: CapabilityDeclaration<Fields> = {
      filter: {
        status: ["isAny", "isNone"],
        cores: ["gte"],
        owner: ["isSet"],
        name: true,
      },
    };
    expect(declared.filter?.owner).toEqual(["isSet"]);
  });

  it("refuses an operator the field's kind does not have", () => {
    const refused: CapabilityDeclaration<Fields> = {
      // @ts-expect-error a presence field is only ever set or not
      filter: { owner: ["gte"] },
    };
    expect(refused.filter).toBeDefined();
  });
});

describe("PaginationCapabilities", () => {
  it("says how a cursor behaves only for cursor pages", () => {
    const offset: PaginationCapabilities = { kind: "offset" };
    const cursor: PaginationCapabilities = {
      kind: "cursor",
      backward: false,
      durable: true,
    };
    // @ts-expect-error a cursor source says whether its tokens go backward
    const unsaid: PaginationCapabilities = { kind: "cursor", durable: true };
    expect([offset, cursor, unsaid]).toHaveLength(3);
  });
});

describe("ExecuteSliceConfig", () => {
  it("takes the collection's record types, or null for one type", () => {
    expectTypeOf<
      ExecuteSliceConfig["types"]
    >().toEqualTypeOf<RecordTypes | null>();
  });
});

describe("QuerySourceConfig", () => {
  it("takes an optional check of whether an error forbids the request", () => {
    expectTypeOf<QuerySourceConfig["isForbidden"]>().toEqualTypeOf<
      ((error: unknown) => boolean) | undefined
    >();
  });
});

describe("RelaySourceConfig", () => {
  it("takes an optional check of whether an error forbids the request", () => {
    expectTypeOf<RelaySourceConfig["isForbidden"]>().toEqualTypeOf<
      ((error: unknown) => boolean) | undefined
    >();
  });
});

describe("CountCapabilities", () => {
  it("declares support for the pageable and the matched counts, and nothing else", () => {
    expectTypeOf<keyof CountCapabilities>().toEqualTypeOf<
      "pageable" | "matched"
    >();
    expectTypeOf<CountCapabilities["pageable"]>().toEqualTypeOf<CountSupport>();
  });
});
