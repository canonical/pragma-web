import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import createGraphBudget from "./createGraphBudget.js";
import useGraphBudget from "./hooks/useGraphBudget.js";
import GraphBudgetProvider from "./Provider.js";

/** Prints the drawn-node budget in force. */
const DrawnNodes = (): ReactElement => (
  <p>{`drawn ${useGraphBudget().drawnNodesMax}`}</p>
);

describe("GraphBudgetProvider", () => {
  it("hands the site's budget to every useGraphBudget below it", () => {
    render(
      <GraphBudgetProvider budget={createGraphBudget({ drawnNodesMax: 24 })}>
        <DrawnNodes />
      </GraphBudgetProvider>,
    );
    expect(screen.getByText("drawn 24")).toBeInTheDocument();
  });

  it("hands the defaults when given no budget", () => {
    render(
      <GraphBudgetProvider>
        <DrawnNodes />
      </GraphBudgetProvider>,
    );
    expect(screen.getByText("drawn 40")).toBeInTheDocument();
  });
});
