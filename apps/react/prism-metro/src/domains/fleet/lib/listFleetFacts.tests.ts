import { createTranslator } from "@canonical/i18n-core";
import { describe, expect, it } from "vitest";
import { MESSAGES } from "#i18n";
import listFleetFacts, { type FleetPageNode } from "./listFleetFacts.js";

/** The app's translator, as the catalog hook gives it outside a provider. */
const t = createTranslator("en", MESSAGES);

describe("listFleetFacts", () => {
  it("lists no facts for a node of another type", () => {
    const zone = { __typename: "%other" } as NonNullable<FleetPageNode>;
    expect(listFleetFacts(zone, t)).toEqual([]);
  });

  it("reads a rolling stock's measures as ranges when they differ", () => {
    const stock = {
      __typename: "RollingStock",
      formations: [
        { length: 60000, capacity: 490 },
        { length: 120000, capacity: 980 },
      ],
    } as unknown as NonNullable<FleetPageNode>;
    expect(listFleetFacts(stock, t).map(({ value }) => value)).toEqual([
      "2",
      "60–120 m",
      "490–980 passengers",
    ]);
  });
});
