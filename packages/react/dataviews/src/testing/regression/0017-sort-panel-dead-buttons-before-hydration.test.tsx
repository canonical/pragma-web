/**
 * Regression: the sort panel sends no button before it works.
 *
 * Before the fix, a server render of a root carrying the panel sent a Move
 * up, a Move down and a Remove button for every term, none of which did
 * anything until scripts ran — and, without scripts, never would.
 */

import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import buildMachine from "../../../testing/buildMachine.js";
import createMachineProvider from "../../../testing/createMachineProvider.js";
import declareMachineOrdering from "../../../testing/declareMachineOrdering.js";
import { DataViews } from "../../lib/_work_in_progress/DataViews/index.js";

describe("regression 0017 — the sort panel sent dead buttons before hydration", () => {
  it("lists the terms without their buttons on the server", () => {
    const { provider } = createMachineProvider({
      rows: [buildMachine("m-1", "alpha")],
      capabilities: declareMachineOrdering(null),
    });
    provider.setSort([{ field: "name", direction: "asc" }]);
    const markup = renderToString(
      <DataViews provider={provider}>
        <DataViews.SortPanel />
      </DataViews>,
    );
    expect(markup).toContain("name, ascending");
    expect(markup).not.toContain("<button");
  });
});
