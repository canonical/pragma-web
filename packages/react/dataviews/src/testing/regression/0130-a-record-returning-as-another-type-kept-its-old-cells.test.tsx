/**
 * Regression: a record returning under its id as another type redraws the
 * cells whose applicability moved, though no field value it shows changed.
 */

import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, onTestFinished } from "vitest";
import {
  createWorkloadProvider,
  elementAt,
  WORKLOAD_RECORDS,
  WORKLOAD_RETYPED,
} from "../../../testing/index.js";
import { DataTable } from "../../lib/pattern/DataViews/common/renderers/DataTable/index.js";

const web = elementAt(WORKLOAD_RECORDS, 0);

describe("regression 0130 — a record returning as another type kept its old cells", () => {
  it("draws a dash once the field no longer applies, and the value once it does", () => {
    const { provider, source } = createWorkloadProvider([web]);
    onTestFinished(provider.observe());
    render(
      <DataTable
        provider={provider}
        columns={[{ id: "image", header: "Image" }]}
        label="Workloads"
      />,
    );
    expect(screen.getByRole("cell")).toHaveTextContent(/^ubuntu\/24\.04$/);
    act(() => {
      source.setRows([WORKLOAD_RETYPED]);
      provider.refresh();
    });
    expect(screen.getByRole("cell")).toHaveAccessibleName("Not applicable");
    act(() => {
      source.setRows([web]);
      provider.refresh();
    });
    expect(screen.getByRole("cell")).toHaveTextContent(/^ubuntu\/24\.04$/);
  });
});
