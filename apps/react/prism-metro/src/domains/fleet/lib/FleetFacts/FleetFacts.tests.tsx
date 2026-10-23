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
    const facts = screen.getByRole("region", { name: "Facts" });
    await within(facts).findByText("Rolling stock");
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

  it("lists no facts for an address of another type", async () => {
    const { container } = renderFacts({
      kind: "unit",
      address: SERIES_90_SIX_CAR_CURIE,
    });
    await vi.waitFor(() => {
      expect(container.querySelector(".facts")).not.toBeNull();
    });
    expect(container.querySelectorAll(".fact")).toHaveLength(0);
  });

  it("keeps its heading alone when the facts cannot be read", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { container } = renderFacts(
      { kind: "stock", address: "metro:series-90" },
      vi.fn().mockRejectedValue(new Error("graph down")),
    );
    await vi.waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
    expect(container.querySelector(".facts")).toBeNull();
    expect(screen.getByRole("heading", { name: "Facts" })).toBeInTheDocument();
  });

  it("passes native props to its section and merges its class", () => {
    renderFacts(
      { kind: "stock", address: "metro:series-90", className: "x" },
      vi.fn().mockReturnValue(new Promise(() => {})),
    );
    expect(screen.getByRole("region", { name: "Facts" })).toHaveClass(
      "ds",
      "fleet-facts",
      "x",
    );
  });
});
