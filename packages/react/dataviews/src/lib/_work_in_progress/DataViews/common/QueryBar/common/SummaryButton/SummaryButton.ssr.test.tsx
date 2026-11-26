import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createMachineProvider } from "../../../../../../../../testing/index.js";
import DataViews from "../../../../Provider.js";
import { useQueryGroup } from "../../hooks/index.js";
import SummaryButton from "./SummaryButton.js";

describe("SummaryButton SSR", () => {
  it("sends a native invoker of the sheet, named with its count", () => {
    const { provider } = createMachineProvider({
      snapshot: { query: "status=running", presentation: {} },
    });
    function Connected(): React.ReactElement {
      const group = useQueryGroup({ provider: provider as never });
      return <SummaryButton group={group} sheetId="sheet" onShow={() => {}} />;
    }
    const html = renderToString(
      <DataViews provider={provider}>
        <Connected />
      </DataViews>,
    );
    expect(html).toContain('commandfor="sheet"');
    expect(html).toContain('command="show-modal"');
    expect(html).toContain('type="button"');
    expect(html).toMatch(/Filters(<!-- -->)?, (<!-- -->)?1 applied/);
  });
});
