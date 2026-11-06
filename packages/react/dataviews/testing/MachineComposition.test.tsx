import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createMachineProvider from "./createMachineProvider.js";
import MachineComposition from "./MachineComposition.js";
import machine from "./machine.js";

describe("MachineComposition", () => {
  it("draws the search, the filters, the table and the pagination over one provider", () => {
    const { provider } = createMachineProvider({
      rows: [machine("m-1", "alpha")],
    });
    render(<MachineComposition provider={provider} />);
    expect(
      screen.getByRole("searchbox", { name: "Search machines" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Filters" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Machines" })).toHaveTextContent(
      "alpha",
    );
    expect(
      screen.getByRole("navigation", { name: "Pagination" }),
    ).toBeInTheDocument();
  });
});
