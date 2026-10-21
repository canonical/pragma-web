/**
 * The whole reading page on the server: a warm store renders the breadcrumb
 * and the reading column to static markup, with no fetch and no client
 * script.
 */

import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createFetchSpy from "../../../testing/createFetchSpy.js";
import createStandardsPage from "../../../testing/createStandardsPage.js";
import {
  LINK_COMPONENT_URI,
  STANDARDS_BINDING_FIXTURE,
} from "../../../testing/fixtures.js";
import standardEntityRecords from "../../../testing/records/standardEntityRecords.js";
import { StandardReadingPage } from "./index.js";

describe("StandardReadingPage on the server", () => {
  it("renders the marker, the breadcrumb, the article and its prose", () => {
    const fetchFn = createFetchSpy();
    const html = renderToString(
      createStandardsPage(
        `/standards/${encodeURIComponent(LINK_COMPONENT_URI)}`,
        standardEntityRecords,
        fetchFn,
        <StandardReadingPage
          classUri={STANDARDS_BINDING_FIXTURE.classUri}
          params={{ uri: LINK_COMPONENT_URI }}
        />,
      ),
    );
    expect(html).toContain('data-view="standard-reading"');
    // The title is `_meta.title`, total, and for a standard with no
    // asserted name that is the IRI's local name.
    expect(html).toContain(
      '<h1 class="heading" id="standard-reading-title">react.component.link_component</h1>',
    );
    expect(html).toContain('aria-label="Breadcrumb"');
    expect(html).toContain('data-slot="reading-canvas"');
    expect(html).toContain(
      '<h2 id="user-content-why-one-prop">Why one prop</h2>',
    );
    expect(fetchFn).not.toHaveBeenCalled();
  });
});
