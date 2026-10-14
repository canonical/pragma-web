import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  ACTIVITY_MAPPING,
  ACTIVITY_PAGE,
  createActivityProvider,
} from "../../../../../../testing/activities.js";
import silenceRenderErrors from "../../../../../../testing/silenceRenderErrors.js";
import DataViews from "../../Provider.js";
import { DataTable } from "../DataTable/index.js";
import Timeline from "./Timeline.js";

describe("DataViews Timeline", () => {
  it("renders the enclosing root's records as events, sharing its selection", () => {
    const { provider } = createActivityProvider({ rows: ACTIVITY_PAGE });
    render(
      <DataViews
        provider={provider}
        messages={{ selectRow: (name) => `Pick ${name}` }}
      >
        <Timeline mapping={ACTIVITY_MAPPING} label="Activity" selectable />
        <DataTable
          columns={[{ id: "summary", header: "Summary" }]}
          label="Activity table"
          selectable
          rowLabel={(row) => String(row["summary"])}
        />
      </DataViews>,
    );
    const region = screen.getByRole("region", { name: "Activity" });
    expect(within(region).getAllByRole("listitem")).toHaveLength(5);
    const [onEvent, inTable] = screen.getAllByRole("checkbox", {
      name: "Pick push a-4",
    });
    fireEvent.click(onEvent as HTMLElement);
    expect(inTable).toBeChecked();
  });

  it("throws outside a DataViews root, naming the part", () => {
    silenceRenderErrors();
    expect(() =>
      render(<Timeline mapping={ACTIVITY_MAPPING} label="Activity" />),
    ).toThrow("DataViews.Timeline must be used inside a DataViews root");
  });
});
