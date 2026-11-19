import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import installPopoverStandIn from "../../../../../../../testing/installPopoverStandIn.js";
import openMenuFrom from "../../../../../../../testing/openMenuFrom.js";
import HeaderMenu from "./HeaderMenu.js";
import type { HeaderMenuProps } from "./types.js";

/** Every change a column in the middle of a table takes. */
const MIDDLE: HeaderMenuProps["offers"] = {
  hide: true,
  "move-left": true,
  "move-right": true,
};

const mount = ({
  sortable = true,
  removable = false,
  hideable = true,
  offers = MIDDLE,
}: {
  readonly sortable?: boolean;
  readonly removable?: boolean;
  readonly hideable?: boolean;
  readonly offers?: HeaderMenuProps["offers"];
} = {}) => {
  const onPlace = vi.fn();
  const onRemoveFromSort = vi.fn();
  const onChangeColumn = vi.fn();
  render(
    <HeaderMenu
      columnId="state"
      header="Status"
      sortable={sortable}
      removable={removable}
      hideable={hideable}
      offers={offers}
      onPlace={onPlace}
      onRemoveFromSort={onRemoveFromSort}
      onChangeColumn={onChangeColumn}
    />,
  );
  return { onPlace, onRemoveFromSort, onChangeColumn };
};

const findTrigger = (): HTMLElement =>
  screen.getByRole("button", { name: "Column options for Status" });

/** Open the menu from its button, and wait for focus to move into it. */
const openMenu = (): Promise<HTMLElement> => openMenuFrom(findTrigger());

/** The items of the open menu, as they read. */
const listItemNames = (): readonly (string | null)[] =>
  screen.getAllByRole("menuitem").map((item) => item.textContent);

describe("HeaderMenu", () => {
  let uninstall: () => void;
  beforeAll(() => {
    uninstall = installPopoverStandIn();
  });
  afterAll(() => {
    uninstall();
  });

  it("holds a closed menu behind its button, named for the column", () => {
    mount();
    expect(findTrigger()).toHaveAttribute("aria-haspopup", "menu");
    expect(findTrigger()).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("menu", { hidden: true }),
    ).not.toBeInTheDocument();
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

  it("names its menu by the column's label", async () => {
    mount();
    fireEvent.click(findTrigger());
    expect(
      await screen.findByRole("menu", { name: "Column options for Status" }),
    ).toBeInTheDocument();
  });

  it("opens a menu of the column's sort, visibility and place, focusing the first", async () => {
    mount();
    await openMenu();
    expect(listItemNames()).toEqual([
      "Sort ascending",
      "Sort descending",
      "Hide column",
      "Move column left",
      "Move column right",
    ]);
    expect(findTrigger()).toHaveAttribute("aria-expanded", "true");
  });

  it("offers remove only while the reader's ordering names the column", async () => {
    mount({ removable: true });
    await openMenu();
    expect(
      screen.getByRole("menuitem", { name: "Remove from sort" }),
    ).toBeInTheDocument();
  });

  it("offers no sort on a column that offers none, and no hide on a column that may not be hidden", async () => {
    mount({ sortable: false, hideable: false });
    await openMenu();
    expect(listItemNames()).toEqual(["Move column left", "Move column right"]);
  });

  it("disables the changes a column does not take now, and chooses nothing from them", async () => {
    const { onChangeColumn } = mount({
      sortable: false,
      offers: {
        hide: false,
        "move-left": false,
        "move-right": true,
      },
    });
    await openMenu();
    const disabled = screen
      .getAllByRole("menuitem")
      .filter((item) => item.classList.contains("disabled"))
      .map((item) => item.textContent);
    expect(disabled).toEqual(["Hide column", "Move column left"]);
    fireEvent.click(screen.getByRole("menuitem", { name: "Hide column" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Move column left" }));
    expect(onChangeColumn).not.toHaveBeenCalled();
  });

  it("places the column in the direction chosen and returns focus to the trigger", async () => {
    const { onPlace } = mount();
    await openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "Sort descending" }));
    expect(onPlace).toHaveBeenCalledWith("state", "desc");
    await waitFor(() => expect(findTrigger()).toHaveFocus());
    await openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "Sort ascending" }));
    expect(onPlace).toHaveBeenLastCalledWith("state", "asc");
  });

  it("closes on Escape, returning focus to the trigger", async () => {
    mount();
    findTrigger().focus();
    await openMenu();
    fireEvent.keyDown(document.activeElement ?? document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    expect(findTrigger()).toHaveFocus();
  });

  it("removes the column when remove is chosen", async () => {
    const { onPlace, onRemoveFromSort } = mount({ removable: true });
    await openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "Remove from sort" }));
    expect(onRemoveFromSort).toHaveBeenCalledWith("state");
    expect(onPlace).not.toHaveBeenCalled();
    await waitFor(() => expect(findTrigger()).toHaveFocus());
  });

  it("hands back each change to the column's visibility and place, returning focus to the trigger", async () => {
    const { onChangeColumn, onPlace } = mount();
    for (const [name, change] of [
      ["Hide column", "hide"],
      ["Move column left", "move-left"],
      ["Move column right", "move-right"],
    ] as const) {
      await openMenu();
      fireEvent.click(screen.getByRole("menuitem", { name }));
      expect(onChangeColumn).toHaveBeenLastCalledWith("state", change);
      await waitFor(() => expect(findTrigger()).toHaveFocus());
    }
    expect(onChangeColumn).toHaveBeenCalledTimes(3);
    expect(onPlace).not.toHaveBeenCalled();
  });
});
