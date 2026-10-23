import { describe, expect, it } from "vitest";
import listFleetFacts, { type FleetPageNode } from "./listFleetFacts.js";

describe("listFleetFacts", () => {
  it("lists no facts for a node of another type", () => {
    const zone = { __typename: "%other" } as NonNullable<FleetPageNode>;
    expect(listFleetFacts(zone)).toEqual([]);
  });

  it("reads a rolling stock's measures as ranges when they differ", () => {
    const stock = {
      __typename: "RollingStock",
      formations: [
        { length: 60000, capacity: 490 },
        { length: 120000, capacity: 980 },
      ],
    } as unknown as NonNullable<FleetPageNode>;
    expect(listFleetFacts(stock).map(({ value }) => value)).toEqual([
      "2",
      "60 m to 120 m",
      "490 passengers to 980 passengers",
    ]);
  });
});
