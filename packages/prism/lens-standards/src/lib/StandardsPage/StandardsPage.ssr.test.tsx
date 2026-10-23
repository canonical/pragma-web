/**
 * The whole index page on the server: a warm store renders the lens heading
 * and the composed index to static markup, with no fetch and no client
 * script.
 */

import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createFetchSpy from "../../../testing/createFetchSpy.js";
import createStandardsPage from "../../../testing/createStandardsPage.js";
import { STANDARDS_BINDING_FIXTURE } from "../../../testing/fixtures.js";
import standardsIndexRecords from "../../../testing/records/standardsIndexRecords.js";
import { StandardsPage } from "./index.js";

describe("StandardsPage on the server", () => {
  it("renders the lens heading and the grouped index", () => {
    const fetchFn = createFetchSpy();
    const html = renderToString(
      createStandardsPage(
        "/standards",
        standardsIndexRecords,
        fetchFn,
        <StandardsPage classUri={STANDARDS_BINDING_FIXTURE.classUri} />,
      ),
    );
    expect(html).toContain('id="lens-standards-title"');
    // The compact identity beside each link, and the absolute IRI in the
    // href: both, because they are different strings.
    expect(html).toContain("cs:code.array.safe_access");
    expect(html).toContain(
      "/standards/http%3A%2F%2Fpragma.canonical.com%2Fcodestandards%23code.array.safe_access",
    );
    expect(fetchFn).not.toHaveBeenCalled();
  });
});
