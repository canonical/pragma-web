import { createEnvironment } from "@canonical/prism-core";
import { graphql } from "react-relay";
import { fetchQuery } from "relay-runtime";
import { describe, expect, it } from "vitest";
import type { readUnitCarsTestQuery } from "#relay/__generated__/readUnitCarsTestQuery.graphql.js";
import testQueryNode from "#relay/__generated__/readUnitCarsTestQuery.graphql.js";
import createMetroFetch from "../../../../testing/createMetroFetch.js";
import {
  SERIES_90_UNIT,
  SERIES_90_UNIT_IRI,
} from "../../../../testing/fixtures.js";
import readUnitCars from "./readUnitCars.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/** One unit, read through the fragment under test. */
const declareTestQuery = (): unknown => graphql`
  query readUnitCarsTestQuery($id: ID!) {
    node(id: $id) {
      ...readUnitCars_unit @alias
    }
  }
`;
void declareTestQuery;
/* v8 ignore stop */

describe("readUnitCars", () => {
  it("reads a unit's cars front first, each with its car type", async () => {
    const environment = createEnvironment({ fetchFn: createMetroFetch() });
    const data = await fetchQuery<readUnitCarsTestQuery>(
      environment,
      testQueryNode,
      { id: SERIES_90_UNIT_IRI },
    ).toPromise();
    const unit = data?.node?.readUnitCars_unit;
    if (unit == null) throw new Error("the Series 90 unit is not a unit");
    expect(readUnitCars(unit)).toEqual(SERIES_90_UNIT.cars);
  });
});
