/**
 * The reading column on the server: header, class line and prose render to
 * static markup from a warm store, with no client script, the prose's
 * references already chips.
 */

import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createFetchSpy from "../../../testing/createFetchSpy.js";
import createStandardsPage from "../../../testing/createStandardsPage.js";
import {
  LINK_COMPONENT_CURIE,
  LINK_COMPONENT_URI,
  STANDARDS_BINDING_FIXTURE,
} from "../../../testing/fixtures.js";
import standardEntityRecords from "../../../testing/records/standardEntityRecords.js";
import { StandardReadingPage } from "../StandardReadingPage/index.js";

describe("StandardArticle on the server", () => {
  it("renders the reading column with its class line and its prose", () => {
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
    expect(html).toContain('data-slot="reading-canvas"');
    expect(html).toContain('class="ds standard-prose" lang="en"');
    expect(html.match(/class="ds node-chip"/g)).toHaveLength(2);
    expect(html).toContain(LINK_COMPONENT_CURIE);
    expect(html).toContain('<span class="class">class: CodeStandard</span>');
    expect(fetchFn).not.toHaveBeenCalled();
  });
});
