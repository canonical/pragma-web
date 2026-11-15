import type { QueryFn } from "@canonical/ke-graphql";
import { describe, expect, it } from "vitest";
import { bootTurtleQuery } from "../../testing/bootTurtleQuery.js";
import { EDGE_TURTLE } from "../../testing/fixtures.js";
import { readTBoxOutline } from "./readTBoxOutline.js";

const EX = "https://example.org/";

describe("readTBoxOutline", () => {
  const outline = bootTurtleQuery(EDGE_TURTLE).then(readTBoxOutline);

  it("reads each class with its direct superclasses", async () => {
    const { classes } = await outline;
    expect(classes).toContainEqual({
      uri: `${EX}Employee`,
      parents: [`${EX}Person`],
    });
    expect(classes).toContainEqual({ uri: `${EX}Place`, parents: [] });
  });

  it("reads each property's inverse both ways and its labels by language", async () => {
    const { properties } = await outline;
    expect(properties).toContainEqual({
      uri: `${EX}worksFor`,
      inverse: `${EX}employs`,
      labels: { en: "works for", fr: "travaille pour" },
    });
    expect(properties).toContainEqual({
      uri: `${EX}employs`,
      inverse: `${EX}worksFor`,
      labels: {},
    });
    expect(properties).toContainEqual({
      uri: `${EX}locatedIn`,
      inverse: undefined,
      labels: { "": "located in" },
    });
  });

  it("refuses an answer that is not a SELECT result", async () => {
    const ask: QueryFn = async () =>
      ({ type: "ask", boolean: true }) as unknown as Awaited<
        ReturnType<QueryFn>
      >;
    await expect(readTBoxOutline(ask)).rejects.toThrow(
      "expected a SELECT result for the TBox outline, got ask",
    );
  });
});
