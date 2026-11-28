/**
 * Regression: a cell whose field does not apply to its record's type is
 * named "Not applicable" for readers, not left as silent as an empty one.
 * The dash is hidden from readers; the words are clipped, never `hidden`.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, onTestFinished } from "vitest";
import { createWorkloadProvider } from "../../../testing/index.js";
import { DataCards } from "../../lib/pattern/DataViews/common/renderers/DataCards/index.js";
import { DataTable } from "../../lib/pattern/DataViews/common/renderers/DataTable/index.js";

const fields = [
  { id: "name", header: "Name" },
  { id: "image", header: "Image" },
];

describe("regression 0129 — a not-applicable cell was hidden from readers too", () => {
  it("names a table's cell by the words beside its dash", () => {
    const { provider } = createWorkloadProvider();
    onTestFinished(provider.observe());
    render(
      <DataTable provider={provider} columns={fields} label="Workloads" />,
    );
    const cell = screen.getAllByRole("cell").at(-1);
    expect(cell).toHaveAccessibleName("Not applicable");
    expect(cell).toHaveTextContent("—");
  });

  it("names a card's field by the same words", () => {
    const { provider } = createWorkloadProvider();
    onTestFinished(provider.observe());
    render(
      <DataCards
        provider={provider}
        fields={fields}
        title="name"
        label="Workloads"
      />,
    );
    expect(screen.getByText("Not applicable")).toBeVisible();
  });
});
