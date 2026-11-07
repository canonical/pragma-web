/**
 * Without scripting there is nothing to choose a renderer with, so the server
 * draws the first renderer alone, in a region named for it, and offers no
 * choice that would do nothing.
 */

import {
  createArraySource,
  createDataViewsProvider,
  createMemoryLocation,
} from "@canonical/dataviews-core";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import buildFleet from "../../../../testing/buildFleet.js";
import { machines } from "../../../../testing/machines.js";
import type { DataTableColumn } from "../../_work_in_progress/DataTable/index.js";
import { DataCards } from "../../_work_in_progress/DataViews/common/DataCards/index.js";
import { DataViews } from "../../_work_in_progress/DataViews/index.js";
import type { DisplayField } from "../DisplayField/index.js";
import RendererSwitch from "./RendererSwitch.js";
import type { RendererChoice } from "./types.js";

const renderers: readonly RendererChoice[] = [
  { id: "table", label: "Table", content: <p>the table</p> },
  { id: "cards", label: "Cards", content: <p>the cards</p> },
];

const tree = <RendererSwitch label="Show machines as" renderers={renderers} />;

describe("RendererSwitch on the server", () => {
  it("draws the first renderer alone, named, and offers no choice", () => {
    const markup = renderToString(tree);
    expect(markup).toContain('aria-label="Table"');
    expect(markup).toContain("the table");
    expect(markup).not.toContain("the cards");
    expect(markup).not.toContain('role="group"');
    expect(markup).not.toContain("<button");
  });
});

describe("a composition of renderers on the server", () => {
  it("draws the first renderer over the provider, with the baseline it keeps", () => {
    // One declaration serves both renderers: a column is a display field
    // with what only a table adds, so the cards take the same list.
    const columns: readonly DataTableColumn[] = [
      { id: "name", header: "Host", sortable: true },
      { id: "status", header: "Status" },
    ];
    const fields: readonly DisplayField[] = columns;
    const provider = createDataViewsProvider({
      collection: machines,
      source: createArraySource({ rows: buildFleet(9), collection: machines }),
      location: createMemoryLocation({ href: "/machines?status=failed" }),
    });
    provider.refresh();
    const markup = renderToString(
      <DataViews provider={provider}>
        <RendererSwitch
          label="Show machines as"
          renderers={[
            {
              id: "table",
              label: "Table",
              content: (
                <DataViews.DataTable
                  columns={columns}
                  label="Machines"
                  selectable
                />
              ),
            },
            {
              id: "cards",
              label: "Cards",
              content: (
                <DataCards
                  fields={fields}
                  title="name"
                  label="Machines as cards"
                  selectable
                />
              ),
            },
          ]}
        />
      </DataViews>,
    );
    // The first renderer alone is drawn, so no record's checkbox, link or
    // status is repeated in the page.
    const regions = markup.split('data-renderer="').slice(1);
    expect(regions).toHaveLength(1);
    const [table = ""] = regions;
    expect(table).toContain('aria-label="Table"');
    expect(table).toContain('role="table"');
    expect(markup).not.toContain('aria-label="Machines as cards"');
    // It draws the query: every third machine of nine failed.
    expect(table).toContain("host-003");
    expect(table).toContain("host-009");
    expect(table).not.toContain("host-002");
    // It keeps its own baseline: native checkboxes, one per record and one
    // for the page.
    expect(table.match(/type="checkbox"/g)).toHaveLength(4);
    // The table's headings are real links to the ordering they lead to.
    expect(table).toContain("sort=name__asc");
    // And nothing offers a choice that would do nothing without scripts.
    expect(markup).not.toContain('role="group"');
    expect(markup).not.toContain("<button");
  });
});
