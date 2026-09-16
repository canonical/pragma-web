/**
 * A column's own content is rendered when its own field's value changes,
 * and handed the record as it stood then. Content that read another field
 * off that record — the polymorphic recipe's "Runs from" column read a
 * container's image while subscribed to its type — went stale when the other
 * field moved, and the recipe contradicted the guarantee written beside the
 * props it used.
 *
 * Content that draws more of the record than its field subscribes to the
 * record through the cell scope, and this pins that doing so follows a move.
 */
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { pageOf } from "../../../testing/fixtures.js";
import {
  container,
  createInstanceProvider,
  instances,
  virtualMachine,
} from "../../../testing/instances.js";
import createColumns from "../../lib/_work_in_progress/DataTable/createColumns.js";
import { DataTable } from "../../lib/_work_in_progress/DataTable/index.js";
import { useDataViewsCell, useDataViewsValue } from "../../lib/hooks/index.js";

/** What an instance runs from, subscribed to the record, not to one field. */
const RunsFrom = () => {
  const cell = useDataViewsCell(instances);
  const record = useDataViewsValue(cell.record);
  return <>{record.type === "container" ? record.image : record.firmware}</>;
};

describe("content drawing a field beside its own", () => {
  it("follows a move of that field", () => {
    const { provider, source } = createInstanceProvider();
    render(
      <DataTable
        provider={provider}
        columns={createColumns(instances, [
          { field: "name", header: "Name", rowHeader: true },
          { id: "kind", field: "type", header: "Runs from", cell: RunsFrom },
        ])}
        label="Instances"
      />,
    );
    const deliver = (image: string) => {
      act(() => {
        source.latest().deliver({
          status: "succeeded",
          page: pageOf([
            container("i-1", "web-01", image),
            virtualMachine("i-2", "db-01", "uefi"),
          ]),
        });
      });
    };
    deliver("ubuntu:22.04");
    expect(screen.getByRole("row", { name: "web-01" })).toHaveTextContent(
      "ubuntu:22.04",
    );
    act(() => {
      provider.refresh();
    });
    // The same record, its image moved and its type not: the content
    // follows, since it watches the record.
    deliver("ubuntu:24.04");
    expect(screen.getByRole("row", { name: "web-01" })).toHaveTextContent(
      "ubuntu:24.04",
    );
  });
});
