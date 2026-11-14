import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import renderDecorated from "../../../testing/renderDecorated.js";
import DataViews from "../../lib/_work_in_progress/DataViews/Provider.js";
import { machineCollection } from "../machines/index.js";
import withMachineRoot from "./withMachineRoot.js";

describe("withMachineRoot", () => {
  it("renders the story inside a root over the machines", async () => {
    renderDecorated(withMachineRoot(), () => (
      <DataViews.DataTable
        columns={[{ id: "name", header: "Host" }]}
        label="Machines"
      />
    ));
    expect(screen.getByRole("table", { name: "Machines" })).toBeInTheDocument();
    expect(
      await screen.findByRole("cell", { name: "alder.example.com" }),
    ).toBeInTheDocument();
  });

  it("builds the provider from the config, once", () => {
    const prepare = vi.fn();
    renderDecorated(withMachineRoot({ prepare }));
    expect(prepare).toHaveBeenCalledTimes(1);
    expect(prepare).toHaveBeenCalledWith(
      expect.objectContaining({ collection: machineCollection }),
    );
  });
});
