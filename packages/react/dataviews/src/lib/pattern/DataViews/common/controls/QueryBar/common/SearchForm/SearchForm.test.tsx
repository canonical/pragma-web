import { createMemoryLocation } from "@canonical/dataviews-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createMachineProvider } from "../../../../../../../../../testing/index.js";
import DataViews from "../../../../../../../_work_in_progress/DataViews/Provider.js";
import SearchForm from "./SearchForm.js";

describe("SearchForm", () => {
  it("wraps the field in a GET form whose submission is held once scripts run", () => {
    const { provider } = createMachineProvider({
      location: createMemoryLocation({ href: "/m?status=failed" }),
    });
    render(
      <DataViews provider={provider}>
        <SearchForm hasHref>
          <input type="search" name="q" aria-label="Filter" />
        </SearchForm>
      </DataViews>,
    );
    const form = screen.getByRole("search");
    expect(form).toHaveAttribute("method", "get");
    expect(fireEvent.submit(form)).toBe(false);
  });

  it("leaves the field alone without an address", () => {
    const { provider } = createMachineProvider();
    render(
      <DataViews provider={provider}>
        <SearchForm hasHref={false}>
          <input type="search" aria-label="Filter" />
        </SearchForm>
      </DataViews>,
    );
    expect(screen.queryByRole("search")).toBeNull();
    expect(screen.getByRole("searchbox", { name: "Filter" })).toBeVisible();
  });
});
