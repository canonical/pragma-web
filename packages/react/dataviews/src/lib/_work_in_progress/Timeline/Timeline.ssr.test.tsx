/**
 * On the server, a timeline is plain list markup carrying the events of the
 * URL's query, in its order, with native checkboxes: nothing a reader needs
 * scripts for. A source that cannot answer within the call renders pending.
 */

import {
  createArraySource,
  createDataViewsProvider,
  createMemoryLocation,
} from "@canonical/dataviews-core";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  ACTIVITY_MAPPING,
  ACTIVITY_PAGE,
  activities,
  createActivityProvider,
} from "../../../../testing/activities.js";
import Timeline from "./Timeline.js";

describe("Timeline on the server", () => {
  it("draws the events of the URL's query, with native checkboxes and the dates written in the given zone", () => {
    const provider = createDataViewsProvider({
      collection: activities,
      source: createArraySource({
        rows: ACTIVITY_PAGE,
        collection: activities,
      }),
      location: createMemoryLocation({ href: "/activity?kind=push" }),
      facets: ["actor", "kind"],
    });
    provider.refresh();
    const markup = renderToString(
      <Timeline
        provider={provider}
        mapping={ACTIVITY_MAPPING}
        label="Activity"
        selectable
        dateTimeFormats={{ timeZone: "UTC" }}
      />,
    );
    expect(markup).toContain("push a-4");
    expect(markup).toContain("push a-5");
    expect(markup).not.toContain("comment a-1");
    expect(markup.indexOf("push a-4")).toBeLessThan(markup.indexOf("push a-5"));
    expect(markup).toMatch(/<input[^>]*type="checkbox"/u);
    expect(markup).toMatch(/datetime="2024-06-04T09:00:00Z"/iu);
    expect(markup).toMatch(/Jun 4, 2024, 9:00\sAM/u);
    expect(markup).not.toContain('role="tooltip"');
  });

  it("says it is loading where the source cannot answer within the call", () => {
    const { provider } = createActivityProvider();
    provider.refresh();
    const markup = renderToString(
      <Timeline
        provider={provider}
        mapping={ACTIVITY_MAPPING}
        label="Activity"
      />,
    );
    expect(markup).toContain('data-status="pending"');
    expect(markup).toContain('aria-busy="true"');
    expect(markup).not.toContain("<ol");
  });
});
