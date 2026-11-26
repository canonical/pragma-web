/**
 * The sheet: a modal dialog over the applied clauses and the filters form,
 * which commits every change as it is made, says what each did through its
 * own status region, and moves focus on from what it removes.
 */
import { createMemoryLocation } from "@canonical/dataviews-core";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { type ReactElement, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  buildMachine,
  createMachineProvider,
} from "../../../../../../../../../testing/index.js";
import DataViews from "../../../../../../../_work_in_progress/DataViews/Provider.js";
import { useQueryGroup, useSheetAnnouncer } from "../../hooks/index.js";
import type { QueryGroupStandIn } from "../../types.js";
import { spellInvoker } from "../../utils/index.js";
import Sheet from "./Sheet.js";

/** Three machines, every request answered at once with them. */
const ROWS = [
  buildMachine("m1", "alder", "running", 2),
  buildMachine("m2", "birch", "failed", 4),
  buildMachine("m3", "cedar", "running", 8),
];

type MountConfig = {
  readonly query?: string;
  readonly href?: string;
  /** Changes to the group, such as a command that is refused. */
  readonly alter?: (group: QueryGroupStandIn) => QueryGroupStandIn;
  /** Extra props for the dialog. */
  readonly dialogProps?: object;
};

/** The sheet over the machines, with an opener, opened or not. */
const mount = ({ query, href, alter, dialogProps }: MountConfig = {}) => {
  const location =
    href === undefined ? undefined : createMemoryLocation({ href });
  const { provider } = createMachineProvider({
    rows: ROWS,
    ...(location === undefined ? {} : { location }),
    ...(query === undefined ? {} : { snapshot: { query, presentation: {} } }),
  });
  const onOpenChange = vi.fn();
  function Harness(): ReactElement {
    const group = useQueryGroup({ provider: provider as never });
    const root = { announce: vi.fn() };
    const { regionRef, announce } = useSheetAnnouncer({
      announce: root.announce,
    });
    const [isOpen, setOpen] = useState(false);
    return (
      <>
        <button
          type="button"
          {...spellInvoker("show-modal", "sheet")}
          onClick={() => setOpen(true)}
        >
          Filters
        </button>
        <Sheet
          {...dialogProps}
          id="sheet"
          group={alter === undefined ? group : alter(group)}
          hasHref={href !== undefined}
          isOpen={isOpen}
          onOpenChange={(next) => {
            onOpenChange(next);
            setOpen(next);
          }}
          regionRef={regionRef}
          announce={announce}
        />
      </>
    );
  }
  const view = render(
    <DataViews provider={provider}>
      <Harness />
    </DataViews>,
  );
  const dialog = view.container.querySelector("dialog") as HTMLDialogElement;
  const open = () => {
    const opener = screen.getByRole("button", { name: "Filters" });
    opener.focus();
    fireEvent.click(opener);
    return within(dialog);
  };
  const readRegion = () =>
    dialog.querySelector(".ds.data-views-announcer")?.textContent ?? "";
  return { provider, view, dialog, open, onOpenChange, readRegion };
};

describe("Sheet", () => {
  it("is a closed modal dialog, labelled by its title, its body not yet drawn", () => {
    const { dialog } = mount({ query: "status=running" });
    expect(dialog).toHaveAttribute("id", "sheet");
    expect(dialog).toHaveClass("ds", "data-views-query-bar-sheet");
    expect(dialog).not.toHaveClass("modal");
    expect(dialog.querySelector(":scope > .frame")).toHaveClass("modal");
    expect(dialog.open).toBe(false);
    expect(dialog.querySelector(".body")).toBeNull();
    const close = within(dialog).getByRole("button", {
      name: "Close filters",
      hidden: true,
    });
    expect(close).toHaveAttribute("commandfor", "sheet");
    expect(close).toHaveAttribute("command", "close");
  });

  it("opens on the chips, the filters, Clear all, the live count and its own region", async () => {
    const { dialog, open } = mount({
      query: "status=running&cores__gte=2&cores__lte=8&q=a",
    });
    const sheet = open();
    expect(dialog.open).toBe(true);
    expect(dialog).toHaveAccessibleName("Filter records");
    expect(sheet.getByRole("list", { name: "Applied filters" })).toBeVisible();
    expect(
      sheet.getByRole("button", { name: "Remove status is running" }),
    ).toBeInTheDocument();
    expect(
      sheet.getByRole("button", {
        name: "Remove cores at least 2 and at most 8",
      }),
    ).toBeInTheDocument();
    expect(
      sheet.getByRole("button", { name: "Remove Search for a" }),
    ).toBeInTheDocument();
    expect(sheet.getByRole("group", { name: "Filters" })).toBeInTheDocument();
    expect(sheet.getByRole("button", { name: "Clear all" })).toBeVisible();
    const results = await sheet.findByRole("button", {
      name: /^Show \d+ results?$/,
    });
    expect(results).toHaveAttribute("command", "close");
    const region = dialog.querySelector(".ds.data-views-announcer");
    expect(region).toHaveAttribute("role", "status");
    expect(region).toHaveAttribute("aria-atomic", "true");
  });

  it("reads Show results while no count is known", () => {
    const { provider } = createMachineProvider();
    function Harness(): ReactElement {
      const group = useQueryGroup({ provider: provider as never });
      const { regionRef, announce } = useSheetAnnouncer({ announce: vi.fn() });
      return (
        <Sheet
          id="sheet"
          group={group}
          hasHref={false}
          isOpen
          onOpenChange={() => {}}
          regionRef={regionRef}
          announce={announce}
        />
      );
    }
    render(
      <DataViews provider={provider}>
        <Harness />
      </DataViews>,
    );
    expect(
      screen.getByRole("button", { name: "Show results", hidden: true }),
    ).toBeInTheDocument();
  });

  it("moves focus from a removed chip to the next, else the previous, else the filters", async () => {
    const { provider, open, readRegion } = mount({
      query: "status=running&cores__gte=2&cores__lte=8&q=a",
    });
    const sheet = open();
    fireEvent.click(
      sheet.getByRole("button", { name: "Remove status is running" }),
    );
    expect(provider.state.get().slice.filter).toHaveLength(2);
    // The chips stand in the query's order: the range, status, the search.
    await waitFor(() =>
      expect(
        sheet.getByRole("button", { name: "Remove Search for a" }),
      ).toHaveFocus(),
    );
    await waitFor(() =>
      expect(readRegion()).toMatch(/^Removed status is running\./),
    );
    fireEvent.click(sheet.getByRole("button", { name: "Remove Search for a" }));
    expect(provider.state.get().slice.search).toBeNull();
    await waitFor(() =>
      expect(
        sheet.getByRole("button", {
          name: "Remove cores at least 2 and at most 8",
        }),
      ).toHaveFocus(),
    );
    fireEvent.click(
      sheet.getByRole("button", {
        name: "Remove cores at least 2 and at most 8",
      }),
    );
    expect(provider.state.get().slice.filter).toEqual([]);
    await waitFor(() =>
      expect(sheet.getByRole("checkbox", { name: "failed" })).toHaveFocus(),
    );
    expect(sheet.queryByRole("list", { name: "Applied filters" })).toBeNull();
  });

  it("adds a filter by the walk, focus moving to its new chip's remove control", async () => {
    const { provider, open, readRegion } = mount({ query: "cores__gte=2" });
    const sheet = open();
    fireEvent.click(sheet.getByRole("button", { name: "Add filter" }));
    fireEvent.keyDown(sheet.getByRole("option", { name: "status" }), {
      key: "Enter",
    });
    fireEvent.keyDown(sheet.getByRole("option", { name: /^is any of/ }), {
      key: "Enter",
    });
    fireEvent.keyDown(sheet.getByRole("option", { name: "failed" }), {
      key: " ",
    });
    fireEvent.click(sheet.getByRole("button", { name: "Add" }));
    expect(provider.state.get().slice.filter).toHaveLength(2);
    await waitFor(() =>
      expect(
        sheet.getByRole("button", { name: "Remove status is failed" }),
      ).toHaveFocus(),
    );
    await waitFor(() =>
      // Said together with the steps, all taken in one moment.
      expect(readRegion()).toContain("Added status is failed."),
    );
    // The sheet's own commit says its own outcome, not the results'.
    expect(readRegion()).not.toContain("Updated the results");
  });

  it("says the results a change in the filters form brings, and nothing once closed", async () => {
    const { provider, open, readRegion, dialog } = mount();
    const sheet = open();
    fireEvent.click(sheet.getByRole("checkbox", { name: "failed" }));
    expect(provider.state.get().slice.filter).toHaveLength(1);
    await waitFor(() =>
      expect(readRegion()).toMatch(/^Updated the results\. \d+ records?\./),
    );
    fireEvent.click(sheet.getByRole("button", { name: "Close filters" }));
    expect(dialog.querySelector(".ds.data-views-announcer")).toBeNull();
  });

  it("clears a refused parameter by its chip", async () => {
    const { provider, open } = mount({ href: "/m?status=melted&cores__gte=2" });
    const sheet = open();
    const chips = within(sheet.getByRole("list", { name: "Applied filters" }));
    fireEvent.click(chips.getByRole("button", { name: "Clear status" }));
    await waitFor(() =>
      expect(chips.queryByRole("button", { name: "Clear status" })).toBeNull(),
    );
    expect(provider.state.get().slice.filter).toHaveLength(1);
  });

  it("clears the filters with Clear all, keeping the search, focus on the filters", async () => {
    const { provider, open, readRegion } = mount({
      query: "status=running&q=a",
    });
    const sheet = open();
    fireEvent.click(sheet.getByRole("button", { name: "Clear all" }));
    expect(provider.state.get().slice.filter).toEqual([]);
    expect(provider.state.get().slice.search).toBe("a");
    await waitFor(() =>
      expect(sheet.getByRole("checkbox", { name: "failed" })).toHaveFocus(),
    );
    await waitFor(() => expect(readRegion()).toMatch(/^Cleared the filters\./));
  });

  it("says why a removal or Clear all was refused, and moves nothing", async () => {
    const refusing = (group: QueryGroupStandIn): QueryGroupStandIn => ({
      ...group,
      removePredicate: () => [{ reason: "busy" } as never],
      clear: () => [{ reason: "locked" } as never],
    });
    const { provider, open, readRegion } = mount({
      query: "status=running",
      alter: refusing,
    });
    const sheet = open();
    const remove = sheet.getByRole("button", {
      name: "Remove status is running",
    });
    fireEvent.click(remove);
    await waitFor(() => expect(readRegion()).toContain("Busy"));
    fireEvent.click(sheet.getByRole("button", { name: "Clear all" }));
    await waitFor(() => expect(readRegion()).toContain("Locked"));
    expect(provider.state.get().slice.filter).toHaveLength(1);
  });

  it("closes on its footer button, committing nothing, and on Escape", () => {
    const { provider, dialog, open, onOpenChange } = mount({
      query: "status=running",
    });
    const before = provider.state.get().slice;
    const sheet = open();
    fireEvent.click(sheet.getByRole("button", { name: /^Show/ }));
    expect(dialog.open).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(provider.state.get().slice).toBe(before);
    expect(dialog.querySelector(".body")).toBeNull();
    expect(screen.getByRole("button", { name: "Filters" })).toHaveFocus();
    open();
    act(() => {
      fireEvent.keyDown(document.activeElement as Element, { key: "Escape" });
    });
    expect(dialog.open).toBe(false);
  });

  it("calls its own close handler too", () => {
    const onClose = vi.fn();
    const { open, dialog } = mount({ dialogProps: { onClose } });
    open();
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Close filters" }),
    );
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("says it opened where the dialog was open as scripts took over", () => {
    const { onOpenChange } = mount({ dialogProps: { open: true } });
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});
