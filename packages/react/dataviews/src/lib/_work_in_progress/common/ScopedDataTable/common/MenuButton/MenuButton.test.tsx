import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import installPopoverStandIn from "../../../../../../../testing/installPopoverStandIn.js";
import openMenuFrom from "../../../../../../../testing/openMenuFrom.js";
import MenuButton from "./MenuButton.js";
import type { MenuButtonMenuProps } from "./types.js";

/** A menu of two actions, the second disabled. */
const createMenu = (): MenuButtonMenuProps => ({
  items: [
    { key: "copy", label: "Copy" },
    { type: "separator", key: "s" },
    { key: "cut", label: "Cut", disabled: true },
  ],
  onSelect: vi.fn(),
});

describe("MenuButton", () => {
  let uninstall: () => void;
  beforeAll(() => {
    uninstall = installPopoverStandIn();
  });
  afterAll(() => {
    uninstall();
  });

  it("is a tertiary icon button for a popover menu", () => {
    render(
      <MenuButton icon="settings" aria-label="Edit" menuProps={createMenu()} />,
    );
    const trigger = screen.getByRole("button", { name: "Edit" });
    expect(trigger).toHaveClass("tertiary", "icon-button");
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
  });

  it("names its menu as the button is named by its label", async () => {
    render(
      <MenuButton icon="settings" aria-label="Edit" menuProps={createMenu()} />,
    );
    const menu = await openMenuFrom(
      screen.getByRole("button", { name: "Edit" }),
    );
    expect(menu).toHaveAccessibleName("Edit");
  });

  it("names its menu by the element naming the button", async () => {
    render(
      <>
        <span id="name">Column options</span>
        <MenuButton
          icon="menu-contextual"
          aria-labelledby="name"
          menuProps={createMenu()}
        />
      </>,
    );
    const menu = await openMenuFrom(
      screen.getByRole("button", { name: "Column options" }),
    );
    expect(menu).toHaveAccessibleName("Column options");
  });

  it("hands back the item chosen and returns focus to the button", async () => {
    const menuProps = createMenu();
    render(
      <MenuButton icon="settings" aria-label="Edit" menuProps={menuProps} />,
    );
    const trigger = screen.getByRole("button", { name: "Edit" });
    await openMenuFrom(trigger);
    fireEvent.click(screen.getByRole("menuitem", { name: "Copy" }));
    expect(menuProps.onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ key: "copy" }),
      expect.anything(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});
