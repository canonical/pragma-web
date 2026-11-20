/**
 * Regression: a refused sort is spoken once.
 *
 * Before the fix each header held a polite live region of its own, so a
 * refusal was read twice: once from the header, once from the table's
 * announcement. The reason still stands beside the control, where a sighted
 * reader sees it, but the only live region a whole composition renders is
 * the root's announcer, and every region that speaks from a place of its own
 * says what belongs to that place and nothing of the refusal.
 */

import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import buildMachine from "../../../testing/buildMachine.js";
import createMachineProvider from "../../../testing/createMachineProvider.js";
import createMemoryViewStore from "../../../testing/createMemoryViewStore.js";
import declareMachineOrdering from "../../../testing/declareMachineOrdering.js";
import fakeAnnouncerClock from "../../../testing/fakeAnnouncerClock.js";
import readAnnouncements from "../../../testing/readAnnouncements.js";
import type { DataTableColumn } from "../../lib/_work_in_progress/DataTable/index.js";
import { DataViews } from "../../lib/_work_in_progress/DataViews/index.js";

const REFUSED = "Sort unchanged: this source orders by at most 1 term.";

const columns: readonly DataTableColumn[] = [
  { id: "name", header: "Name", sortable: true },
  { id: "status", header: "Status", sortable: true },
];

/**
 * A whole composition with Name sorted and a Shift-activated Status refused
 * over a source ordering by at most one term. Answers the reason beside the
 * Status header, found once by the button's role and name, and how many
 * announcements were spoken before the refusal.
 *
 * @note Impure: renders into the document and sorts the provider.
 */
const refuseInComposition = async (): Promise<{
  readonly reason: Element | null;
  readonly before: number;
}> => {
  const { provider } = createMachineProvider({
    rows: [buildMachine("m-1", "alpha")],
    capabilities: declareMachineOrdering(1),
    views: createMemoryViewStore().store,
  });
  render(
    <DataViews provider={provider}>
      <DataViews.Filters />
      <DataViews.SavedViews />
      <DataViews.DataTable columns={columns} label="Machines" />
      <DataViews.Pagination />
    </DataViews>,
  );
  const table = within(screen.getByRole("table", { name: "Machines" }));
  fireEvent.click(table.getByRole("button", { name: "Name" }));
  const before = (await readAnnouncements()).length;
  const status = table.getByRole("button", { name: "Status" });
  fireEvent.click(status, { shiftKey: true });
  const reason =
    status.closest("[role='columnheader']")?.querySelector(".sort-reason") ??
    null;
  return { reason, before };
};

beforeEach(() => {
  fakeAnnouncerClock();
});

describe("regression 0059 — a refusal was spoken twice", () => {
  it("leaves one live region in a whole composition: the root's announcer", async () => {
    await refuseInComposition();
    // One region the composition declares live itself: the root's announcer.
    // The places that speak for themselves are status regions, counted below.
    const live = Array.from(document.querySelectorAll("[aria-live]"));
    expect(live).toHaveLength(1);
    expect(live.at(0)).toHaveClass("ds", "data-views-announcer");
    // Nothing the composition renders is urgent.
    expect(document.querySelectorAll('[role="alert"]')).toHaveLength(0);
  });

  it("says nothing of the refusal from any place that speaks for itself", async () => {
    await refuseInComposition();
    // Every region speaking from a place of its own — the pagination
    // summary, the saved views' notice, a filter's feedback, each of them
    // live by its role — says nothing of the refusal.
    const places = Array.from(document.querySelectorAll('[role="status"]'));
    expect(places.length).toBeGreaterThan(0);
    for (const place of places) {
      expect(place.textContent ?? "").not.toContain(REFUSED);
    }
  });

  it("shows the refusal beside its header, and says it once through the announcer", async () => {
    const { reason, before } = await refuseInComposition();
    // The header shows it; the announcer is what speaks it.
    expect(reason).toHaveTextContent(REFUSED);
    expect(reason).not.toHaveAttribute("aria-live");
    expect(reason).not.toHaveAttribute("role", "status");
    expect((await readAnnouncements()).slice(before)).toEqual([REFUSED]);
  });
});
