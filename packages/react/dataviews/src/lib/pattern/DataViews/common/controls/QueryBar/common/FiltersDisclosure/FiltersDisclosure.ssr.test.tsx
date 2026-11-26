import { createMemoryLocation } from "@canonical/dataviews-core";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createMachineProvider } from "../../../../../../../../../testing/index.js";
import DataViews from "../../../../../../../_work_in_progress/DataViews/Provider.js";
import FiltersDisclosure from "./FiltersDisclosure.js";

describe("FiltersDisclosure SSR", () => {
  it("sends a closed disclosure around a GET form that keeps the search", () => {
    const location = createMemoryLocation({
      href: "/machines?status=failed&q=alder",
    });
    const { provider } = createMachineProvider({ location });
    const html = renderToString(
      <DataViews provider={provider}>
        <FiltersDisclosure applied={1} />
      </DataViews>,
    );
    expect(html).toMatch(
      /^<details class="ds data-views-query-bar-filters-disclosure">/,
    );
    expect(html).toContain("<summary");
    expect(html).toContain("Filters (1)");
    expect(html).toContain('method="get"');
    expect(html).toContain('type="hidden" name="q" value="alder"');
  });
});
