import { render, screen, within } from "@testing-library/react";
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
    const table = screen.getByRole("table", { name: "Machines" });
    expect(table).toHaveTextContent("alpha");
    const footer = table.nextElementSibling;
    if (!(footer instanceof HTMLElement)) {
      throw new Error("expected a footer after the table");
    }
    expect(footer).toHaveClass("footer");
    expect(
      within(footer).getByRole("navigation", { name: "Pagination" }),
    ).toBeInTheDocument();
  });
});
