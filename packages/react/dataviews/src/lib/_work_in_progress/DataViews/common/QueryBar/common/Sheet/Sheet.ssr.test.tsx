import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createMachineProvider } from "../../../../../../../../testing/index.js";
import DataViews from "../../../../Provider.js";
import { useQueryGroup, useSheetAnnouncer } from "../../hooks/index.js";
import Sheet from "./Sheet.js";

/** The sheet's server markup over the machines, in memory. */
const renderSheet = (query: string): string => {
  const { provider } = createMachineProvider({
    snapshot: { query, presentation: {} },
  });
  function Connected(): React.ReactElement {
    const group = useQueryGroup({ provider: provider as never });
    const { regionRef, announce } = useSheetAnnouncer({ announce: () => {} });
    return (
      <Sheet
        id="sheet"
        group={group}
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
});
