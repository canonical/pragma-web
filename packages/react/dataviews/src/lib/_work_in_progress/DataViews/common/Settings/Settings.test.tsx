import { assertInvariant } from "@canonical/dataviews-core/bindings";
/**
 * DataViews.Settings in its table: the settings cell holding the menu, every
 * change written to the presentation and announced, nothing asked of the
 * source, at least one column always shown, and — without scripts — real
 * links whose destinations draw the arrangement the enhanced menu makes.
 */

import {
  createMemoryLocation,
  type QueryLocation,
} from "@canonical/dataviews-core";
import { createRecordingLocation } from "@canonical/dataviews-core/testing";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  onTestFinished,
  vi,
} from "vitest";
import buildMachine from "../../../../../../testing/buildMachine.js";
import createMachineProvider from "../../../../../../testing/createMachineProvider.js";
import createMemoryViewStore from "../../../../../../testing/createMemoryViewStore.js";
import declareMachineOrdering from "../../../../../../testing/declareMachineOrdering.js";
import expectNoAxeViolations from "../../../../../../testing/expectNoAxeViolations.js";
import fakeAnnouncerClock from "../../../../../../testing/fakeAnnouncerClock.js";
import installPopoverStandIn from "../../../../../../testing/installPopoverStandIn.js";
import openMenuFrom from "../../../../../../testing/openMenuFrom.js";
import readAnnouncements from "../../../../../../testing/readAnnouncements.js";
import type { MachineProvider } from "../../../../../../testing/types.js";
import waitForFocus from "../../../../../../testing/waitForFocus.js";
import waitForFrames from "../../../../../../testing/waitForFrames.js";
import { DataTable, type DataTableColumn } from "../../../DataTable/index.js";
import DataViews from "../../Provider.js";

const columns: readonly DataTableColumn[] = [
  { id: "name", header: "Name", hideable: false },
  { id: "status", header: "Status", sortable: true },
  { id: "cores", header: "Cores", sortable: true },
];

/** A provider over one machine, ordering by every field. */
const createProvider = (location?: QueryLocation) =>
  createMachineProvider({
    rows: [buildMachine("m-1", "alpha")],
    capabilities: declareMachineOrdering(null),
    ...(location === undefined ? {} : { location }),
  });

/** The composition a reader meets: a root, its table, the settings in it. */
const Composition = ({
  provider,
  declared = columns,
}: {
  readonly provider: MachineProvider;
  readonly declared?: readonly DataTableColumn[];
}) => (
  <DataViews provider={provider}>
    <DataViews.DataTable
      columns={declared}
      label="Machines"
      settings={<DataViews.Settings />}
    />
  </DataViews>
);

/**
 * The one table drawn. The reads below are scoped to it, or to the open
 * menu: a role query over the whole document checks every element's role,
 * name and visibility, and the cases that draw many arrangements would spend
 * most of their time there.
 */
const findTable = (): HTMLElement => {
  const table = document.querySelector<HTMLElement>("table");
  if (table === null) {
    throw new Error("expected a table");
  }
  return table;
};

/** The headings of the columns shown, in their order. */
const listShown = (): readonly (string | null)[] =>
  Array.from(
    findTable().querySelectorAll("th[aria-labelledby]"),
    (cell) =>
      document.getElementById(cell.getAttribute("aria-labelledby") ?? "")
        ?.textContent ?? null,
  );

/**
 * The settings menu's trigger, read within the settings cell: within the
 * whole table, the query would name every sort and column-options button.
 */
const findTrigger = (): HTMLElement => {
  const cell = findTable().querySelector<HTMLElement>(
    ".ds.data-table-settings-cell",
  );
  if (cell === null) {
    throw new Error("expected the table's settings cell");
  }
  return within(cell).getByRole("button", { name: "Table settings" });
};

/** Choose one item from the settings menu. */
const choose = async (name: string): Promise<void> => {
  const menu = await openMenuFrom(findTrigger());
  fireEvent.click(within(menu).getByRole("menuitem", { name }));
};

/** What the table last announced, once what was just said has been spoken. */
const readAnnouncement = async (): Promise<string | null> =>
  (await readAnnouncements()).at(-1) ?? null;

describe("DataViews.Settings", () => {
  let uninstallPopovers: () => void;
  beforeAll(() => {
    uninstallPopovers = installPopoverStandIn();
  });
  afterAll(() => {
    uninstallPopovers();
  });

  it("throws outside a table's settings cell", () => {
    const { provider } = createProvider();
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    onTestFinished(() => {
      errors.mockRestore();
    });
    expect(() =>
      render(
        <DataViews provider={provider}>
          <DataViews.Settings />
        </DataViews>,
      ),
    ).toThrow("DataViews.Settings must be used as a DataTable's settings");
  });

  it("ends the header in a settings cell holding the menu, and a table without it has none", () => {
    const { provider } = createProvider();
    const view = render(<Composition provider={provider} />);
    const cell = findTrigger().closest("th");
    expect(cell).toHaveClass("ds", "data-table-settings-cell");
    // Last in the header row, after every column's heading.
    expect(cell?.parentElement?.lastElementChild).toBe(cell);
    // Its one control is the menu's button, named for the settings.
    expect(
      within(assertInvariant(cell, "the trigger sits in a cell")).getByRole(
        "button",
      ),
    ).toBe(findTrigger());
    view.unmount();
    render(
      <DataTable provider={provider} columns={columns} label="Machines" />,
    );
    expect(
      document.querySelector(".ds.data-table-settings-cell"),
    ).not.toBeInTheDocument();
  });

  it("works in a standalone table, with no root", async () => {
    const { provider } = createProvider();
    render(
      <DataTable
        provider={provider}
        columns={columns}
        label="Machines"
        settings={<DataViews.Settings />}
      />,
    );
    await choose("Hide Cores");
    expect(listShown()).toEqual(["Name", "Status"]);
  });

  it("hides a column, announces it and returns focus to its button, asking the source for nothing", async () => {
    fakeAnnouncerClock();
    const recording = createRecordingLocation({ href: "/machines" });
    const { provider, source } = createProvider(recording.location);
    render(<Composition provider={provider} />);
    const requests = source.calls.length;
    const writes = recording.writes.length;
    const slice = provider.state.get().slice;
    await choose("Hide Status");
    expect(listShown()).toEqual(["Name", "Cores"]);
    expect(await readAnnouncement()).toBe("Status hidden");
    await waitForFocus(findTrigger());
    expect(provider.presentation.state.get().presentation).toEqual({
      "table.hidden": ["status"],
    });
    // Presentation only: no request, no location write, the same query.
    expect(source.calls).toHaveLength(requests);
    expect(recording.writes).toHaveLength(writes);
    expect(provider.state.get().slice).toBe(slice);
  });

  it("shows a hidden column, announcing where it now stands", async () => {
    fakeAnnouncerClock();
    const { provider } = createProvider();
    render(<Composition provider={provider} />);
    await choose("Hide Status");
    await readAnnouncement();
    await choose("Show Status");
    expect(listShown()).toEqual(["Name", "Status", "Cores"]);
    expect(await readAnnouncement()).toBe("Status shown, position 2 of 3");
    await waitForFocus(findTrigger());
  });

  it("moves a column, announcing where it now stands each time", async () => {
    fakeAnnouncerClock();
    const { provider } = createProvider();
    render(<Composition provider={provider} />);
    await choose("Move Cores left");
    expect(listShown()).toEqual(["Name", "Cores", "Status"]);
    expect(await readAnnouncement()).toBe("Cores moved to position 2 of 3");
    await waitForFocus(findTrigger());
    await choose("Move Cores left");
    expect(listShown()).toEqual(["Cores", "Name", "Status"]);
    // The same kind of words again are a new announcement, unaltered.
    expect(await readAnnouncement()).toBe("Cores moved to position 1 of 3");
  });

  it("keeps a column shown: the last one shown cannot be hidden, and an unhideable one says so", async () => {
    fakeAnnouncerClock();
    const { provider } = createProvider();
    render(<Composition provider={provider} />);
    await choose("Name is always shown");
    expect(await readAnnouncement()).toBe("Name is always shown");
    expect(listShown()).toEqual(["Name", "Status", "Cores"]);
    const hideable: readonly DataTableColumn[] = [
      { id: "status", header: "Status" },
      { id: "cores", header: "Cores" },
    ];
    const other = createProvider();
    const view = render(
      <Composition provider={other.provider} declared={hideable} />,
    );
    const table = within(view.container);
    await openMenuFrom(table.getByRole("button", { name: "Table settings" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Hide Status" }));
    await openMenuFrom(table.getByRole("button", { name: "Table settings" }));
    const hideLast = screen.getByRole("menuitem", { name: "Hide Cores" });
    expect(hideLast).toHaveClass("disabled");
    fireEvent.click(hideLast);
    expect(other.provider.presentation.state.get().presentation).toEqual({
      "table.hidden": ["status"],
    });
  });

  it("offers no reset with nothing to clear, leaving the menu open", async () => {
    const { provider } = createProvider();
    render(<Composition provider={provider} />);
    await openMenuFrom(findTrigger());
    const reset = screen.getByRole("menuitem", {
      name: "Reset table settings",
    });
    expect(reset).toHaveClass("disabled");
    fireEvent.click(reset);
    // A disabled item leaves the menu open.
    expect(reset).toBeInTheDocument();
    expect(provider.presentation.state.get().presentation).toEqual({});
  });

  /**
   * A composition over a recording location with Status hidden, Cores moved
   * left and Name widened, the reset still to choose. Answers the provider,
   * its source and the location's record.
   */
  const renderArranged = async () => {
    const recording = createRecordingLocation({ href: "/machines" });
    const { provider, source } = createProvider(recording.location);
    render(<Composition provider={provider} />);
    await choose("Hide Status");
    await choose("Move Cores left");
    act(() => {
      provider.presentation.arrange({ "table.width.name": 240 });
    });
    return { provider, source, recording };
  };

  it("resets widths, order and hidden columns, announcing it and returning focus to its button", async () => {
    fakeAnnouncerClock();
    const { provider } = await renderArranged();
    await readAnnouncement();
    await choose("Reset table settings");
    expect(listShown()).toEqual(["Name", "Status", "Cores"]);
    expect(provider.presentation.state.get().presentation).toEqual({});
    expect(await readAnnouncement()).toBe("Table settings reset");
    await waitForFocus(findTrigger());
  });

  it("resets the arrangement asking the source for nothing", async () => {
    const { provider, source, recording } = await renderArranged();
    const requests = source.calls.length;
    const writes = recording.writes.length;
    const slice = provider.state.get().slice;
    await choose("Reset table settings");
    expect(provider.presentation.state.get().presentation).toEqual({});
    expect(source.calls).toHaveLength(requests);
    expect(recording.writes).toHaveLength(writes);
    expect(provider.state.get().slice).toBe(slice);
  });

  it("resets the columns a followed link chose, back to the arrangement declared", async () => {
    const { provider } = createProvider(
      createMemoryLocation({ href: "/machines?table.hidden=status" }),
    );
    render(<Composition provider={provider} />);
    expect(listShown()).toEqual(["Name", "Cores"]);
    await choose("Reset table settings");
    expect(listShown()).toEqual(["Name", "Status", "Cores"]);
    expect(provider.presentation.state.get().presentation).toEqual({});
  });

  it("works under StrictMode's doubled effects: one announcement, focus on its button", async () => {
    fakeAnnouncerClock();
    const { provider } = createProvider();
    render(
      <StrictMode>
        <Composition provider={provider} />
      </StrictMode>,
    );
    await choose("Hide Status");
    expect(listShown()).toEqual(["Name", "Cores"]);
    expect(await readAnnouncement()).toBe("Status hidden");
    await waitForFocus(findTrigger());
  });

  it("hides columns in the arrangement a saved view remembers", async () => {
    const { store } = createMemoryViewStore();
    /** A provider over one machine keeping its views in the shared store. */
    const createViewer = () => {
      const { provider } = createMachineProvider({
        rows: [buildMachine("m-1", "alpha")],
        capabilities: declareMachineOrdering(null),
        views: store,
      });
      const { views } = provider;
      if (views === null) {
        throw new Error("a provider given a view store keeps saved views");
      }
      return { provider, views };
    };
    const author = createViewer();
    const authoring = render(<Composition provider={author.provider} />);
    await choose("Hide Status");
    const created = await act(() => author.views.saveAs("Without status"));
    if (created.status !== "saved") {
      throw new Error(`the view was not saved: ${created.status}`);
    }
    expect(created.view.presentation).toEqual({ "table.hidden": ["status"] });
    authoring.unmount();
    // Another viewer, holding no change of their own, sees every column until
    // the view is opened: only the view can hide Status for them.
    const reader = createViewer();
    render(<Composition provider={reader.provider} />);
    expect(listShown()).toEqual(["Name", "Status", "Cores"]);
    await act(() => reader.views.open(created.view.id));
    expect(listShown()).toEqual(["Name", "Cores"]);
    // The view holds no change of the reader's own to reset.
    await openMenuFrom(findTrigger());
    expect(
      screen.getByRole("menuitem", { name: "Reset table settings" }),
    ).toHaveClass("disabled");
  });

  it("has no axe violations with the menu closed and open", async () => {
    const { provider } = createProvider();
    const view = render(<Composition provider={provider} />);
    await choose("Hide Status");
    await expectNoAxeViolations(view.container);
    await openMenuFrom(findTrigger());
    await expectNoAxeViolations(document.body);
  });

  describe("without scripts, as scripts take over", () => {
    /** Server markup of the composition, over a location standing on `href`. */
    const renderMarkup = (href: string): string =>
      renderToString(
        <Composition
          provider={createProvider(createMemoryLocation({ href })).provider}
        />,
      );

    /** Each link's destination in server markup, by its text. */
    const listLinks = (markup: string): ReadonlyMap<string, string> => {
      const container = document.createElement("div");
      container.innerHTML = markup;
      return new Map(
        [...container.querySelectorAll("[popover] a[href]")].map((link) => [
          link.textContent ?? "",
          link.getAttribute("href") ?? "",
        ]),
      );
    };

    /** The columns a provider standing on a destination shows, in order. */
    const listShownAt = (destination: string): readonly (string | null)[] => {
      const { provider } = createProvider(
        createMemoryLocation({ href: `/machines${destination}` }),
      );
      const view = render(
        <DataTable provider={provider} columns={columns} label="Machines" />,
      );
      const shown = listShown();
      view.unmount();
      return shown;
    };

    /** The arrangements a reader may stand on as the page loads. */
    const startingArrangements = [
      "/machines?status=running",
      "/machines?table.hidden=status",
      "/machines?table.order=cores&table.hidden=status",
      "/machines?table.hidden=cores&table.order=cores&table.order=status",
    ];

    /** Every link each starting arrangement's server markup offers. */
    const offeredLinks = startingArrangements.flatMap((href) =>
      [...listLinks(renderMarkup(href))].map(([name, destination]) => ({
        href,
        name,
        destination,
      })),
    );

    it("offers links from every starting arrangement", () => {
      for (const href of startingArrangements) {
        expect(
          offeredLinks.some((link) => link.href === href),
          href,
        ).toBe(true);
      }
    });

    // One case a link, so each draws two tables, whatever the count.
    it.each(offeredLinks)(
      "leads $name from $href to the arrangement the menu's own item makes",
      async ({ href, name, destination }) => {
        const { provider } = createProvider(createMemoryLocation({ href }));
        const view = render(<Composition provider={provider} />);
        await choose(name);
        const enhanced = listShown();
        view.unmount();
        expect(listShownAt(destination)).toEqual(enhanced);
      },
    );

    // The case above compares every link the starting arrangements offer,
    // so the shows, the move across a hidden column and the reset offered
    // here are each compared there.
    it("offers a show, a move across a hidden column and the reset among the starting arrangements' links", () => {
      const offered = new Set(
        startingArrangements.flatMap((href) => [
          ...listLinks(renderMarkup(href)).keys(),
        ]),
      );
      for (const name of [
        "Show Status",
        "Show Cores",
        "Move Status right",
        "Reset table settings",
      ]) {
        expect(offered).toContain(name);
      }
    });

    it("hydrates what the server drew, keeping focus in the open menu", async () => {
      const href = "/machines?status=running";
      const markup = renderMarkup(href);
      const container = document.createElement("div");
      container.innerHTML = markup;
      document.body.append(container);
      const errors = vi.spyOn(console, "error").mockImplementation(() => {});
      let root: ReturnType<typeof hydrateRoot> | null = null;
      onTestFinished(() => {
        act(() => {
          root?.unmount();
        });
        container.remove();
        errors.mockRestore();
      });
      // The popover opens with no script, and the reader moves to a link.
      fireEvent.click(
        within(container).getByRole("button", { name: "Table settings" }),
      );
      const link = within(container).getByRole("link", {
        name: "Hide Status",
        hidden: true,
      });
      link.focus();
      await act(async () => {
        root = hydrateRoot(
          container,
          <Composition
            provider={createProvider(createMemoryLocation({ href })).provider}
          />,
        );
      });
      expect(errors).not.toHaveBeenCalled();
      // Focus stays in the menu, now driven by scripts, not on the page.
      await waitForFrames(
        () =>
          container
            .querySelector('[role="menu"]')
            ?.contains(document.activeElement) || null,
        "focus inside the open menu",
      );
    });
  });
});
