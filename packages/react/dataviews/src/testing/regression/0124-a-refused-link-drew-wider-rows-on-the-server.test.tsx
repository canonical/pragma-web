/**
 * Regression: a server render of a link with a refused filter draws the
 * same outcome the browser does, with nothing wider than the link.
 *
 * Before the fix, the server decoded `?status=melted`, left the refused
 * clause out and drew every machine, as if the link had asked for them,
 * with the refusal on `issues` and on no screen. Now the server withholds
 * the query as the browser does: the table's status says the link could
 * not be followed and why, and the filters list the clause, with a link
 * that clears it. Every other link drawn — a sort heading, the search
 * form's hidden fields — keeps the refused clause, so following it widens
 * nothing; the filters' own form leaves it out, since submitting it is the
 * reader's removal.
 */

import {
  createDataViewsProvider,
  createMemoryLocation,
} from "@canonical/dataviews-core";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import buildMachine from "../../../testing/buildMachine.js";
import buildPage from "../../../testing/buildPage.js";
import createManualSource from "../../../testing/createManualSource.js";
import { MACHINE_CAPABILITIES, machines } from "../../../testing/machines.js";
import DataViews from "../../lib/_work_in_progress/DataViews/Provider.js";

describe("regression 0124 — a refused link drew wider rows on the server", () => {
  it("draws the refused outcome and the list, and asks the source for nothing", () => {
    const { source, calls } = createManualSource({
      capabilities: MACHINE_CAPABILITIES,
      answer: () => buildPage([buildMachine("m-1", "alpha")]),
    });
    const provider = createDataViewsProvider({
      collection: machines,
      source,
      location: createMemoryLocation({ href: "/machines?status=melted" }),
    });
    // What a server render does before rendering.
    provider.refresh();
    const html = renderToString(
      <DataViews provider={provider}>
        <DataViews.Search label="Search machines" />
        <DataViews.Filters />
        <DataViews.DataTable
          columns={[{ id: "name", header: "Name", sortable: true }]}
          label="Machines"
        />
      </DataViews>,
    );
    expect(calls).toHaveLength(0);
    expect(html).toContain('data-status="refused"');
    expect(html).toContain(
      "This link could not be followed: &quot;melted&quot; is not an option of &quot;status&quot;.",
    );
    expect(html).toContain("Not applied from the link");
    expect(html).toContain('href="?"');
    expect(html).not.toContain("alpha");
    // The heading's sort link keeps the refused clause.
    expect(html).toMatch(/href="\?status=melted&amp;sort=name__asc[^"]*"/);
    // So does the search form; the filters' form leaves it out.
    const forms = html.split("<form").slice(1);
    const [search = "", filters = ""] = forms;
    expect(search).toContain('type="hidden" name="status" value="melted"');
    expect(filters).not.toContain('name="status" value="melted"');
  });
});
