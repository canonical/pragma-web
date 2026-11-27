import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { installPopoverStandIn } from "../../../../../../testing/index.js";
import type { MenuEntry } from "../../types.js";
import MenuList from "./MenuList.js";

// The stand-in also gives jsdom the scrollIntoView a focus move calls.
let uninstall: () => void;
beforeAll(() => {
  uninstall = installPopoverStandIn();
});
afterAll(() => uninstall());

const items: MenuEntry[] = [
  { key: "cut", label: "Cut" },
  { type: "separator", key: "s" },
  { key: "copy", label: "Copy" },
  { key: "paste", label: "Paste", disabled: true },
];

type Props = Partial<ComponentProps<typeof MenuList>>;

const renderList = (props: Props = {}) => {
  const hide = vi.fn();
  const hideLeavingFocus = vi.fn();
  render(
    <MenuList
      items={items}
      wrap
      focusIntent="first"
      hide={hide}
      hideLeavingFocus={hideLeavingFocus}
      label="Edit"
      {...props}
    />,
  );
  return { hide, hideLeavingFocus };
};

const waitForItemFocus = (name: string) =>
  waitFor(() => expect(screen.getByRole("menuitem", { name })).toHaveFocus());

const press = (key: string) =>
  fireEvent.keyDown(document.activeElement as Element, { key });

describe("MenuList", () => {
  it("is a named vertical menu that focuses its first item", async () => {
    renderList();
    expect(screen.getByRole("menu", { name: "Edit" })).toHaveAttribute(
      "aria-orientation",
      "vertical",
    );
    await waitForItemFocus("Cut");
    expect(screen.getAllByRole("separator")).toHaveLength(1);
  });

  it.each([
    ["last", "Paste"],
    [0, "Cut"],
  ] as const)("focuses the %s item when it mounts", async (intent, name) => {
    renderList({ focusIntent: intent });
    await waitForItemFocus(name);
  });

  it("focuses only the last item when it opens on it", () => {
    const focused: string[] = [];
    const record = (event: FocusEvent) =>
      focused.push(String((event.target as HTMLElement).textContent));
    document.addEventListener("focusin", record);
    renderList({ focusIntent: "last" });
    document.removeEventListener("focusin", record);
    expect(focused).toEqual(["Paste"]);
  });

  it("leaves focus where it is with no intent", async () => {
    const outside = document.createElement("button");
    document.body.append(outside);
    outside.focus();
    renderList({ focusIntent: "none" });
    expect(outside).toHaveFocus();
    outside.remove();
  });

  it("takes focus back from <body> as the highlight moves", async () => {
    (document.activeElement as HTMLElement | null)?.blur();
    renderList({ focusIntent: "none" });
    await waitForItemFocus("Cut");
  });

  it("spreads native props on its root, merging the class", () => {
    renderList({ "data-testid": "list", className: "wide" } as Props);
    const list = screen.getByTestId("list");
    expect(list).toHaveAttribute("role", "menu");
    expect(list).toHaveClass("ds", "contextual-menu-list", "wide");
  });

  it("keeps the arrows out of a disabled parent's submenu", async () => {
    renderList({
      items: [
        { key: "cut", label: "Cut" },
        {
          key: "share",
          label: "Share",
          disabled: true,
          items: [
            { key: "link", label: "Copy link" },
            { type: "separator", key: "s" },
            { key: "mail", label: "Email" },
          ],
        },
      ],
    });
    await waitForItemFocus("Cut");
    const share = screen.getByRole("menuitem", { name: "Share" });
    fireEvent.click(share);
    act(() => share.focus());
    press("ArrowRight");
    expect(share).toHaveFocus();
    expect(share).toHaveAttribute("tabindex", "0");
    expect(document.querySelector(".submenu")).toBeNull();
  });

  it("moves the roving focus past separators, and onto disabled items", async () => {
    renderList();
    await waitForItemFocus("Cut");
    press("ArrowDown");
    await waitForItemFocus("Copy");
    press("ArrowDown");
    await waitForItemFocus("Paste");
    press("ArrowDown");
    await waitForItemFocus("Cut");
    press("End");
    await waitForItemFocus("Paste");
    expect(screen.getByRole("menuitem", { name: "Paste" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("scrolls the item the arrow moves to into view", async () => {
    const scroll = vi.spyOn(Element.prototype, "scrollIntoView");
    renderList();
    await waitForItemFocus("Cut");
    press("ArrowDown");
    await waitForItemFocus("Copy");
    const copy = screen.getByRole("menuitem", { name: "Copy" });
    expect(scroll.mock.contexts).toContain(copy);
    expect(scroll).toHaveBeenLastCalledWith({ block: "nearest" });
    scroll.mockRestore();
  });

  it("chooses the item the arrow just moved to", async () => {
    const onSelect = vi.fn();
    renderList({ onSelect });
    await waitForItemFocus("Cut");
    press("ArrowDown");
    press("Enter");
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ key: "copy" }),
      expect.anything(),
    );
  });

  it("closes on Tab leaving focus, and leaves Escape to the popover", async () => {
    const { hide, hideLeavingFocus } = renderList();
    await waitForItemFocus("Cut");
    press("Escape");
    expect(hide).not.toHaveBeenCalled();
    press("Tab");
    expect(hideLeavingFocus).toHaveBeenCalledTimes(1);
    expect(hide).not.toHaveBeenCalled();
  });

  it("chooses an item, then closes", async () => {
    const onSelect = vi.fn();
    const { hide } = renderList({ onSelect });
    await waitForItemFocus("Cut");
    fireEvent.click(screen.getByRole("menuitem", { name: "Copy" }));
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ key: "copy" }),
      expect.anything(),
    );
    expect(hide).toHaveBeenCalled();
  });
});
