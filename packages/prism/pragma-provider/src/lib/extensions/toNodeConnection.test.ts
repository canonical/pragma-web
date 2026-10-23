import { describe, expect, it } from "vitest";
import { toNodeConnection } from "./toNodeConnection.js";

/** Three edges, in page order. */
const EDGES = [
  { node: { uri: "urn:a" }, cursor: "a" },
  { node: { uri: "urn:b" }, cursor: "b" },
  { node: { uri: "urn:c" }, cursor: "c" },
];

describe("toNodeConnection", () => {
  it("gives an empty page null cursors", () => {
    expect(
      toNodeConnection([], { hasNextPage: false, hasPreviousPage: false }),
    ).toEqual({
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
    });
  });

  it("passes the flags through", () => {
    expect(
      toNodeConnection(EDGES, { hasNextPage: true, hasPreviousPage: true })
        .pageInfo,
    ).toMatchObject({ hasNextPage: true, hasPreviousPage: true });
  });

  it("takes its cursors from the first and the last edge", () => {
    const connection = toNodeConnection(EDGES, {
      hasNextPage: false,
      hasPreviousPage: false,
    });
    expect(connection.edges).toBe(EDGES);
    expect(connection.pageInfo).toMatchObject({
      startCursor: "a",
      endCursor: "c",
    });
  });

  it("reads only the flags off a page that carries more", () => {
    const page = {
      window: ["urn:a"],
      hasNextPage: true,
      hasPreviousPage: false,
    };
    expect(Object.keys(toNodeConnection(EDGES, page).pageInfo)).toEqual([
      "hasNextPage",
      "hasPreviousPage",
      "startCursor",
      "endCursor",
    ]);
  });
});
