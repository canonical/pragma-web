import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import buildMachine from "./buildMachine.js";
import createMachineProvider from "./createMachineProvider.js";
import MachineComposition from "./MachineComposition.js";

describe("MachineComposition", () => {
  it("draws the search, the filters, the table and the pagination over one provider", () => {
    const { provider } = createMachineProvider({
      rows: [buildMachine("m-1", "alpha")],
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
