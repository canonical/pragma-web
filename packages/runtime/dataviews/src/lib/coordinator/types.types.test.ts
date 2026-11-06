/**
 * The coordinator's contracts: the published state a renderer reads, and
 * what the coordinator takes to start and to adopt a query.
 */
import { describe, expectTypeOf, it } from "vitest";
import type { Query } from "../query/index.js";
import type { QueryIssue, ResultProblem } from "../result/index.js";
import type {
  DataViewsState,
  DispatchResult,
  QueryCoordinator,
  QueryCoordinatorConfig,
  ResultState,
  ResultStatus,
} from "./types.js";

describe("ResultStatus", () => {
  it("names each state a page of rows can be in", () => {
    expectTypeOf<ResultStatus>().toEqualTypeOf<
      | "idle"
      | "pending"
      | "refreshing"
      | "ready"
      | "refresh-failed"
      | "stale"
      | "failed"
    >();
  });
});

describe("ResultState", () => {
  it("records the last problem structurally, or null after a success", () => {
    expectTypeOf<
      ResultState["problem"]
    >().toEqualTypeOf<ResultProblem | null>();
    expectTypeOf<ResultState["status"]>().toEqualTypeOf<ResultStatus>();
  });
});

describe("DataViewsState", () => {
  it("is a query with its result, generation and pending request", () => {
    expectTypeOf<DataViewsState>().toExtend<Query>();
    expectTypeOf<DataViewsState["pendingRequestId"]>().toEqualTypeOf<
      string | null
    >();
    expectTypeOf<DataViewsState["generation"]>().toBeNumber();
  });
});

describe("QueryCoordinatorConfig", () => {
  it("takes the clauses a link was refused for beside the initial query", () => {
    expectTypeOf<QueryCoordinatorConfig["withheld"]>().toEqualTypeOf<
      readonly QueryIssue[] | undefined
    >();
    expectTypeOf<QueryCoordinatorConfig["initial"]>().toEqualTypeOf<
      Query | undefined
    >();
  });
});

describe("DispatchResult", () => {
  it("names the request to execute, or null when none is needed", () => {
    expectTypeOf<DispatchResult["requestId"]>().toEqualTypeOf<string | null>();
  });
});

describe("QueryCoordinator", () => {
  it("adopts a query with the clauses its link was refused for, optionally", () => {
    expectTypeOf<QueryCoordinator["adopt"]>().toEqualTypeOf<
      (query: Query, withheld?: readonly QueryIssue[]) => string | null
    >();
  });
});
