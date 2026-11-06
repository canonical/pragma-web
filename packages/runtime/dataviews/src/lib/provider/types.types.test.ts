/**
 * The provider's internal contracts: how each move enters history, and
 * what the host, the query path and the location sync take. A table that
 * starts leaving a query transition out of history fails the build through
 * `@ts-expect-error`.
 */
import { describe, expect, expectTypeOf, it } from "vitest";
import type { HistoryMode } from "../location/index.js";
import type { Query, QueryCommand } from "../query/index.js";
import type { QueryIssue, SourceRefusal } from "../result/index.js";
import type {
  AdoptionCause,
  LocationSync,
  ProviderHost,
  QueryCommands,
  QueryTransition,
  StartingPoint,
  TransitionCause,
  TransitionHistory,
} from "./types.js";

describe("TransitionCause", () => {
  it("adds the moves no policy names to the query transitions", () => {
    expectTypeOf<
      Exclude<TransitionCause, QueryTransition | AdoptionCause>
    >().toEqualTypeOf<"collapse" | "reset">();
  });
});

describe("TransitionHistory", () => {
  it("enters every query transition into history", () => {
    expectTypeOf<
      TransitionHistory[QueryTransition]
    >().toEqualTypeOf<HistoryMode>();
    expectTypeOf<
      TransitionHistory["collapse"]
    >().toEqualTypeOf<HistoryMode | null>();
  });

  it("refuses a query transition that enters no history", () => {
    const resolved: TransitionHistory = {
      // @ts-expect-error a filter is always a step in history
      filter: null,
      search: "replace",
      sort: "push",
      group: "push",
      window: "push",
      view: "push",
      collapse: null,
      adopt: null,
      reset: "replace",
      revert: "replace",
    };
    expect(resolved.filter).toBeNull();
  });
});

describe("ProviderHost", () => {
  it("adopts a query with the clauses its link was refused for, optionally", () => {
    expectTypeOf<ProviderHost["adopt"]>().toEqualTypeOf<
      (
        query: Query,
        cause: AdoptionCause,
        view: string | null,
        withheld?: readonly QueryIssue[],
      ) => string | null
    >();
  });

  it("removes one refused parameter of the location by name", () => {
    expectTypeOf<ProviderHost["clearRefused"]>().toEqualTypeOf<
      (parameter: string) => void
    >();
  });
});

describe("StartingPoint", () => {
  it("carries the location's refused clauses that withhold its query", () => {
    expectTypeOf<StartingPoint["withheld"]>().toEqualTypeOf<
      readonly QueryIssue[]
    >();
  });
});

describe("QueryCommands", () => {
  it("applies one command, and answers with the refusals it incurs", () => {
    expectTypeOf<QueryCommands["command"]>()
      .parameter(0)
      .toEqualTypeOf<QueryCommand>();
    expectTypeOf<QueryCommands["command"]>().returns.toEqualTypeOf<
      readonly SourceRefusal[]
    >();
  });
});

describe("LocationSync", () => {
  it("removes one refused parameter, entering history as it is told", () => {
    expectTypeOf<LocationSync["clearRefused"]>().toEqualTypeOf<
      (parameter: string, history: HistoryMode) => void
    >();
  });
});
