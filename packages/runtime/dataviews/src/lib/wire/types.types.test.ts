/**
 * The wire grammar's contracts: what a decode answers with, and what an
 * encode and a decode take.
 */
import { describe, expectTypeOf, it } from "vitest";
import type { Query, Slice } from "../query/index.js";
import type { QueryIssue } from "../result/index.js";
import type { SourceCapabilities } from "../source/index.js";
import type {
  ArrangementParams,
  CarryingEncodeConfig,
  DecodedQuery,
  DecodeQueryConfig,
  EncodeQueryConfig,
} from "./types.js";

describe("ArrangementParams", () => {
  it("carries the column order, or null, and the hidden columns", () => {
    expectTypeOf<ArrangementParams["order"]>().toEqualTypeOf<
      readonly string[] | null
    >();
    expectTypeOf<ArrangementParams["hidden"]>().toEqualTypeOf<
      readonly string[]
    >();
  });
});

describe("DecodedQuery", () => {
  it("is the query that could be read, with every parameter that could not", () => {
    expectTypeOf<DecodedQuery>().toExtend<Query>();
    expectTypeOf<DecodedQuery["issues"]>().toEqualTypeOf<
      readonly QueryIssue[]
    >();
  });
});

describe("EncodeQueryConfig", () => {
  it("keeps the host's parameters it is given, and carries nothing", () => {
    expectTypeOf<EncodeQueryConfig["preserve"]>().toEqualTypeOf<
      URLSearchParams | undefined
    >();
    expectTypeOf<EncodeQueryConfig>().not.toHaveProperty("carry");
  });
});

describe("CarryingEncodeConfig", () => {
  it("carries the keys it names, less what the applied slice supplied", () => {
    expectTypeOf<CarryingEncodeConfig["carry"]>().toEqualTypeOf<
      readonly string[]
    >();
    expectTypeOf<CarryingEncodeConfig["applied"]>().toEqualTypeOf<Slice>();
    expectTypeOf<CarryingEncodeConfig>().toExtend<EncodeQueryConfig>();
  });
});

describe("DecodeQueryConfig", () => {
  it("checks a link against the source's declaration when given one", () => {
    expectTypeOf<DecodeQueryConfig["capabilities"]>().toEqualTypeOf<
      SourceCapabilities | null | undefined
    >();
  });
});
