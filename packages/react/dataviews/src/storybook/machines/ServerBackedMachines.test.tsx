import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SERVER_BACKED_PARTS } from "./constants.js";
import createMachineSource from "./createMachineSource.js";
import ServerBackedMachines from "./ServerBackedMachines.js";

describe("ServerBackedMachines", () => {
  it("draws the search, the filters, the table and its pagination over one provider", async () => {
    render(<ServerBackedMachines source={createMachineSource} />);
    expect(
      screen.getByRole("searchbox", { name: SERVER_BACKED_PARTS.searchLabel }),
    ).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Filters" })).toBeInTheDocument();
    const table = screen.getByRole("table", {
      name: SERVER_BACKED_PARTS.tableLabel,
    });
    // The first page of five, from the source given.
    expect(await screen.findAllByRole("row")).toHaveLength(6);
    expect(table).toHaveAttribute("aria-busy", "false");
  });
});
