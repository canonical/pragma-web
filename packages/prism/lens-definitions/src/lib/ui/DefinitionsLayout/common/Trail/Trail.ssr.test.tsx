import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createFetchSpy from "../../../../../../testing/createFetchSpy.js";
import createStripHarness from "../../../../../../testing/createStripHarness.js";
import { Trail } from "./index.js";

describe("Trail SSR", () => {
  it("renders the trail without the store", () => {
    const fetchFn = createFetchSpy();
    const html = renderToString(
      createStripHarness(
        "/definitions/ds%3AUIBlock",
        undefined,
        fetchFn,
        <Trail />,
      ),
    );
    expect(html).toContain("ds:UIBlock");
    expect(fetchFn).not.toHaveBeenCalled();
  });
});
