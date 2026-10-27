import { createEnvironment } from "@canonical/prism-core";
import { graphql } from "react-relay";
import { fetchQuery } from "relay-runtime";
import { describe, expect, it } from "vitest";
import type { readFormationTrainTestQuery } from "#relay/__generated__/readFormationTrainTestQuery.graphql.js";
import testQueryNode from "#relay/__generated__/readFormationTrainTestQuery.graphql.js";
import createMetroFetch from "../../../../testing/createMetroFetch.js";
import {
  SERIES_50_FOUR_CAR,
  SERIES_50_FOUR_CAR_IRI,
  SERIES_90_SIX_CAR,
  SERIES_90_SIX_CAR_IRI,
} from "../../../../testing/fixtures.js";
import readFormationTrain from "./readFormationTrain.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/** One formation, read through the fragment under test. */
const declareTestQuery = (): unknown => graphql`
  query readFormationTrainTestQuery($id: ID!) {
    node(id: $id) {
      ...readFormationTrain_formation @alias
    }
  }
`;
void declareTestQuery;
/* v8 ignore stop */

/** Fetch the formation at `id` from the metro graph and read its train. */
const readFromGraph = async (id: string) => {
  const environment = createEnvironment({ fetchFn: createMetroFetch() });
  const data = await fetchQuery<readFormationTrainTestQuery>(
    environment,
    testQueryNode,
    { id },
  ).toPromise();
  const formation = data?.node?.readFormationTrain_formation;
  if (formation == null) throw new Error(`${id} is not a formation`);
  return readFormationTrain(formation);
};

describe("readFormationTrain", () => {
  it("reads the six-car's two units, front first, with their cars", async () => {
    expect(await readFromGraph(SERIES_90_SIX_CAR_IRI)).toEqual(
      SERIES_90_SIX_CAR,
    );
  });

  it("reads a reversed unit's flag as the graph states it", async () => {
    expect(await readFromGraph(SERIES_50_FOUR_CAR_IRI)).toEqual(
      SERIES_50_FOUR_CAR,
    );
  });
});
