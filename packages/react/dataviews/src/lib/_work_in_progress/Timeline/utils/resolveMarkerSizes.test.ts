import { describe, expect, it } from "vitest";
import resolveMarkerSizesWithItems from "./resolveMarkerSizes.js";

const resolveMarkerSizes = (
  ...args: Parameters<typeof resolveMarkerSizesWithItems>
) => resolveMarkerSizesWithItems(...args).map(({ size }) => size);

const event = (actorId?: string, eventType?: string) => ({
  ...(actorId === undefined ? {} : { actorId }),
  ...(eventType === undefined ? {} : { eventType }),
});

describe("resolveMarkerSizes", () => {
  it("gives every event the one size a single-size combination names", () => {
    const events = [event("jane", "comment"), event("john", "approval")];
    expect(resolveMarkerSizes(events, "large")).toEqual(["large", "large"]);
    expect(resolveMarkerSizes(events, "medium")).toEqual(["medium", "medium"]);
    expect(resolveMarkerSizes(events, "small")).toEqual(["small", "small"]);
  });

  it("gives the first event of each actor's run the larger of two sizes", () => {
    const events = [
      event("jane", "comment"),
      event("jane", "comment"),
      event("john", "comment"),
    ];
    expect(resolveMarkerSizes(events, "large-medium")).toEqual([
      "large",
      "medium",
      "large",
    ]);
    expect(resolveMarkerSizes(events, "large-small")).toEqual([
      "large",
      "small",
      "large",
    ]);
    expect(resolveMarkerSizes(events, "medium-small")).toEqual([
      "medium",
      "small",
      "medium",
    ]);
  });

  it("sizes type runs within each actor's run with all sizes", () => {
    const events = [
      event("jane", "comment"),
      event("jane", "comment"),
      event("jane", "approval"),
      event("jane", "approval"),
      event("john", "comment"),
      event("john", "comment"),
    ];
    expect(resolveMarkerSizes(events, "all-sizes")).toEqual([
      "large",
      "medium",
      "medium",
      "small",
      "large",
      "medium",
    ]);
  });

  it("ends an actor's run at an event without an actor", () => {
    const events = [event("jane"), event(), event("jane")];
    expect(resolveMarkerSizes(events, "large-medium")).toEqual([
      "large",
      "medium",
      "large",
    ]);
  });

  it("ends a type run at an event without a type", () => {
    const events = [
      event(undefined, "comment"),
      event(undefined, "comment"),
      event(),
      event(undefined, "comment"),
    ];
    expect(resolveMarkerSizes(events, "all-sizes")).toEqual([
      "medium",
      "small",
      "small",
      "medium",
    ]);
  });

  it("lets an event's own marker size win over the combination", () => {
    const events = [
      { ...event("jane", "comment"), marker: { size: "small" as const } },
      event("john", "comment"),
    ];
    expect(resolveMarkerSizes(events, "all-sizes")).toEqual(["small", "large"]);
    expect(resolveMarkerSizes(events, "large")).toEqual(["small", "large"]);
  });

  it("pairs each size with the event it sizes", () => {
    const events = [event("jane"), event("john")];
    expect(
      resolveMarkerSizesWithItems(events, "large").map(({ item }) => item),
    ).toEqual(events);
  });

  it("sizes nothing on an empty page", () => {
    expect(resolveMarkerSizes([], "all-sizes")).toEqual([]);
  });
});
