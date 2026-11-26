import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FilterOptions from "../../FilterOptions.js";
import Grid from "./Grid.js";

describe("Grid", () => {
  it("lines up its filters and takes the root's props", () => {
    render(
      <Grid className="extra" data-testid="grid">
        <FilterOptions
          label="Status"
          options={[{ value: "deployed", label: "deployed", current: true }]}
        />
        <FilterOptions
          label="Tags"
          options={[{ value: "ex-gpu", label: "ex-gpu", current: false }]}
        />
      </Grid>,
    );
    const grid = screen.getByTestId("grid");
    expect(grid).toHaveClass("ds", "filter-options-grid", "extra");
    expect(
      screen.getAllByRole("group").map((group) => group.parentElement),
    ).toEqual([grid, grid]);
  });
});
