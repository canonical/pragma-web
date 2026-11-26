import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import FilterButton from "./FilterButton.js";

describe("FilterButton SSR", () => {
  it("renders a closed native popover and the host's GET form before scripts run", () => {
    const html = renderToString(
      <FilterButton label="Status" applied={1} appliedLabel="1 applied">
        <form method="get" action="/machines">
          <label>
            <input type="checkbox" name="status" value="deployed" /> Deployed
          </label>
          <button type="submit">Apply</button>
        </form>
      </FilterButton>,
    );
    expect(html).toContain('popover="auto"');
    expect(html).toMatch(/popovertarget="/i);
    expect(html).toContain('method="get"');
    expect(html).toContain('type="submit"');
    expect(html).not.toContain("aria-haspopup");
    expect(html).not.toContain('role="dialog"');
  });
});
