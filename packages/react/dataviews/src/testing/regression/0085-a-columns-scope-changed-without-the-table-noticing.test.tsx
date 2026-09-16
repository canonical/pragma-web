/**
 * The columns are read by content, so a caller rebuilding its list changes
 * nothing; the content key compared ids, fields, sizing, sorting and
 * resizing, and not a column's narrowing, row header or hideability. A caller that narrowed a
 * column's scope, made it the row header or fixed its hideability while
 * keeping the same ids got the old columns back, and the table drew the old
 * scope and no row header.
 *
 * The key reads every member the rendered tree reads.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  createInstanceProvider,
  MIXED_FLEET,
} from "../../../testing/instances.js";
import { DataTable } from "../../lib/_work_in_progress/DataTable/index.js";

describe("a column's scope or header changed with its id kept", () => {
  it("is drawn as changed", () => {
    const { provider } = createInstanceProvider({ rows: MIXED_FLEET });
    const view = render(
      <DataTable
        provider={provider}
        columns={[
          { id: "name", header: "Name" },
          { id: "status", header: "Status" },
        ]}
        label="Instances"
      />,
    );
    expect(screen.queryByRole("rowheader")).toBeNull();
    expect(
      screen.getByRole("columnheader", { name: "Status" }),
    ).not.toHaveAccessibleDescription();
    view.rerender(
      <DataTable
        provider={provider}
        columns={[
          { id: "name", header: "Name", rowHeader: true },
          { id: "status", header: "Status", appliesTo: ["virtual-machine"] },
        ]}
        label="Instances"
      />,
    );
    expect(screen.getAllByRole("rowheader")).toHaveLength(4);
    expect(
      screen.getByRole("columnheader", { name: "Status" }),
    ).toHaveAccessibleDescription("Applies to virtual-machine");
  });
});
