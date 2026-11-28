import { createMemoryLocation } from "@canonical/dataviews-core";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createMachineProvider } from "../../../../../../../../../testing/index.js";
import DataViews from "../../../../../Provider.js";
import { useQueryGroup, useSheetAnnouncer } from "../../hooks/index.js";
import Sheet from "./Sheet.js";

/** The sheet's server markup over the machines, in memory or at an address. */
const renderSheet = (query: string, href?: string): string => {
  const { provider } = createMachineProvider(
    href === undefined
      ? { snapshot: { query, presentation: {} } }
      : { location: createMemoryLocation({ href }) },
  );
  function Connected(): React.ReactElement {
    const group = useQueryGroup(provider as never);
    const { regionRef, announce } = useSheetAnnouncer(() => {});
    return (
      <Sheet
        id="sheet"
        group={group}
        hasHref={href !== undefined}
        isOpen={false}
        onOpenChange={() => {}}
        regionRef={regionRef}
        announce={announce}
      />
    );
  }
  return renderToString(
    <DataViews provider={provider}>
      <Connected />
    </DataViews>,
  );
};

describe("Sheet SSR", () => {
  it("sends a closed dialog, its close buttons invokers, its chips inert", () => {
    const html = renderSheet("status=running");
    expect(html).toMatch(
      /^<dialog id="sheet" aria-labelledby="[^"]+" class="ds data-views-query-bar-sheet"><div class="frame modal">/,
    );
    expect(html).not.toContain(" open");
    expect(html).toContain('commandfor="sheet" command="close"');
    expect(html).toContain('aria-label="Close filters"');
    expect(html).toContain("Remove status is running");
    expect(html).toMatch(/class="remove"[^>]*disabled/);
    expect(html).toContain("Show results");
  });

  it("sends nothing that needs scripts: no Clear all, no filters, no region", () => {
    const html = renderSheet("status=running");
    expect(html).not.toContain("Clear all");
    expect(html).not.toContain("data-views-filters");
    expect(html).not.toContain('role="status"');
  });

  it("with an address, links each removal and Clear all, and submits the filters", () => {
    const html = renderSheet(
      "",
      "/m?status=melted&cores__gte=2&cores__lte=8&q=a",
    );
    const formId = /<form id="([^"]+)"[^>]*method="get"/.exec(html)?.[1];
    expect(formId).toBeDefined();
    expect(html).toContain(
      `<button class="ds button primary results" type="submit" form="${formId}">`,
    );
    expect(html).toContain("Apply filters");
    expect(html).not.toContain("Show results");
    // The range's removal keeps the search, and carries the refusal on.
    expect(html).toContain(
      'aria-label="Remove cores at least 2 and at most 8" href="?status=melted&amp;q=a&amp;page=1&amp;size=50"',
    );
    // The search's removal keeps the filters.
    expect(html).toContain(
      'aria-label="Remove Search for a" href="?status=melted&amp;cores__gte=2&amp;cores__lte=8&amp;page=1&amp;size=50"',
    );
    // The refused clause's clear drops it alone.
    expect(html).toMatch(
      /aria-label="Clear status" aria-describedby="[^"]+" href="\?cores__gte=2&amp;cores__lte=8&amp;q=a"/,
    );
    // Clear all drops every filter, the refused one too, and keeps the search.
    expect(html).toContain(
      '<a class="ds button tertiary" href="?q=a&amp;page=1&amp;size=50">Clear all</a>',
    );
  });
});
