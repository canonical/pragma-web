/**
 * The announcer carries what has no place on screen, and nothing else. Every
 * outcome with a place of its own — the pagination summary, the table's
 * status row, a filter's feedback, the saved views' status — is spoken by
 * that place, in its own words, and the root's announcer stays silent, so a
 * reader hears each outcome once.
 */

import { createPage, DEFAULT_WINDOW } from "@canonical/dataviews-core";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import createMachineProvider from "../../../testing/createMachineProvider.js";
import createMemoryViewStore from "../../../testing/createMemoryViewStore.js";
import fakeAnnouncerClock from "../../../testing/fakeAnnouncerClock.js";
import machine from "../../../testing/machine.js";
import readAnnouncements from "../../../testing/readAnnouncements.js";
import type { Machine, MachineProvider } from "../../../testing/types.js";
import type { DataTableColumn } from "../../lib/_work_in_progress/DataTable/index.js";
import { DataViews } from "../../lib/_work_in_progress/DataViews/index.js";

const columns: readonly DataTableColumn[] = [
  { id: "name", header: "Name" },
  { id: "cores", header: "Cores" },
];

/** Every part that speaks from a place of its own, over one provider. */
const Composition = ({
  provider,
}: {
  readonly provider: MachineProvider;
}): ReactElement => (
  <DataViews provider={provider}>
    <DataViews.Filters />
    <DataViews.SavedViews />
    <DataViews.DataTable columns={columns} label="Machines" />
    <DataViews.Pagination sizes={[1, 5]} />
  </DataViews>
);

/**
 * The composition over a provider showing one row a page, with the first of
 * two machines delivered. Answers the provider and a way to answer the
 * source's latest request with one page of rows.
 *
 * @note Impure: renders into the document.
 */
const renderFirstPage = () => {
  const { provider, source } = createMachineProvider({
    snapshot: { query: "page=1&size=1", presentation: {} },
    views: createMemoryViewStore().store,
  });
  render(<Composition provider={provider} />);
  /** Answer the source's latest request with one page of `rows`. */
  const deliver = (rows: readonly Machine[]) => {
    act(() => {
      source.latest().deliver({
        status: "succeeded",
        page: createPage({ rows, matched: 2 }),
      });
    });
  };
  deliver([machine("m-1", "alpha")]);
  return { provider, source, deliver };
};

/** The pagination's own status region. */
const findSummary = (): HTMLElement =>
  within(screen.getByRole("navigation", { name: "Pagination" })).getByRole(
    "status",
  );

beforeEach(() => {
  fakeAnnouncerClock();
});

describe("the announcer never repeats a status", () => {
  it("leaves a page's arrival to the pagination summary", async () => {
    renderFirstPage();
    // One region for the root, and every assertion below reads it.
    expect(document.querySelectorAll(".ds.data-views-announcer")).toHaveLength(
      1,
    );
    expect(findSummary()).toHaveTextContent("Showing row 1 out of 2");
    expect(await readAnnouncements()).toEqual([]);
  });

  it("leaves a page turn to the pagination summary, from the same place", async () => {
    const { provider, deliver } = renderFirstPage();
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(provider.state.get().window).toEqual({
      ...DEFAULT_WINDOW,
      page: 2,
      size: 1,
    });
    deliver([machine("m-2", "beta", "failed", 8)]);
    expect(findSummary()).toHaveTextContent("Showing row 2 out of 2");
    expect(await readAnnouncements()).toEqual([]);
  });

  it("leaves a failed refresh to the status row, above the rows it kept", async () => {
    const { provider, source } = renderFirstPage();
    act(() => {
      provider.refresh();
    });
    act(() => {
      source.latest().deliver({
        status: "failed",
        failure: {
          reason: "the server is offline",
          cause: new Error("offline"),
          transient: null,
        },
      });
    });
    expect(
      screen.getByText(
        "These rows could not be refreshed: the server is offline",
      ),
    ).toBeInTheDocument();
    expect(await readAnnouncements()).toEqual([]);
  });

  it("leaves an edit the schema refuses to the control's own feedback", async () => {
    renderFirstPage();
    // What the feedback says is the schema's reason, worded by the record;
    // that it is said there, and nowhere else, is this case's subject.
    const bound = screen.getByLabelText("cores from");
    fireEvent.change(bound, { target: { value: "-5" } });
    // The feedback is the last thing the control is described by: a hint
    // describing the field stands before it.
    const describedBy = (bound.getAttribute("aria-describedby") ?? "").split(
      /\s+/,
    );
    const feedback = document.getElementById(describedBy.at(-1) ?? "");
    expect(feedback).toHaveAttribute("role", "status");
    expect(bound).toHaveAccessibleDescription(/\S/);
    expect(await readAnnouncements()).toEqual([]);
  });

  it("leaves a saved view to the saved views' own status", async () => {
    const { provider } = renderFirstPage();
    const views = provider.views;
    if (views === null) {
      throw new Error("a provider given a view store keeps saved views");
    }
    const saved = await act(() => views.saveAs("Busy"));
    expect(saved.status).toBe("saved");
    expect(screen.getByText('Saved "Busy".')).toBeInTheDocument();
    expect(await readAnnouncements()).toEqual([]);
  });

  it("says an outcome with no place on screen, so the silence above is the announcer keeping quiet", async () => {
    // The control: had the announcer nothing to say ever, the cases above
    // could never hear anything.
    renderFirstPage();
    fireEvent.click(
      screen.getByRole("button", { name: "Column options for Cores" }),
    );
    fireEvent.click(screen.getByRole("menuitem", { name: "Hide column" }));
    expect(await readAnnouncements()).toEqual(["Cores hidden"]);
  });
});
