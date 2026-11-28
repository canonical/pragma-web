import { render } from "@canonical/svelte-ssr-test";
import { describe, expect, it } from "vitest";
import Component from "./Timeline.svelte";
import {
  errorEvent,
  orderedEvent,
  singleEvent,
  twoPeopleEvents,
} from "./test.fixtures.svelte";

describe("Timeline SSR", () => {
  it("renders without errors on server", () => {
    const page = render(Component, { props: { children: twoPeopleEvents } });
    const html = page.container.innerHTML;
    expect(html).toContain("John");
    expect(html).toContain("Jane");
    expect(html).toContain("Created document");
    expect(html).toContain('class="ds timeline"');
  });

  it("renders subcomponents with correct classes on server", () => {
    const page = render(Component, { props: { children: singleEvent } });
    const html = page.container.innerHTML;
    expect(html).toContain('class="ds timeline-content"');
    expect(html).toContain('class="ds timeline-event"');
  });

  it("renders Event with criticality on server", () => {
    const page = render(Component, { props: { children: errorEvent } });
    expect(page.container.innerHTML).toContain(
      'class="ds timeline-event error"',
    );
  });

  it("renders the same event markup as React", () => {
    const page = render(Component, { props: { children: orderedEvent } });
    const event = page.container.querySelector(".ds.timeline-event");
    expect(event?.innerHTML.replace(/<!--.*?-->/g, "")).toBe(
      '<div class="marker" aria-hidden="true"></div><div class="content"><div class="actor">Actor</div><time class="datetime">2024-01-01</time><div class="payload">Payload</div></div>',
    );
  });
});
