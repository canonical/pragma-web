/**
 * Regression: a forbidden refresh withdraws the rows on screen, and the
 * pagination bar with them.
 *
 * Before the fix, a 403 was a failure: the rows kept from before stayed on
 * screen under "These rows could not be refreshed: forbidden", and the bar
 * went on counting them. Now the table draws no row, says "You do not have
 * permission to see these rows." once, politely, and the bar shows no
 * summary and offers no further page.
 */

import { createDataViewsProvider, createPage } from "@canonical/dataviews-core";
import { act, cleanup, render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import buildMachine from "../../../testing/buildMachine.js";
import createMachineProvider from "../../../testing/createMachineProvider.js";
import createManualSource from "../../../testing/createManualSource.js";
import { MACHINE_CAPABILITIES, machines } from "../../../testing/machines.js";
import type { Machine } from "../../../testing/types.js";
import DataViews from "../../lib/_work_in_progress/DataViews/Provider.js";

afterEach(cleanup);

describe("regression 0126 — a forbidden refresh kept rows on screen", () => {
  it("draws no row, says no access once, and offers no further page", () => {
    const { provider, source } = createMachineProvider();
    render(
      <DataViews provider={provider}>
        <DataViews.DataTable
          columns={[{ id: "name", header: "Name" }]}
          label="Machines"
        />
        <DataViews.Pagination />
      </DataViews>,
    );
    // More rows match than one page shows, so the bar offers the next one.
    act(() => {
      source.latest().deliver({
        status: "succeeded",
        page: createPage({
          rows: [buildMachine("m-1", "alpha")],
          matched: 120,
        }),
      });
    });
    expect(screen.getByText("alpha")).toBeInTheDocument();
    const bar = screen.getByRole("navigation", { name: "Pagination" });
    expect(
      within(bar).getByRole("button", { name: "Next page" }),
    ).toBeEnabled();
    act(() => {
      provider.refresh();
    });
    act(() => {
      source.latest().deliver({ status: "forbidden", cause: new Error("403") });
    });
    expect(screen.queryByText("alpha")).toBeNull();
    const table = screen.getByRole("table", { name: "Machines" });
    const said = within(table).getAllByRole("status");
    expect(said).toHaveLength(1);
    expect(said.at(0)).toHaveTextContent(
      "You do not have permission to see these rows.",
    );
    expect(said.at(0)?.closest("[data-status]")).toHaveAttribute(
      "data-status",
      "no-access",
    );
    expect(bar).not.toHaveTextContent(/Showing/);
    expect(
      within(bar).getByRole("button", { name: "Next page" }),
    ).toBeDisabled();
  });

  it("draws the no-access status in a server render, with no row", () => {
    const { source } = createManualSource<Machine>({
      capabilities: MACHINE_CAPABILITIES,
    });
    const provider = createDataViewsProvider({
      collection: machines,
      // A source that can answer within the call, as a server render reads.
      source: {
        ...source,
        readDelivery: () => ({ status: "forbidden", cause: new Error("403") }),
      },
    });
    // What a server render does before rendering.
    provider.refresh();
    const html = renderToString(
      <DataViews provider={provider}>
        <DataViews.DataTable
          columns={[{ id: "name", header: "Name" }]}
          label="Machines"
        />
      </DataViews>,
    );
    expect(html).toContain('data-status="no-access"');
    expect(html).toContain("You do not have permission to see these rows.");
    // The header row and the status row, and no row of a record.
    const drawn = document.createElement("div");
    drawn.innerHTML = html;
    expect(within(drawn).getAllByRole("row")).toHaveLength(2);
  });
});
