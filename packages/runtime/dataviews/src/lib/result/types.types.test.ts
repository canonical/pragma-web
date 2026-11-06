/**
 * The result contracts a renderer switches on: every outcome is told apart
 * by one discriminant, and each carries only what that outcome means. A
 * shape that starts accepting another outcome's members fails the build
 * through `@ts-expect-error`.
 */
import { describe, expect, expectTypeOf, it } from "vitest";
import type {
  Completion,
  Count,
  QueryIssue,
  QueryIssueCode,
  ResultProblem,
  SourceCounts,
  SourceDelivery,
  SourceRefusal,
  SourceRefusalCode,
  SourceRefusalPart,
} from "./types.js";

describe("Count", () => {
  it("carries a value only when the count says how many", () => {
    const exact: Count = { kind: "exact", value: 4 };
    const atLeast: Count = { kind: "at-least", value: 100 };
    const unknown: Count = { kind: "unknown" };
    // @ts-expect-error an unknown count has no value to carry
    const valued: Count = { kind: "unknown", value: 0 };
    expect([exact, atLeast, unknown, valued]).toHaveLength(4);
  });
});

describe("SourceCounts", () => {
  it("counts the pageable and the matched records, and nothing else", () => {
    expectTypeOf<keyof SourceCounts>().toEqualTypeOf<"pageable" | "matched">();
    expectTypeOf<SourceCounts["matched"]>().toEqualTypeOf<Count>();
  });
});

describe("SourceRefusalPart", () => {
  it("names the members of a request a source can refuse", () => {
    expectTypeOf<SourceRefusalPart>().toEqualTypeOf<
      "filter" | "search" | "sort" | "group" | "window"
    >();
  });
});

describe("SourceDelivery", () => {
  it("tells a page, a failure and a forbidden request apart by status", () => {
    expectTypeOf<SourceDelivery["status"]>().toEqualTypeOf<
      "succeeded" | "failed" | "forbidden"
    >();
    expectTypeOf<
      Extract<SourceDelivery, { readonly status: "forbidden" }>
    >().toEqualTypeOf<{
      readonly status: "forbidden";
      readonly cause: unknown;
    }>();
  });

  it("refuses a forbidden delivery carrying rows", () => {
    const leaked: SourceDelivery = {
      status: "forbidden",
      cause: null,
      // @ts-expect-error a forbidden request delivers no page
      page: {},
    };
    expect(leaked.status).toBe("forbidden");
  });
});

describe("Completion", () => {
  it("adds the binding's refusal to what a source delivers", () => {
    expectTypeOf<Completion["status"]>().toEqualTypeOf<
      "succeeded" | "failed" | "forbidden" | "refused"
    >();
    expectTypeOf<
      Extract<Completion, { readonly status: "refused" }>["refusals"]
    >().toEqualTypeOf<readonly SourceRefusal[]>();
  });
});

describe("QueryIssueCode", () => {
  it("reports every code a source refuses for, and the grammar's own", () => {
    expectTypeOf<SourceRefusalCode>().toExtend<QueryIssueCode>();
    expectTypeOf<Exclude<QueryIssueCode, SourceRefusalCode>>().toEqualTypeOf<
      "malformed" | "invalid" | "unknown-field"
    >();
  });
});

describe("QueryIssue", () => {
  it("names the parameter, and the field where one is addressed", () => {
    const search: QueryIssue = {
      parameter: "q",
      field: null,
      code: "undeclared-field",
      reason: "this source cannot search",
    };
    // @ts-expect-error an issue says which field it addresses, or null
    const unsaid: QueryIssue = { parameter: "q", code: "invalid", reason: "" };
    expect([search, unsaid]).toHaveLength(2);
  });
});

describe("ResultProblem", () => {
  it("is every completion but a success", () => {
    expectTypeOf<ResultProblem["status"]>().toEqualTypeOf<
      "failed" | "forbidden" | "refused"
    >();
  });

  it("carries a source's refusals or a link's refused clauses under refused", () => {
    const bySource: ResultProblem = { status: "refused", refusals: [] };
    const byLink: ResultProblem = { status: "refused", issues: [] };
    expect([bySource, byLink]).toHaveLength(2);
  });
});
