/**
 * Regression: a column's own content that reads another field of its
 * record draws again when that field moves, though its own did not.
 */

import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, onTestFinished } from "vitest";
import {
  createWorkloadProvider,
  elementAt,
  WORKLOAD_RECORDS,
} from "../../../testing/index.js";
import { DataTable } from "../../lib/pattern/DataViews/common/renderers/DataTable/index.js";

const web = elementAt(WORKLOAD_RECORDS, 0);

describe("regression 0131 — a cell drawing another field went stale when that field moved", () => {
  it("draws the record's other field as it now stands", () => {
    const { provider, source } = createWorkloadProvider([web]);
    onTestFinished(provider.observe());
    render(
      <DataTable
        provider={provider}
        columns={[
          {
            id: "name",
            header: "Name",
            cell: ({ value, record }) =>
              `${String(value)} on ${record.type === "container" ? record.image : "none"}`,
          },
        ]}
        label="Workloads"
      />,
    );
    expect(screen.getByRole("cell")).toHaveTextContent("web on ubuntu/24.04");
    act(() => {
      source.setRows([{ ...web, type: "container", image: "alpine" }]);
      provider.refresh();
    });
    expect(screen.getByRole("cell")).toHaveTextContent("web on alpine");
  });
});
