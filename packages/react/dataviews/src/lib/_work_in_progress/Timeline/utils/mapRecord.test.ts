import { describe, expect, it } from "vitest";
import type { TimelineDecoration, TimelineFieldMapping } from "../types.js";
import mapRecord from "./mapRecord.js";

type Activity = {
  readonly id: string;
  readonly at: unknown;
  readonly who?: unknown;
  readonly whoName?: unknown;
  readonly kind?: unknown;
  readonly summary?: unknown;
};

const mapping: TimelineFieldMapping = {
  dateTime: "at",
  actorId: "who",
  actorName: "whoName",
  eventType: "kind",
  description: "summary",
};

const activity = (overrides: Partial<Activity> = {}): Activity => ({
  id: "a-1",
  at: "2024-06-15T12:00:00Z",
  who: "jane",
  whoName: "Jane Doe",
  kind: "comment",
  summary: "Left a comment",
  ...overrides,
});

describe("mapRecord", () => {
  it("reads each mapped part from its field, under the row's identity", () => {
    expect(mapRecord(activity(), "a-1", mapping)).toEqual({
      id: "a-1",
      dateTime: "2024-06-15T12:00:00Z",
      actorId: "jane",
      actorName: "Jane Doe",
      eventType: "comment",
      description: "Left a comment",
    });
  });

  it("spells a number part as text", () => {
    expect(mapRecord(activity({ who: 42 }), "a-1", mapping).actorId).toBe("42");
  });

  it("leaves out a part whose field holds no text, or blank text", () => {
    const item = mapRecord(
      activity({ who: { id: "jane" }, whoName: "  ", kind: undefined }),
      "a-1",
      mapping,
    );
    expect(item).not.toHaveProperty("actorId");
    expect(item).not.toHaveProperty("actorName");
    expect(item).not.toHaveProperty("eventType");
  });

  it("reads no part the mapping does not name", () => {
    expect(mapRecord(activity(), "a-1", { dateTime: "at" })).toEqual({
      id: "a-1",
      dateTime: "2024-06-15T12:00:00Z",
    });
  });

  it("reads only the record's own fields", () => {
    expect(
      mapRecord(activity(), "a-1", { dateTime: "at", description: "toString" }),
    ).not.toHaveProperty("description");
  });

  it("writes a date the core reads from a Date or epoch milliseconds as ISO 8601", () => {
    const at = Date.UTC(2024, 5, 15, 12);
    expect(mapRecord(activity({ at }), "a-1", mapping).dateTime).toBe(
      "2024-06-15T12:00:00.000Z",
    );
    expect(
      mapRecord(activity({ at: new Date(at) }), "a-1", mapping).dateTime,
    ).toBe("2024-06-15T12:00:00.000Z");
  });

  it("keeps a calendar date as the date it names", () => {
    expect(
      mapRecord(activity({ at: "2024-06-15" }), "a-1", mapping).dateTime,
    ).toBe("2024-06-15");
  });

  it("leaves the date empty where the core reads no instant", () => {
    for (const at of ["2024-06-15T12:00", "2024-02-30", "soon", null]) {
      expect(mapRecord(activity({ at }), "a-1", mapping).dateTime).toBe("");
    }
  });

  it("extends the event by what decorate adds, over the mapped parts", () => {
    const item = mapRecord(activity(), "a-1", mapping, (record, rowId) => ({
      description: `${String(record.summary)} on ${rowId}`,
      marker: { initials: "JD" },
    }));
    expect(item.description).toBe("Left a comment on a-1");
    expect(item.marker).toEqual({ initials: "JD" });
  });

  it("refuses a decoration naming the event's identity or date", () => {
    for (const key of ["id", "dateTime"]) {
      const decorate = () =>
        ({ [key]: "other" }) as unknown as TimelineDecoration;
      expect(() => mapRecord(activity(), "a-1", mapping, decorate)).toThrow(
        'decorate names the id or the dateTime of the event "a-1", which its record decides',
      );
    }
  });
});
