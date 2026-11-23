import { describe, expect, it } from "vitest";
import {
  buildFailedResult,
  buildPage,
  readIssuedRequest,
} from "../../../testing/index.js";
import {
  createQueryCoordinator,
  type QueryCoordinator,
} from "../coordinator/index.js";
import type { Facet } from "../result/index.js";
import readAnsweredFacets from "./readAnsweredFacets.js";

type Machine = { readonly id: string; readonly status: string };

const STATUS: Facet = {
  kind: "values",
  values: [{ value: "failed", count: { kind: "exact", value: 4 } }],
};

/** A coordinator whose first request was answered with the status facet. */
const createAnswered = (): QueryCoordinator<Machine> => {
  const coordinator = createQueryCoordinator<Machine>();
  coordinator.complete(coordinator.refresh(), {
    status: "succeeded",
    page: { ...buildPage([]), facets: { status: STATUS } },
  });
  return coordinator;
};

describe("readAnsweredFacets", () => {
  it("is null before the first page", () => {
    expect(
      readAnsweredFacets(createQueryCoordinator<Machine>().state),
    ).toBeNull();
  });

  it("reads the facets answering the applied query", () => {
    expect(readAnsweredFacets(createAnswered().state)).toEqual({
      status: STATUS,
    });
  });

  it("keeps the facets while a sort or a grouping is pending", () => {
    const coordinator = createAnswered();
    coordinator.dispatch({
      kind: "setSort",
      sort: [{ field: "status", direction: "desc" }],
    });
    expect(coordinator.state.pendingRequestId).not.toBeNull();
    expect(readAnsweredFacets(coordinator.state)).toEqual({ status: STATUS });
    coordinator.dispatch({ kind: "setGroup", group: [{ field: "status" }] });
    expect(readAnsweredFacets(coordinator.state)).toEqual({ status: STATUS });
  });

  it("is null while another filter or search is pending", () => {
    const filtered = createAnswered();
    filtered.dispatch({
      kind: "setPredicate",
      predicate: { field: "status", operator: "isAny", operands: ["failed"] },
    });
    expect(readAnsweredFacets(filtered.state)).toBeNull();
    const searched = createAnswered();
    searched.dispatch({ kind: "setSearch", search: "alpha" });
    expect(readAnsweredFacets(searched.state)).toBeNull();
  });

  it("is null once the applied query failed", () => {
    const coordinator = createAnswered();
    const { requestId } = coordinator.dispatch({
      kind: "setSearch",
      search: "alpha",
    });
    coordinator.complete(
      readIssuedRequest(requestId),
      buildFailedResult("unreachable"),
    );
    expect(readAnsweredFacets(coordinator.state)).toBeNull();
  });

  it("keeps the facets once a re-sort failed", () => {
    const coordinator = createAnswered();
    const { requestId } = coordinator.dispatch({
      kind: "setSort",
      sort: [{ field: "status", direction: "desc" }],
    });
    coordinator.complete(
      readIssuedRequest(requestId),
      buildFailedResult("unreachable"),
    );
    expect(coordinator.state.result.status).toBe("stale");
    expect(readAnsweredFacets(coordinator.state)).toEqual({ status: STATUS });
  });
});
