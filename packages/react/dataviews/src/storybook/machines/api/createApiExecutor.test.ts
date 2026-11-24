import { describe, expect, it } from "vitest";
import createApiExecutor from "./createApiExecutor.js";
import type { ApiQuery, ApiRecord } from "./types.js";

/** The records every case executes over, in input order. */
const RECORDS: readonly ApiRecord[] = [
  { id: "a", name: "alpha", owner: "ops", status: "pending", cores: 4 },
  { id: "b", name: "beta", owner: "alpha-team", status: "failed", cores: 16 },
  { id: "c", name: "gamma", owner: "ops", status: "running", cores: 8 },
  { id: "d", name: "delta", owner: "dev", status: "running", cores: 2 },
];

/** A query restricting nothing, with these members in its place. */
const createQuery = (members: Partial<ApiQuery>): ApiQuery => ({
  text: [],
  statuses: { isAny: [], isNone: [] },
  cores: { gte: null, lte: null },
  search: null,
  facets: [],
  sort: null,
  ...members,
});

const execute = createApiExecutor(RECORDS);

/** The ids of the records one query answers from an offset. */
const executeIds = (
  members: Partial<ApiQuery>,
  offset = 0,
  limit = RECORDS.length,
): readonly string[] =>
  execute(createQuery(members), offset, limit).rows.map(({ id }) => id);

describe("createApiExecutor", () => {
  it("answers the records from the offset, at most the limit, counting every match", () => {
    expect(execute(createQuery({}), 1, 2)).toEqual({
      rows: [RECORDS.at(1), RECORDS.at(2)],
      matched: 4,
      facets: {},
    });
    expect(executeIds({}, 3, 2)).toEqual(["d"]);
  });

  it("requires every text match, status, bound and the search at once", () => {
    expect(
      executeIds({
        text: [{ field: "name", operator: "contains", text: "A" }],
        statuses: { isAny: ["running", "pending"], isNone: ["pending"] },
        cores: { gte: 4, lte: 8 },
        search: "OPS",
      }),
    ).toEqual(["c"]);
  });

  it("ranks a status the collection does not list, and searches a number", () => {
    const strays = createApiExecutor([
      { id: "r", name: "retired", status: "retired" },
      { id: "n", name: 42, status: 3 },
      { id: "c", name: "gamma", status: "running" },
    ]);
    const answerIds = (members: Partial<ApiQuery>): readonly string[] =>
      strays(createQuery(members), 0, 3).rows.map(({ id }) => id);
    // Listed statuses by rank, then a number, then unlisted text; reversed.
    expect(answerIds({ sort: { field: "status", direction: "asc" } })).toEqual([
      "c",
      "n",
      "r",
    ]);
    expect(answerIds({ sort: { field: "status", direction: "desc" } })).toEqual(
      ["r", "n", "c"],
    );
    expect(answerIds({ search: "42" })).toEqual(["n"]);
  });

  it("searches the name and the owner", () => {
    expect(executeIds({ search: "alpha" })).toEqual(["a", "b"]);
  });

  it("orders a status by the lifecycle and cores by number", () => {
    expect(executeIds({ sort: { field: "status", direction: "asc" } })).toEqual(
      ["c", "d", "b", "a"],
    );
    expect(executeIds({ sort: { field: "cores", direction: "desc" } })).toEqual(
      ["b", "c", "a", "d"],
    );
  });

  it("computes the facets asked for, each with its own field's restriction lifted", () => {
    expect(
      execute(
        createQuery({
          statuses: { isAny: ["running"], isNone: [] },
          cores: { gte: 4, lte: null },
          facets: ["status", "cores"],
        }),
        0,
        1,
      ).facets,
    ).toEqual({
      status: {
        kind: "values",
        values: [
          { value: "running", count: { kind: "exact", value: 1 } },
          { value: "failed", count: { kind: "exact", value: 1 } },
          { value: "pending", count: { kind: "exact", value: 1 } },
        ],
      },
      cores: { kind: "range", min: 2, max: 8 },
    });
  });
});
