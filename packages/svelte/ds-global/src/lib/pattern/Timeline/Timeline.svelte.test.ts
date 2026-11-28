import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-svelte";
import Component from "./Timeline.svelte";
import {
  actorEvent,
  conditionalEvents,
  contentWithTestId,
  criticalityEvent,
  datetimeEvent,
  eventWithTestId,
  orderedEvent,
  singleEvent,
  snippetMetadataEvent,
  twoEvents,
} from "./test.fixtures.svelte";

describe("Timeline", () => {
  it("renders children", async () => {
    const page = await render(Component, { children: twoEvents });
    await expect.element(page.getByText("Event 1")).toBeInTheDocument();
    await expect.element(page.getByText("Event 2")).toBeInTheDocument();
  });

  it("applies ds timeline class", async () => {
    const page = await render(Component, {
      children: singleEvent,
      "data-testid": "timeline",
    });
    await expect
      .element(page.getByTestId("timeline"))
      .toHaveClass("ds", "timeline");
  });

  it("applies custom className", async () => {
    const page = await render(Component, {
      children: singleEvent,
      class: "custom",
      "data-testid": "timeline",
    });
    await expect
      .element(page.getByTestId("timeline"))
      .toHaveClass("ds", "timeline", "custom");
  });

  it("renders Content with correct class", async () => {
    const page = await render(Component, { children: contentWithTestId });
    await expect
      .element(page.getByTestId("content"))
      .toHaveClass("ds", "timeline-content");
  });

  it("renders Event with correct class", async () => {
    const page = await render(Component, { children: eventWithTestId });
    await expect
      .element(page.getByTestId("event"))
      .toHaveClass("ds", "timeline-event");
  });

  it("renders Event with actor", async () => {
    const page = await render(Component, { children: actorEvent });
    await expect.element(page.getByText("John Doe")).toBeInTheDocument();
  });

  it("renders Event with datetime", async () => {
    const page = await render(Component, { children: datetimeEvent });
    const datetime = page.getByText("2024-01-15");
    await expect.element(datetime).toBeInTheDocument();
    expect(datetime.element().tagName).toBe("TIME");
  });

  it("renders snippets as the actor and the datetime", async () => {
    const page = await render(Component, { children: snippetMetadataEvent });
    expect(page.getByText("Snippet actor").element().tagName).toBe("STRONG");
    expect(page.getByText("Snippet time").element().parentElement).toHaveClass(
      "datetime",
    );
  });

  it("renders Event with criticality modifier", async () => {
    const page = await render(Component, { children: criticalityEvent });
    await expect.element(page.getByTestId("event")).toHaveClass("warning");
  });

  it("hides the marker from assistive technology", async () => {
    const page = await render(Component, { children: eventWithTestId });
    const marker = page.getByTestId("event").element().querySelector(".marker");
    expect(marker).toHaveAttribute("aria-hidden", "true");
  });

  it("maintains DOM order: actor, datetime, payload", async () => {
    const page = await render(Component, { children: orderedEvent });
    const content = page
      .getByTestId("event")
      .element()
      .querySelector(".content");
    const children = content?.children;
    expect(children?.[0]).toHaveClass("actor");
    expect(children?.[1]).toHaveClass("datetime");
    expect(children?.[2]).toHaveClass("payload");
  });

  it("accepts conditional events in Timeline.Content", async () => {
    const page = await render(Component, { children: conditionalEvents });
    await expect.element(page.getByText("Event 1")).toBeInTheDocument();
    await expect.element(page.getByText("Event 2")).not.toBeInTheDocument();
  });
});
