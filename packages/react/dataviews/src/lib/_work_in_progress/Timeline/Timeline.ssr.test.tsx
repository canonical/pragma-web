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

  it("draws its controls as links to the queries their changes lead to", () => {
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
        actorFilterLabel="Reviewer"
        eventFilterLabel="Activity"
      />,
    );
    expect(markup).toContain("Filter by:");
    expect(markup).toMatch(
      /<details class="menu"><summary class="trigger"><span class="trigger-content"><span class="label">Reviewer<\/span>/u,
    );
    expect(markup).toMatch(/<a href="\?actor=john[^"]*">John Roe<\/a>/u);
    expect(markup).toMatch(
      /<a href="\?[^"]*" aria-current="true"><svg[^>]*>.*?<\/svg>push<\/a>/u,
    );
    expect(markup).toMatch(
      /<a class="control" href="\?[^"]*" aria-label="Reset filters">/u,
    );
    expect(markup).toMatch(
      /<a class="control" href="\?[^"]*sort[^"]*" aria-label="Order by date">/u,
    );
    const header = markup.slice(
      markup.indexOf("data-timeline-header"),
      markup.indexOf('<ol class="events"'),
    );
    expect(header).not.toContain("<button");
    expect(header).not.toContain("<form");
  });
});
