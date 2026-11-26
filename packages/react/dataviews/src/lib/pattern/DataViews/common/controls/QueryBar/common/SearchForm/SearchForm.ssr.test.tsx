import { createMemoryLocation } from "@canonical/dataviews-core";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createMachineProvider } from "../../../../../../../../../testing/index.js";
import DataViews from "../../../../../Provider.js";
import SearchForm from "./SearchForm.js";

describe("SearchForm SSR", () => {
  it("sends every parameter but the search, a refused clause among them, as hidden fields", () => {
    const { provider } = createMachineProvider({
      location: createMemoryLocation({
        href: "/m?status=failed&status__isNone=melted&q=alder",
      }),
    });
    const html = renderToString(
      <DataViews provider={provider}>
        <SearchForm hasHref>
          <input type="search" name="q" defaultValue="alder" />
        </SearchForm>
      </DataViews>,
    );
    expect(html).toMatch(
      /^<form method="get" role="search"|^<form role="search"/,
    );
    expect(html).toContain('type="hidden" name="status" value="failed"');
    expect(html).toContain(
      'type="hidden" name="status__isNone" value="melted"',
    );
    expect(html).not.toContain('type="hidden" name="q"');
  });
});
