/**
 * The chip toolbar, as a pure projection of its props.
 *
 * The load-bearing claims: the chips report their state to assistive tech
 * (not only through colour), and toggling produces the RIGHT next filter
 * without navigating.
 */

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createAllNamespacesFilter } from "../lensFilter.js";
import type { LensFilter } from "../types.js";
import ExplorerControls from "./ExplorerControls.js";

const NAMESPACES = [
  { prefix: "ds", label: "ds" },
  { prefix: "cs", label: "cs" },
];

const renderControls = (
  filter: LensFilter,
  onFilterChange = vi.fn(),
): { onFilterChange: ReturnType<typeof vi.fn> } => {
  render(
    <ExplorerControls
      filter={filter}
      namespaceLabels={NAMESPACES}
      onFilterChange={onFilterChange}
    />,
  );
  return { onFilterChange };
};

describe("ExplorerControls", () => {
  it("offers one chip per real axis value — abstraction and ontology", () => {
    renderControls(createAllNamespacesFilter(["ds", "cs"]));
    // The axes are named for what they ARE. No "experimental"/"stable"
    // chip exists, because OntologyClass carries no such field.
    expect(
      within(screen.getByRole("group", { name: "Filter by abstraction" }))
        .getAllByRole("button")
        .map((button) => button.textContent),
    ).toEqual(["Abstract", "Concrete"]);
    expect(
      within(screen.getByRole("group", { name: "Filter by ontology" }))
        .getAllByRole("button")
        .map((button) => button.textContent),
    ).toEqual(["ds", "cs"]);
  });

  it("reports lit state through aria-pressed, not colour alone", () => {
    renderControls({
      ...createAllNamespacesFilter(["ds"]),
      abstractions: ["concrete"],
    });
    expect(screen.getByRole("button", { name: "Abstract" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: "Concrete" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "ds" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "cs" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("toggles a lit chip OFF, leaving the other axis untouched", () => {
    const filter = createAllNamespacesFilter(["ds", "cs"]);
    const { onFilterChange } = renderControls(filter);

    fireEvent.click(screen.getByRole("button", { name: "cs" }));

    expect(onFilterChange).toHaveBeenCalledTimes(1);
    const next = onFilterChange.mock.calls[0]?.[0] as LensFilter;
    expect([...next.namespaces]).toEqual(["ds"]);
    // The abstraction axis is carried through unchanged.
    expect([...next.abstractions]).toEqual([...filter.abstractions]);
    expect(next.text).toBe(filter.text);
  });

  it("toggles an unlit chip back ON in canonical order", () => {
    const { onFilterChange } = renderControls({
      ...createAllNamespacesFilter(["ds", "cs"]),
      namespaces: ["cs"],
    });

    fireEvent.click(screen.getByRole("button", { name: "ds" }));

    const next = onFilterChange.mock.calls[0]?.[0] as LensFilter;
    // Canonical order, not append order — chips must not jump around
    // under the cursor as they are toggled.
    expect([...next.namespaces]).toEqual(["ds", "cs"]);
  });
});
