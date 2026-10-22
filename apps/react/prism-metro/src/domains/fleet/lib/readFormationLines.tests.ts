import { createEnvironment } from "@canonical/prism-core";
import { graphql } from "react-relay";
import { fetchQuery } from "relay-runtime";
import { describe, expect, it, vi } from "vitest";
import type { readFormationLinesTestQuery } from "#relay/__generated__/readFormationLinesTestQuery.graphql.js";
import testQueryNode from "#relay/__generated__/readFormationLinesTestQuery.graphql.js";
import createMetroFetch from "../../../../testing/createMetroFetch.js";
import {
  NORTH_LINE_PLATFORMS,
  SERIES_90_SIX_CAR_IRI,
} from "../../../../testing/fixtures.js";
import readFormationLines from "./readFormationLines.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/** One formation, read through the fragment under test. */
const declareTestQuery = (): unknown => graphql`
  query readFormationLinesTestQuery($id: ID!) {
    node(id: $id) {
      ...readFormationLines_formation @alias
    }
  }
`;
void declareTestQuery;
/* v8 ignore stop */

describe("readFormationLines", () => {
  it("reads the six-car's lines, each with its stops' platforms", async () => {
    const environment = createEnvironment({ fetchFn: createMetroFetch() });
    const data = await fetchQuery<readFormationLinesTestQuery>(
      environment,
      testQueryNode,
      { id: SERIES_90_SIX_CAR_IRI },
    ).toPromise();
    const formation = data?.node?.readFormationLines_formation;
    if (formation == null) throw new Error("the six-car is not a formation");
    const lines = readFormationLines(formation);
    expect(lines.map(({ title }) => title)).toEqual([
      "Coastal Line",
      NORTH_LINE_PLATFORMS.title,
    ]);
    const north = lines.at(1);
    expect(north?.code).toBe(NORTH_LINE_PLATFORMS.code);
    const byTitle = (a: { title: string }, b: { title: string }): number =>
      a.title.localeCompare(b.title);
    expect([...(north?.stops ?? [])].sort(byTitle)).toEqual(
      [...NORTH_LINE_PLATFORMS.stops].sort(byTitle),
    );
  });

  it("reads a stop whose platform the graph does not know as null", async () => {
    // The network answers with a formation shaped as the schema allows and
    // the dataset never serves: a line calling at a stop of unknown length.
    const fetchFn = vi.fn().mockResolvedValue({
      data: {
        node: {
          __typename: "Formation",
          uri: "https://example.test/formation",
          lines: [
            {
              uri: "https://example.test/line",
              code: "T",
              _meta: { title: "Test Line" },
              servedBy: [
                {
                  __typename: "Station",
                  uri: "https://example.test/stop",
                  platformLength: null,
                  _meta: { title: "Beta" },
                },
              ],
            },
          ],
        },
      },
    });
    const data = await fetchQuery<readFormationLinesTestQuery>(
      createEnvironment({ fetchFn }),
      testQueryNode,
      { id: "https://example.test/formation" },
    ).toPromise();
    const formation = data?.node?.readFormationLines_formation;
    if (formation == null) throw new Error("the answer is not a formation");
    expect(readFormationLines(formation)).toEqual([
      {
        title: "Test Line",
        code: "T",
        stops: [{ title: "Beta", platformLength: null }],
      },
    ]);
  });
});
