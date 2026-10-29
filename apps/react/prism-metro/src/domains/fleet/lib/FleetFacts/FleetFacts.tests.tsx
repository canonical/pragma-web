import {
  createEnvironment,
  setPrefetchEnvironment,
} from "@canonical/prism-core";
import { render, screen, within } from "@testing-library/react";
import { RelayEnvironmentProvider } from "react-relay";
import { afterEach, describe, expect, it, vi } from "vitest";
import createMetroFetch from "../../../../../testing/createMetroFetch.js";
import { SERIES_90_SIX_CAR_CURIE } from "../../../../../testing/fixtures.js";
import FleetFacts from "./FleetFacts.js";
import type { FleetFactsProps } from "./types.js";

afterEach(() => {
  setPrefetchEnvironment(undefined);
});

/** Render the facts over `fetchFn`. */
const renderFacts = (props: FleetFactsProps, fetchFn = createMetroFetch()) =>
  render(
    <RelayEnvironmentProvider environment={createEnvironment({ fetchFn })}>
      <FleetFacts {...props} />
    </RelayEnvironmentProvider>,
  );

describe("FleetFacts", () => {
  it("lists the node's facts, each term over its value", async () => {
    renderFacts({ kind: "formation", address: SERIES_90_SIX_CAR_CURIE });
    const facts = await screen.findByRole("region", { name: "Facts" });
    const terms = within(facts)
      .getAllByRole("term")
      .map((term) => term.textContent);
    expect(terms).toEqual([
      "Rolling stock",
      "Length",
      "Capacity",
      "Units",
      "Cars",
    ]);
    expect(
      within(facts)
        .getAllByRole("definition")
        .map((value) => value.textContent),
    ).toEqual(["Series 90", "120 m", "980 passengers", "2", "6"]);
  });

  it("renders nothing for an address of another type", async () => {
    const fetchFn = vi.fn(createMetroFetch());
    const { container } = renderFacts(
      { kind: "unit", address: SERIES_90_SIX_CAR_CURIE },
      fetchFn,
    );
    await vi.waitFor(() => {
      expect(fetchFn).toHaveBeenCalled();
    });
    await fetchFn.mock.results.at(0)?.value;
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when the facts cannot be read", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { container } = renderFacts(
      { kind: "stock", address: "metro:series-90" },
      vi.fn().mockRejectedValue(new Error("graph down")),
    );
    await vi.waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
    expect(container).toBeEmptyDOMElement();
  });

  it("passes native props to its section and merges its class", async () => {
    renderFacts({ kind: "stock", address: "metro:series-90", className: "x" });
    expect(await screen.findByRole("region", { name: "Facts" })).toHaveClass(
      "ds",
      "fleet-facts",
      "x",
    );
  });
});
