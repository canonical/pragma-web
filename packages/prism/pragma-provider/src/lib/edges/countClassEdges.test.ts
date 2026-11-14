import type { QueryFn } from "@canonical/ke-graphql";
import { describe, expect, it } from "vitest";
import { bootTurtleQuery } from "../../testing/bootTurtleQuery.js";
import { EDGE_TURTLE } from "../../testing/fixtures.js";
import { readTBoxOutline } from "../lens/index.js";
import { countClassEdges } from "./countClassEdges.js";

const EX = "https://example.org/";

describe("countClassEdges", () => {
  it("counts each statement once, under its most specific asserted classes", async () => {
    const query = await bootTurtleQuery(EDGE_TURTLE);
    expect(await countClassEdges(query, await readTBoxOutline(query))).toEqual([
      {
        property: `${EX}employs`,
        subjectClass: `${EX}Org`,
        objectClass: `${EX}Person`,
        count: 0,
        declared: true,
      },
      {
        property: `${EX}locatedIn`,
        subjectClass: `${EX}Org`,
        objectClass: `${EX}Place`,
        count: 1,
        declared: false,
      },
      {
        property: `${EX}worksFor`,
        subjectClass: `${EX}Person`,
        objectClass: `${EX}Org`,
        count: 2,
        declared: true,
      },
    ]);
  });

  it("refuses an answer that is not a SELECT result", async () => {
    const ask: QueryFn = async () =>
      ({ type: "ask", boolean: true }) as unknown as Awaited<
        ReturnType<QueryFn>
      >;
    await expect(
      countClassEdges(ask, { classes: [], properties: [] }),
    ).rejects.toThrow("expected a SELECT result for the class edges, got ask");
  });
});
