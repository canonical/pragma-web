import { render, screen, within } from "@testing-library/react";
import type { RecordMap } from "relay-runtime/store/RelayStoreTypes.js";
import { describe, expect, it } from "vitest";
import createFetchSpy from "../../../../../../../testing/createFetchSpy.js";
import componentEntityRecordsButton from "../../../../__fixtures__/componentEntityRecordsButton.js";
import {
  BUTTON_URI,
  ENTITY_TEST_TIMEOUT_MS,
  entityPageAt,
} from "../../../../__fixtures__/entityPageHarness.js";

/** The button's change log record ids, in the graph's order. */
const LOG_ID = (position: number): string =>
  `client:https://ds.canonical.com/global.component.button:changeLogs:${position}`;

/** Button's records with its change log edited: `edits` by entry position. */
const recordsWithLog = (
  edits: Readonly<Record<number, Record<string, unknown>>>,
): RecordMap => {
  const records = structuredClone(
    componentEntityRecordsButton,
  ) as unknown as Record<string, Record<string, unknown>>;
  for (const [position, edit] of Object.entries(edits)) {
    const id = LOG_ID(Number(position));
    records[id] = { ...records[id], ...edit };
  }
  return records as unknown as RecordMap;
};

/** The changes section's entries, each as its parts' texts. */
const readEntries = () => {
  const section = screen.getByRole("region", { name: "Changes" });
  return [...section.querySelectorAll(".ds.component-changes > .entry")].map(
    (entry) => ({
      version: entry.querySelector(".version")?.textContent,
      summary: entry.querySelector(".summary")?.textContent,
      meta: entry.querySelector(".meta")?.textContent,
      dateTime: entry.querySelector("time")?.getAttribute("datetime"),
    }),
  );
};

describe("ComponentChanges", () => {
  it(
    "lists the entries newest first, each with its type and its day",
    () => {
      render(
        entityPageAt(
          BUTTON_URI,
          componentEntityRecordsButton,
          createFetchSpy(),
        ),
      );
      const entries = readEntries();
      expect(entries.map(({ meta }) => meta)).toEqual([
        "decision · 2026-03-06",
        "decision · 2026-02-20",
      ]);
      expect(entries.map(({ dateTime }) => dateTime)).toEqual([
        "2026-03-06T11:00:00.000+01:00",
        "2026-02-20T00:00:00.000+01:00",
      ]);
    },
    ENTITY_TEST_TIMEOUT_MS,
  );

  it(
    "orders by date whatever the graph's order",
    () => {
      render(
        entityPageAt(
          BUTTON_URI,
          recordsWithLog({
            0: { timestamp: "2025-01-01T00:00:00.000+01:00" },
          }),
          createFetchSpy(),
        ),
      );
      expect(readEntries().map(({ meta }) => meta)).toEqual([
        "decision · 2026-02-20",
        "decision · 2025-01-01",
      ]);
    },
    ENTITY_TEST_TIMEOUT_MS,
  );

  it(
    "shows the version in its own element and the summary before the change text",
    () => {
      render(
        entityPageAt(
          BUTTON_URI,
          recordsWithLog({
            0: { version: "1.2.0", summary: "A short summary." },
          }),
          createFetchSpy(),
        ),
      );
      const [first, second] = readEntries();
      expect(first).toMatchObject({
        version: "1.2.0",
        summary: "A short summary.",
      });
      expect(second?.version).toBeUndefined();
      expect(second?.summary).toContain("Decided to split the button");
    },
    ENTITY_TEST_TIMEOUT_MS,
  );

  it(
    "leaves out the parts the graph does not record",
    () => {
      render(
        entityPageAt(
          BUTTON_URI,
          recordsWithLog({
            0: { change: null, changeType: null, timestamp: null },
          }),
          createFetchSpy(),
        ),
      );
      const section = screen.getByRole("region", { name: "Changes" });
      const entry = section.querySelectorAll(".entry").item(1);
      expect(entry.querySelector(".summary")).toBeNull();
      expect(entry.querySelector(".meta")).toBeNull();
      expect(within(section).getAllByRole("listitem")).toHaveLength(2);
    },
    ENTITY_TEST_TIMEOUT_MS,
  );

  it(
    "names the change type alone when the entry has no date",
    () => {
      render(
        entityPageAt(
          BUTTON_URI,
          recordsWithLog({ 0: { timestamp: null } }),
          createFetchSpy(),
        ),
      );
      const metas = readEntries().map(({ meta }) => meta);
      expect(metas).toEqual(["decision · 2026-02-20", "decision"]);
    },
    ENTITY_TEST_TIMEOUT_MS,
  );
});
