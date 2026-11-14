/**
 * Regression: a link a filter control draws over a refused link carries
 * only the refused clauses it leaves as they are.
 *
 * Before the fix, `?status=failed&status=melted` withheld the query for
 * `melted`, and every destination the host spelled carried the whole
 * `status` key. The none-of switch, drawn before scripts, moved the set to
 * `status__isNone=failed` and kept `status=failed&status=melted` beside it,
 * so following it applied both the set and its opposite. A destination that
 * changes a field's predicates replaces its refused clause, as the command
 * leading there does, and a carried key keeps only the values the applied
 * slice did not supply.
 */

import {
  createDataViewsProvider,
  createMemoryLocation,
  declareCapabilities,
} from "@canonical/dataviews-core";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createManualSource from "../../../testing/createManualSource.js";
import { COUNTED_EXACTLY } from "../../../testing/fixtures.js";
import { machines } from "../../../testing/machines.js";
import type { Machine } from "../../../testing/types.js";
import DataViews from "../../lib/_work_in_progress/DataViews/Provider.js";

describe("regression 0125 — a switch link kept a clause it replaced", () => {
  it("leads the none-of switch to the moved set alone", () => {
    const provider = createDataViewsProvider({
      collection: machines,
      source: createManualSource<Machine>({
        capabilities: declareCapabilities(machines, {
          filter: { status: ["isAny", "isNone"] },
          counts: COUNTED_EXACTLY,
        }),
      }).source,
      location: createMemoryLocation({
        href: "/machines?status=failed&status=melted",
      }),
    });
    const html = renderToString(
      <DataViews provider={provider}>
        <DataViews.Filters />
      </DataViews>,
    );
    const switches = [...html.matchAll(/href="(\?[^"]*status__isNone[^"]*)"/g)];
    expect(switches).toHaveLength(1);
    const [[, destination = ""] = []] = switches;
    const params = new URLSearchParams(destination.replaceAll("&amp;", "&"));
    expect(params.getAll("status__isNone")).toEqual(["failed"]);
    expect(params.has("status")).toBe(false);
  });
});
