/**
 * Regression: a settings link, followed without scripts, dropped what
 * another table over the same presentation had hidden and ordered.
 *
 * Before the fix, a link's arrangement was spelled from the columns of the
 * table the link was in, so its hidden list and its order named that table's
 * columns alone, and following it showed another table's hidden columns
 * again. A link now carries the table's stored lists whole, and another
 * table's parameters as they were.
 */

import { createMemoryLocation } from "@canonical/dataviews-core";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { buildMachine, createMachineProvider } from "../../../testing/index.js";
import { DataTable } from "../../lib/pattern/DataViews/common/renderers/DataTable/index.js";

describe("regression 0051 — settings links dropped another table's columns", () => {
  it("keeps another table's hidden and ordered ids in every link", () => {
    const { provider } = createMachineProvider({
      rows: [buildMachine("m-1", "alpha")],
      location: createMemoryLocation({
        href: "/machines?table.t.order=owner&table.t.order=name&table.t.hidden=owner&table.other.hidden=name",
      }),
    });
    const container = document.createElement("div");
    container.innerHTML = renderToString(
      <DataTable
        id="t"
        provider={provider}
        columns={[
          { id: "name", header: "Name" },
          { id: "status", header: "Status" },
        ]}
        label="Machines"
        settings={<DataTable.SettingsMenu />}
      />,
    );
    const hide = [...container.querySelectorAll("[popover] a[href]")].find(
      (link) => link.textContent === "Hide Status",
    );
    const params = new URLSearchParams(hide?.getAttribute("href") ?? "");
    expect(params.getAll("table.t.hidden")).toEqual(["owner", "status"]);
    expect(params.getAll("table.t.order")).toEqual(["owner", "name"]);
    expect(params.getAll("table.other.hidden")).toEqual(["name"]);
  });
});
