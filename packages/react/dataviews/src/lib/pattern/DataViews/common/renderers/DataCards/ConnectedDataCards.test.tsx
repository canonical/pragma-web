import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  buildMachine,
  createMachineProvider,
  machines,
  silenceRenderErrors,
} from "../../../../../../../testing/index.js";
import type { DisplayField } from "../../../../../common/index.js";
import DataViews from "../../../Provider.js";
import { createColumns } from "../DataTable/index.js";
import DataCards from "./ConnectedDataCards.js";

const fields: readonly DisplayField[] = [
  { id: "name", header: "Name" },
  { id: "status", header: "Status" },
];

describe("DataViews DataCards", () => {
  it("renders the enclosing root's records as cards", () => {
    const { provider } = createMachineProvider({
      rows: [
        buildMachine("m-1", "alpha"),
        buildMachine("m-2", "beta", "failed"),
      ],
    });
    render(
      <DataViews provider={provider}>
        <DataCards fields={fields} title="name" label="Machines" />
      </DataViews>,
    );
    const list = within(
      screen.getByRole("region", { name: "Machines" }),
    ).getByRole("list");
    expect(
      within(list)
        .getAllByRole("listitem")
        .map((card) => card.textContent?.startsWith("alpha") === true),
    ).toEqual([true, false]);
    expect(
      within(list).getByRole("listitem", { name: "beta" }),
    ).toBeInTheDocument();
    expect(
      within(list).getByRole("listitem", { name: "beta" }),
    ).toHaveTextContent("failed");
  });

  it("throws outside a DataViews root, naming the part", () => {
    silenceRenderErrors();
    expect(() =>
      render(<DataCards fields={fields} title="name" label="Machines" />),
    ).toThrow("DataViews.DataCards must be used inside a DataViews root");
  });

  it("names each card from a record typed by its fields", () => {
    const { provider } = createMachineProvider({
      rows: [buildMachine("m-1", "alpha")],
    });
    render(
      <DataViews provider={provider}>
        <DataCards
          fields={createColumns({
            collection: machines,
            columns: [{ field: "name", header: "Name" }],
          })}
          title="name"
          label="Machines"
          getRowLabel={(row) => `${row.name} (${row.status})`}
        />
      </DataViews>,
    );
    expect(
      screen.getByRole("listitem", { name: "alpha (running)" }),
    ).toBeInTheDocument();
  });
});
