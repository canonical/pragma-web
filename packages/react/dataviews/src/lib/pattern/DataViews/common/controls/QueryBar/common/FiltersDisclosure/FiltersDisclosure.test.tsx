import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createMachineProvider } from "../../../../../../../../../testing/index.js";
import DataViews from "../../../../../Provider.js";
import FiltersDisclosure from "./FiltersDisclosure.js";

describe("FiltersDisclosure", () => {
  it("counts the filters that apply, and discloses the filters form", () => {
    const { provider } = createMachineProvider();
    const { container } = render(
      <DataViews provider={provider}>
        <FiltersDisclosure applied={2} className="extra" />
      </DataViews>,
    );
    const details = container.querySelector("details");
    expect(details).toHaveClass(
      "ds",
      "data-views-query-bar-filters-disclosure",
      "extra",
    );
    expect(details).not.toHaveAttribute("open");
    fireEvent.click(screen.getByText("Filters (2)"));
    expect(details).toHaveAttribute("open");
    expect(screen.getByRole("button", { name: "Apply filters" })).toBeVisible();
  });
});
