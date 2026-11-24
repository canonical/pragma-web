/**
 * The table's settings menu, given its props: an icon button opening a
 * popover menu of each column's toggle and moves, then the reset; the change
 * chosen handed back and focus returned; and, before scripts run, links.
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import {
  expectNoAxeViolations,
  installPopoverStandIn,
  openMenuFrom,
} from "../../../../../../../testing/index.js";
import type { ColumnChange, ColumnSetting } from "../types.js";
import SettingsMenu from "./SettingsMenu.js";
import type { SettingsMenuProps } from "./types.js";

/** What a column takes, every change offered unless said otherwise. */
const offer = (
  refused: readonly ColumnChange[] = [],
): Readonly<Record<ColumnChange, boolean>> => ({
  hide: !refused.includes("hide"),
  show: !refused.includes("show"),
  "move-left": !refused.includes("move-left"),
  "move-right": !refused.includes("move-right"),
});

const settings: readonly ColumnSetting[] = [
  {
    column: { id: "name", header: "Name", hideable: false },
    hidden: false,
    offers: offer(["hide", "show", "move-left"]),
  },
  {
    column: { id: "status", header: <em>Status</em> },
    hidden: false,
    offers: offer(["show", "move-right"]),
  },
  {
    column: { id: "cores", header: "Cores" },
    hidden: true,
    offers: offer(["hide", "move-left", "move-right"]),
  },
];

/** The menu over these settings, every callback a spy. */
const mount = (overrides: Partial<SettingsMenuProps> = {}) => {
  const props: SettingsMenuProps = {
    settings,
    resettable: true,
    hydrated: true,
    onChange: vi.fn(),
    onReset: vi.fn(),
    listDestinations: vi.fn(() => ({
      // Every change the settings offer, and no other.
      changes: new Map([
        ["move-right:name", "?move-right=name"],
        ["hide:status", "?hide=status"],
        ["move-left:status", "?move-left=status"],
        ["show:cores", "?show=cores"],
      ]),
      reset: "?reset",
    })),
    ...overrides,
  };
  const view = render(<SettingsMenu {...props} />);
  return { props, view };
};

const findTrigger = (): HTMLElement =>
  screen.getByRole("button", { name: "Table settings" });

/** Open the menu from its button, and wait for focus to move into it. */
const openMenu = (): Promise<HTMLElement> => openMenuFrom(findTrigger());

/** Choose an item of the open menu, and wait for focus back on the button. */
const choose = async (name: string): Promise<void> => {
  await openMenu();
  fireEvent.click(screen.getByRole("menuitem", { name }));
  await waitFor(() => expect(findTrigger()).toHaveFocus());
};

describe("SettingsMenu", () => {
  let uninstall: () => void;
  beforeAll(() => {
    uninstall = installPopoverStandIn();
  });
  afterAll(() => {
    uninstall();
  });

  it("holds a closed menu behind its button, named for what it opens", () => {
    mount();
    expect(findTrigger()).toHaveAttribute("aria-haspopup", "menu");
    expect(findTrigger()).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("menu", { hidden: true }),
    ).not.toBeInTheDocument();
  });

  it("lists each column's toggle and moves in the arrangement's order, then the reset", async () => {
    mount();
    await openMenu();
    const items = screen.getAllByRole("menuitem");
    expect(items.map((item) => item.textContent)).toEqual([
      "Name is always shown",
      "Move Name left",
      "Move Name right",
      "Hide Status",
      "Move Status left",
      "Move Status right",
      "Show Cores",
      "Move Cores left",
      "Move Cores right",
      "Reset table settings",
    ]);
    // Disabled where the change would do nothing; the column that cannot be
    // hidden says so on an item a keyboard still reaches.
    expect(
      items
        .filter((item) => item.classList.contains("disabled"))
        .map((item) => item.textContent),
    ).toEqual([
      "Move Name left",
      "Move Status right",
      "Move Cores left",
      "Move Cores right",
    ]);
    expect(screen.getByRole("menu", { name: "Table settings" })).toBeVisible();
    expect(
      screen.getByRole("menuitem", { name: "Name is always shown" }),
    ).toHaveFocus();
  });

  it("hands back the change chosen and returns focus to its button", async () => {
    const { props } = mount();
    await choose("Hide Status");
    expect(props.onChange).toHaveBeenCalledWith("status", "hide");
    await choose("Show Cores");
    expect(props.onChange).toHaveBeenLastCalledWith("cores", "show");
    await choose("Move Name right");
    expect(props.onChange).toHaveBeenLastCalledWith("name", "move-right");
    await choose("Name is always shown");
    expect(props.onChange).toHaveBeenLastCalledWith("name", "hide");
    await choose("Reset table settings");
    expect(props.onReset).toHaveBeenCalledTimes(1);
    expect(props.onChange).toHaveBeenCalledTimes(4);
  });

  it("closes on Escape, returning focus to its button", async () => {
    mount();
    findTrigger().focus();
    await openMenu();
    fireEvent.keyDown(document.activeElement ?? document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    expect(findTrigger()).toHaveFocus();
  });

  it("chooses nothing from a disabled item", async () => {
    const { props } = mount({ resettable: false });
    await openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "Move Name left" }));
    fireEvent.click(
      screen.getByRole("menuitem", { name: "Reset table settings" }),
    );
    expect(props.onChange).not.toHaveBeenCalled();
    expect(props.onReset).not.toHaveBeenCalled();
  });

  it("has no axe violations closed or open", async () => {
    const { view } = mount();
    await expectNoAxeViolations(view.container);
    await openMenu();
    await expectNoAxeViolations(document.body);
  });

  it("adds no window listener while closed", () => {
    const listen = vi.spyOn(window, "addEventListener");
    mount();
    expect(listen).not.toHaveBeenCalled();
    listen.mockRestore();
  });

  it("is an icon button with no chevron that opens a popover menu", () => {
    mount();
    const trigger = findTrigger();
    expect(trigger).toHaveClass("ds", "button", "tertiary", "icon-button");
    expect(trigger.querySelector(".chevron")).toBeNull();
    const panel = document.getElementById(
      String(trigger.getAttribute("popovertarget")),
    );
    expect(panel).toHaveAttribute("popover", "auto");
  });

  describe("before scripts run", () => {
    it("is a closed popover of the links each available change leads to", async () => {
      const { props, view } = mount({ hydrated: false });
      const trigger = findTrigger();
      const panel = document.getElementById(
        String(trigger.getAttribute("popovertarget")),
      );
      expect(view.container).toContainElement(panel);
      expect(
        screen
          .getAllByRole("link", { hidden: true })
          .map((link) => [link.textContent, link.getAttribute("href")]),
      ).toEqual([
        ["Move Name right", "?move-right=name"],
        ["Hide Status", "?hide=status"],
        ["Move Status left", "?move-left=status"],
        ["Show Cores", "?show=cores"],
        ["Reset table settings", "?reset"],
      ]);
      // The column that cannot be hidden says so, on an item scripts drive.
      expect(panel).toHaveTextContent("Name is always shown");
      // Every destination is spelled over one reading of the query.
      expect(props.listDestinations).toHaveBeenCalledTimes(1);
      await expectNoAxeViolations(view.container);
    });

    it("offers no reset link while there is nothing to reset", () => {
      mount({ hydrated: false, resettable: false });
      expect(
        screen.queryByRole("link", {
          name: "Reset table settings",
          hidden: true,
        }),
      ).not.toBeInTheDocument();
      // The disabled reset waits for scripts, hidden until they run.
      expect(
        screen
          .getByText("Reset table settings")
          .closest("[data-requires-script]"),
      ).not.toBeNull();
    });

    it("offers nothing where no link leads anywhere", () => {
      const { view } = mount({
        hydrated: false,
        listDestinations: () => null,
      });
      expect(view.container).toBeEmptyDOMElement();
    });

    // A reader already on a link as scripts take over is handed to the
    // button: proven through a real hydration in the settings part's tests.
    it("leaves focus alone as scripts take over", () => {
      const { props, view } = mount({ hydrated: false });
      view.rerender(<SettingsMenu {...props} hydrated />);
      expect(findTrigger()).not.toHaveFocus();
      // Without a disclosure at all, as without a location, nothing moves.
      const unlocated = { ...props, listDestinations: () => null };
      view.rerender(<SettingsMenu {...unlocated} hydrated={false} />);
      view.rerender(<SettingsMenu {...unlocated} hydrated />);
      expect(findTrigger()).not.toHaveFocus();
    });
  });
});
