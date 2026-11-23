import { describe, expect, it } from "vitest";
import { UNKNOWN_COUNT } from "../result/index.js";
import readRelayPage from "./readRelayPage.js";

const row = { id: "m1" };

describe("readRelayPage", () => {
  it("reads the rows, the count, the next cursor and the facets", () => {
    expect(
      readRelayPage({
        edges: [{ node: row }],
        pageInfo: { endCursor: "c1", hasNextPage: true },
        totalCount: 3,
        facets: {},
      }),
    ).toEqual({
      status: "read",
      endCursor: "c1",
      page: {
        rows: [row],
        groups: null,
        counts: {
          pageable: { kind: "exact", value: 3 },
          matched: { kind: "exact", value: 3 },
        },
        facets: {},
        more: true,
        cursors: { next: "c1", previous: null },
      },
    });
  });

  it("counts nothing and ends the trail without a count or cursor", () => {
    const reading = readRelayPage({ edges: [], pageInfo: {} });
    expect(reading).toMatchObject({
      status: "read",
      endCursor: null,
      page: {
        counts: { pageable: UNKNOWN_COUNT, matched: UNKNOWN_COUNT },
        facets: {},
        more: null,
        cursors: { next: null },
      },
    });
  });

  it("names no next page on the last one", () => {
    expect(
      readRelayPage({
        edges: [],
        pageInfo: { endCursor: "c9", hasNextPage: false },
      }),
    ).toMatchObject({ endCursor: "c9", page: { cursors: { next: null } } });
  });

  it("fails a connection missing its parts", () => {
    expect(
      [
        null,
        undefined,
        { edges: null, pageInfo: {} },
        { edges: undefined, pageInfo: {} },
        { edges: [{ node: null }], pageInfo: {} },
        { edges: [null], pageInfo: {} },
        { edges: [{ node: row }], pageInfo: null },
        { edges: [{ node: row }], pageInfo: undefined },
      ].map((connection) => readRelayPage(connection)),
    ).toEqual([
      { status: "failed", reason: "the response carries no connection" },
      { status: "failed", reason: "the response carries no connection" },
      { status: "failed", reason: "the connection carries no edges" },
      { status: "failed", reason: "the connection carries no edges" },
      {
        status: "failed",
        reason: "the connection carries an edge without a record",
      },
      {
        status: "failed",
        reason: "the connection carries an edge without a record",
      },
      { status: "failed", reason: "the connection carries no page info" },
      { status: "failed", reason: "the connection carries no page info" },
    ]);
  });
});
