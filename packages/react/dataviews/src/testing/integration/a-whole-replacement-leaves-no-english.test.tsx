/**
 * An application replacing the whole record through the root's `messages`
 * leaves no English: not in what a server renders before any script runs —
 * the table's sort links and settings disclosure, the filters' form, the
 * saved views' notice — nor in what the page shows once scripts take over,
 * the action bar and the table's menus included.
 */

import { createMemoryLocation } from "@canonical/dataviews-core";
import { resolveMessages } from "@canonical/dataviews-core/bindings";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type { ReactElement } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, onTestFinished } from "vitest";
import buildMachine from "../../../testing/buildMachine.js";
import createMachineProvider from "../../../testing/createMachineProvider.js";
import createMemoryViewStore from "../../../testing/createMemoryViewStore.js";
import createTokenMessages from "../../../testing/createTokenMessages.js";
import declareMachineOrdering from "../../../testing/declareMachineOrdering.js";
import findEnglish from "../../../testing/findEnglish.js";
import type { MachineProvider } from "../../../testing/types.js";
import type { DataTableColumn } from "../../lib/_work_in_progress/DataTable/index.js";
import { DataViews } from "../../lib/_work_in_progress/DataViews/index.js";

const english = resolveMessages();

/**
 * A whole replacement: every message a token naming it. Built from the
 * English record's own keys, so it is whole by construction; the type's
 * compile-time wholeness is pinned beside the record.
 */
const whole = createTokenMessages(english);

const columns: readonly DataTableColumn[] = [
  { id: "name", header: "Name", sortable: true, resizable: true },
  { id: "status", header: "Status", sortable: true, hideable: false },
  { id: "cores", header: "Cores" },
];

/** A provider over two machines, standing on a location, keeping views. */
const createProvider = (): MachineProvider =>
  createMachineProvider({
    rows: [
      buildMachine("m-1", "alpha"),
      buildMachine("m-2", "beta", "failed", 8),
    ],
    capabilities: declareMachineOrdering(2),
    location: createMemoryLocation({ href: "/machines?sort=name" }),
    views: createMemoryViewStore().store,
  }).provider;

/** Every part of the composition, over one provider, in the whole replacement. */
const Composition = ({
  provider,
}: {
  readonly provider: MachineProvider;
}): ReactElement => (
  <DataViews provider={provider} messages={whole}>
    <DataViews.Search />
    <DataViews.Filters />
    <DataViews.SortPanel />
    <DataViews.SavedViews />
    <DataViews.Actions />
    <DataViews.DataTable
      columns={columns}
      label="Machines"
      selectable
      settings={<DataViews.Settings />}
    />
    <DataViews.Pagination />
  </DataViews>
);

/**
 * Render the composition, and wait for its saved views to be listed: what
 * the page shows once scripts run is what it settles on. Answers the
 * element the composition was rendered into.
 */
const renderListed = async (
  provider: MachineProvider,
): Promise<HTMLElement> => {
  const { container } = render(<Composition provider={provider} />);
  await waitFor(() => {
    expect(provider.views?.state.get().listing.status).toBe("ready");
  });
  return container;
};

describe("a whole replacement leaves no English", () => {
  it("in what a server renders before any script runs", () => {
    const html = renderToString(<Composition provider={createProvider()} />);
    const container = document.createElement("div");
    container.innerHTML = html;
    // The replacement's words are there, where English was.
    expect(html).toContain("‹search›");
    expect(html).toContain("‹tableSettings›");
    expect(findEnglish(container, english)).toEqual([]);
  });

  it("through a hydration of the server's own markup", async () => {
    const provider = createProvider();
    const markup = renderToString(<Composition provider={provider} />);
    const container = document.createElement("div");
    container.innerHTML = markup;
    document.body.append(container);
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const root = await act(async () =>
      hydrateRoot(container, <Composition provider={createProvider()} />),
    );
    // Registered as soon as there is something to undo, so a failed
    // expectation below still leaves the document as it was found.
    onTestFinished(() => {
      act(() => {
        root.unmount();
      });
      container.remove();
      errors.mockRestore();
    });
    expect(errors.mock.calls).toEqual([]);
    expect(findEnglish(container, english)).toEqual([]);
    expect(container.textContent).toContain("‹filters›");
  });

  it("in the feedback beside a bound the schema refuses", async () => {
    await renderListed(createProvider());
    const bound = screen.getByLabelText("‹filterFrom›");
    fireEvent.change(bound, { target: { value: "-5" } });
    // The feedback is there to read: the control is described by it.
    expect(bound).toHaveAccessibleDescription(/\S/);
    expect(findEnglish(document.body, english)).toEqual([]);
  });

  it("in the settings menu its button opens", async () => {
    await renderListed(createProvider());
    fireEvent.click(screen.getByRole("button", { name: "‹tableSettings›" }));
    expect(screen.getByRole("menu")).toBeVisible();
    expect(findEnglish(document.body, english)).toEqual([]);
  });

  it("in the saved views' rename and delete panels, over an open view", async () => {
    const provider = createProvider();
    await renderListed(provider);
    const { views } = provider;
    if (views === null) {
      throw new Error("a provider given a view store keeps saved views");
    }
    // Rename and delete act on the open view: one is saved and opened.
    const saved = await act(() => views.saveAs("Wide"));
    expect(saved.status).toBe("saved");
    fireEvent.click(screen.getByRole("button", { name: "‹renameView›" }));
    expect(screen.getByRole("form", { name: "‹renameForm›" })).toBeVisible();
    expect(findEnglish(document.body, english)).toEqual([]);
    fireEvent.click(screen.getByRole("button", { name: "‹deleteView›" }));
    expect(screen.getByText("‹deleteForm›")).toBeVisible();
    expect(findEnglish(document.body, english)).toEqual([]);
  });

  it("in what the page shows once scripts run, with rows selected and a menu open", async () => {
    const provider = createProvider();
    const container = await renderListed(provider);
    act(() => {
      provider.selection.add(["m-1"]);
    });
    const [trigger] = screen.getAllByRole("button", {
      name: "‹columnOptions›",
    });
    if (trigger === undefined) {
      throw new Error("the table offers no column menu");
    }
    fireEvent.click(trigger);
    expect(
      await screen.findByRole("menuitem", { name: "‹sortAscending›" }),
    ).toBeVisible();
    expect(findEnglish(container, english)).toEqual([]);
    expect(findEnglish(document.body, english)).toEqual([]);
  });
});
