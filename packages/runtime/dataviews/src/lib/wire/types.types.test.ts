/**
 * The wire grammar's contracts: what a decode answers with, and what an
 * encode and a decode take.
 */
import { describe, expectTypeOf, it } from "vitest";
import type { Query } from "../query/index.js";

import type { SourceCapabilities } from "../source/index.js";
import type {
  ArrangementParams,
  DecodedQuery,
  DecodeQueryConfig,
  EncodeQueryConfig,
  QueryIssue,
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
  it("keeps the host's parameters it is given", () => {
    expectTypeOf<EncodeQueryConfig["preserve"]>().toEqualTypeOf<
      URLSearchParams | undefined
    >();
  });
});

describe("DecodeQueryConfig", () => {
  it("checks a link against the source's declaration when given one", () => {
    expectTypeOf<DecodeQueryConfig["capabilities"]>().toEqualTypeOf<
      SourceCapabilities | null | undefined
    >();
  });
});
