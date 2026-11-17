import { createTranslator } from "@canonical/i18n-core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MESSAGES } from "#i18n";
import type { FleetPageNode } from "./listFleetFacts.js";
import renderFleetFacts from "./renderFleetFacts.js";

/** The app's translator, as the catalog hook gives it outside a provider. */
const t = createTranslator("en", MESSAGES);

describe("renderFleetFacts", () => {
  it("leaves no facts for a node that records none", () => {
    const zone = { __typename: "%other" } as NonNullable<FleetPageNode>;
    expect(renderFleetFacts(zone, t)).toBeUndefined();
  });

  it("lists each fact as a term over its value, in reading order", () => {
    const carType = {
      __typename: "CarType",
      code: "DM",
      hasCab: true,
      length: 20000,
      capacity: 150,
    } as unknown as NonNullable<FleetPageNode>;
    const facts = renderFleetFacts(carType, t);
    expect(facts).toBeDefined();
    render(facts);
    expect(screen.getAllByRole("term").map((term) => term.textContent)).toEqual(
      ["Code", "Driving cab", "Length", "Capacity"],
    );
    expect(screen.getByText("150 passengers")).toBeInTheDocument();
  });
});
