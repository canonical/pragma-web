import type { _Item } from "@canonical/ds-types";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { MenuEntry } from "../../types.js";
import MenuContext from "../MenuContext.js";
import type { MenuContextValue } from "../types.js";
import SubMenu from "./SubMenu.js";

/** Renders one node under a navigation stub, its parent highlighted below. */
const renderNode = (item: MenuEntry, keyboardOpen = false) => {
  const navigation: MenuContextValue = {
    getItemProps: (item) => ({
      role: "menuitem",
      tabIndex: -1,
      ...(item.items ? { "aria-haspopup": "menu" as const } : {}),
    }),
    getMenuProps: ({ label }) => ({ role: "menu", "aria-label": label }),
    getNodeStatus: () => ({
      highlighted: false,
      selected: false,
      inHighlightedBranch: keyboardOpen,
      inSelectedBranch: false,
    }),
    highlightItem: vi.fn(),
    chooseItem: vi.fn(),
  };
  render(
    <MenuContext.Provider value={navigation}>
      <SubMenu item={item as _Item<MenuEntry>} />
    </MenuContext.Provider>,
  );
  return navigation;
};

const parent: MenuEntry = {
  key: "share",
  label: "Share",
  items: [
    { key: "link", label: "Copy link" },
    { type: "separator", key: "s" },
    { key: "mail", label: "Email" },
  ],
};

describe("SubMenu", () => {
  it("renders a separator as a rule", () => {
    renderNode({ type: "separator", key: "s" });
    expect(screen.getByRole("separator")).toHaveClass("separator");
  });

  it("chooses a leaf through the navigation", () => {
    const navigation = renderNode({ key: "copy", label: "Copy" });
    fireEvent.click(screen.getByRole("menuitem", { name: "Copy" }));
    expect(navigation.chooseItem).toHaveBeenCalledWith(
      expect.objectContaining({ key: "copy" }),
      expect.objectContaining({ type: "click" }),
    );
  });

  it("renders a parent as a submenu parent", () => {
    renderNode(parent);
    expect(screen.getByRole("menuitem", { name: "Share" })).toHaveAttribute(
      "aria-haspopup",
      "menu",
    );
  });

  it("opens a submenu beside its parent on hover", () => {
    renderNode(parent);
    const item = screen.getByRole("menuitem", { name: "Share" });
    expect(item).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("menu")).toBeNull();
    fireEvent.pointerEnter(item.parentElement as HTMLElement);
    const submenu = screen.getByRole("menu", { name: "Share" });
    expect(item).toHaveAttribute("aria-controls", submenu.id);
    expect(submenu.style.getPropertyValue("position-anchor")).toBe(
      item.style.getPropertyValue("anchor-name"),
    );
    expect(submenu.querySelectorAll("hr")).toHaveLength(1);
    fireEvent.pointerLeave(item.parentElement as HTMLElement);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("opens a submenu while the highlight is below its parent", () => {
    renderNode(parent, true);
    expect(screen.getByRole("menu", { name: "Share" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Share" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("opens a submenu on its first enabled item when its parent is chosen", () => {
    const navigation = renderNode(parent);
    fireEvent.click(screen.getByRole("menuitem", { name: "Share" }));
    expect(navigation.highlightItem).toHaveBeenCalledWith(
      expect.objectContaining({ key: "link" }),
    );
  });

  it("opens a chosen parent on its first item, a disabled one too", () => {
    const navigation = renderNode({
      key: "p",
      label: "Parent",
      items: [{ key: "x", label: "X", disabled: true }],
    });
    fireEvent.click(screen.getByRole("menuitem", { name: "Parent" }));
    expect(navigation.highlightItem).toHaveBeenCalledWith(
      expect.objectContaining({ key: "x" }),
    );
  });

  it("highlights nothing when a chosen parent holds only separators", () => {
    const navigation = renderNode({
      key: "p",
      label: "Parent",
      items: [{ type: "separator", key: "s" }],
    });
    fireEvent.click(screen.getByRole("menuitem", { name: "Parent" }));
    expect(navigation.highlightItem).not.toHaveBeenCalled();
  });

  it("keeps a disabled parent's submenu shut on hover", () => {
    renderNode({ ...parent, disabled: true } as MenuEntry);
    const item = screen.getByRole("menuitem", { name: "Share" });
    fireEvent.pointerEnter(item.parentElement as HTMLElement);
    expect(document.querySelector(".submenu")).toBeNull();
    expect(item).toHaveAttribute("aria-expanded", "false");
  });

  it("keeps a disabled parent's submenu shut while the highlight is below it", () => {
    renderNode({ ...parent, disabled: true } as MenuEntry, true);
    expect(document.querySelector(".submenu")).toBeNull();
    expect(screen.getByRole("menuitem", { name: "Share" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("wears its class on a parent's root", () => {
    renderNode(parent);
    expect(
      screen.getByRole("menuitem", { name: "Share" }).parentElement,
    ).toHaveClass("ds", "contextual-menu-submenu");
  });
});
