import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { UseDateTimeFormatsResult } from "../../hooks/index.js";
import type { TimelineItem } from "../../types.js";
import Event from "./Event.js";
import type { EventProps } from "./types.js";

const formats = (
  overrides: Partial<UseDateTimeFormatsResult> = {},
): UseDateTimeFormatsResult => ({
  mode: "absolute",
  toggle: () => {},
  toggleable: false,
  tooltip: false,
  format: (value) => ({ display: `on ${value}`, alternate: "earlier" }),
  ...overrides,
});

const item: TimelineItem = {
  id: "e-1",
  dateTime: "2024-06-15",
  actorId: "jane",
  actorName: "Jane Doe",
  description: "Left a comment",
};

const renderEvent = (overrides: Partial<EventProps> = {}) =>
  render(
    <Event
      item={item}
      markerSize="large"
      dateTimePosition="trailing"
      formats={formats()}
      {...overrides}
    />,
  );

const readEvent = (container: HTMLElement): Element => {
  const event = container.querySelector(".data-timeline-event");
  if (event === null) {
    throw new Error("no event drawn");
  }
  return event;
};

describe("Event", () => {
  it("draws the actor, the description and the date, in that order", () => {
    const { container } = renderEvent();
    const row = container.querySelector(".content > .row");
    expect(row?.textContent).toBe("Jane DoeLeft a commenton 2024-06-15");
    expect(container.querySelector("time")).toHaveAttribute(
      "datetime",
      "2024-06-15",
    );
  });

  it("names the actor by its identity where the record names no actor", () => {
    renderEvent({ item: { id: "e-1", dateTime: "", actorId: "jane" } });
    expect(screen.getByText("jane")).toHaveClass("actor");
  });

  it("links the actor's name, and keeps the marker's link out of the reading order", () => {
    const { container } = renderEvent({
      item: { ...item, actorLink: "/jane" },
    });
    expect(screen.getByRole("link", { name: "Jane Doe" })).toHaveAttribute(
      "href",
      "/jane",
    );
    expect(container.querySelector(".marker a")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("names the marker's link where the actor's name is not shown", () => {
    renderEvent({ item: { ...item, actorLink: "/jane", showName: false } });
    expect(screen.queryByText("Jane Doe")).toBeNull();
    expect(screen.getByRole("link", { name: "Jane Doe" })).toHaveClass("link");
  });

  it("leaves out each part the event turns off", () => {
    const { container } = renderEvent({
      item: {
        ...item,
        showName: false,
        showDescription: false,
        showDateTime: false,
      },
    });
    expect(container.querySelector(".content > .row")?.textContent).toBe("");
  });

  it("draws no date where the event has none, or the formats write none", () => {
    const { container, unmount } = renderEvent({
      item: { ...item, dateTime: "" },
    });
    expect(container.querySelector("time")).toBeNull();
    unmount();
    const written = renderEvent({
      formats: formats({ format: () => ({ display: "", alternate: "" }) }),
    });
    expect(written.container.querySelector("time")).toBeNull();
  });

  it("draws a leading date before the marker", () => {
    const { container } = renderEvent({ dateTimePosition: "leading" });
    const event = readEvent(container);
    expect(event.firstElementChild?.tagName).toBe("TIME");
    expect(container.querySelector(".content time")).toBeNull();
  });

  it("switches every event's form from its date, pressed while relative", () => {
    const toggle = vi.fn();
    renderEvent({
      formats: formats({ toggleable: true, mode: "relative", toggle }),
    });
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(button);
    expect(toggle).toHaveBeenCalledOnce();
  });

  it("draws custom content beneath the event's own row", () => {
    const { container } = renderEvent({
      item: { ...item, customContent: <b>Diff</b> },
    });
    expect(container.querySelector(".content > .custom")).toHaveTextContent(
      "Diff",
    );
  });

  it("draws only the marker and the custom content of a fully custom event", () => {
    const { container } = renderEvent({
      item: { ...item, fullyCustom: true, customContent: <b>Diff</b> },
    });
    expect(container.querySelector(".content")).toBeNull();
    expect(container.querySelector(".custom.full")).toHaveTextContent("Diff");
    expect(screen.queryByText("Jane Doe")).toBeNull();
  });

  it("draws the description of a fully custom event that has no custom content", () => {
    const { container } = renderEvent({ item: { ...item, fullyCustom: true } });
    expect(container.querySelector(".custom.full")).toHaveTextContent(
      "Left a comment",
    );
  });

  it("draws its control first, in a fully custom event too", () => {
    const control = <input type="checkbox" aria-label="Select" />;
    const { container, unmount } = renderEvent({ control });
    expect(container.querySelector(".row")?.firstElementChild).toBe(
      screen.getByRole("checkbox"),
    );
    unmount();
    const custom = renderEvent({
      item: { ...item, fullyCustom: true },
      control,
    });
    expect(
      custom.container.querySelector(".custom.full")?.firstElementChild,
    ).toBe(screen.getByRole("checkbox"));
  });

  it("carries the event's criticality as a class", () => {
    const { container } = renderEvent({
      item: { ...item, criticality: "error" },
    });
    expect(readEvent(container)).toHaveClass(
      "ds",
      "data-timeline-event",
      "error",
    );
  });
});
