import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { installPopoverStandIn } from "../../../../testing/index.js";
import type { MenuEntry, MenuItem } from "./types.js";
import withContextualMenu from "./withContextualMenu.js";

let uninstall: () => void;
beforeAll(() => {
  uninstall = installPopoverStandIn();
});
afterAll(() => uninstall());

const Shortcut = ({ item }: { item: MenuItem }) => <em>Custom {item.label}</em>;

const items: MenuEntry[] = [
  { key: "cut", label: "Cut" },
  { key: "copy", label: "Copy", icon: "⧉", slot: "⌘C", className: "copy" },
  { type: "separator", key: "s" },
  { key: "paste", label: "Paste", disabled: true },
  { url: "#docs", label: "Docs" },
  {
    key: "custom",
    label: "Special",
    displayItemsType: "custom",
    Component: Shortcut,
  },
];

const submenuItems: MenuEntry[] = [
  { key: "first", label: "First" },
  {
    key: "parent",
    label: "Parent",
    items: [
      { key: "sub1", label: "Sub one" },
      { type: "separator", key: "sub-s" },
      { key: "sub2", label: "Sub two" },
    ],
  },
];

/** A plain button, as a trigger. */
const Plain = (props: ComponentProps<"button">) => <button {...props} />;

const PlainMenu = withContextualMenu(Plain);

type Props = Partial<ComponentProps<typeof PlainMenu>>;

/** Renders a menu with a plain button trigger labelled "Actions". */
const renderMenu = (props: Props = {}, Menu = PlainMenu) => {
  const result = render(
    <Menu items={items} {...props}>
      Actions
    </Menu>,
  );
  const trigger = screen.getByText("Actions") as HTMLElement;
  const popover = trigger.nextElementSibling as HTMLElement;
  return { ...result, trigger, popover };
};

/** Waits for the open menu's item named `name` to hold focus. */
const waitForItemFocus = (name: string) =>
  waitFor(() => expect(screen.getByRole("menuitem", { name })).toHaveFocus());

/** Opens the menu with a click and waits for focus on its first item. */
const openMenu = async (props: Props = {}, first = "Cut", Menu = PlainMenu) => {
  const parts = renderMenu(props, Menu);
  fireEvent.click(parts.trigger);
  await waitForItemFocus(first);
  return parts;
};

/** Presses a key on whatever has focus. */
const press = (key: string) =>
  fireEvent.keyDown(document.activeElement as Element, { key });

describe("withContextualMenu", () => {
  describe("the trigger", () => {
    it("renders the trigger and the menu as siblings, wired together", () => {
      const { container, trigger, popover } = renderMenu();
      expect(container.children).toHaveLength(2);
      expect(trigger).toHaveAttribute("type", "button");
      expect(trigger).toHaveAttribute("popovertarget", popover.id);
      expect(trigger).toHaveAttribute("aria-haspopup", "menu");
      expect(trigger).toHaveClass("ds", "contextual-menu-trigger");
      expect(trigger).not.toHaveAttribute("aria-expanded");
      expect(trigger.style.getPropertyValue("anchor-name")).toBe(
        `--${popover.id}`,
      );
      expect(popover.style.getPropertyValue("position-anchor")).toBe(
        trigger.style.getPropertyValue("anchor-name"),
      );
    });

    it("takes the consumer's id, which names the menu", async () => {
      const { trigger } = await openMenu({ id: "actions" });
      expect(trigger.id).toBe("actions");
      expect(screen.getByRole("menu")).toHaveAttribute(
        "aria-labelledby",
        "actions",
      );
    });
  });

  describe("the wrapped trigger", () => {
    it("is named after its trigger", () => {
      expect(PlainMenu.displayName).toBe("withContextualMenu(Plain)");
      const Anonymous = withContextualMenu(((
        props: ComponentProps<"button">,
      ) => <button {...props} />) as (
        props: ComponentProps<"button">,
      ) => React.ReactElement);
      expect(Anonymous.displayName).toBe("withContextualMenu(Component)");
    });

    it("keeps its className, merges its style and runs its onKeyDown first", () => {
      const calls: string[] = [];
      const { trigger, popover } = renderMenu({
        className: "inset-ring",
        style: { outlineOffset: "-2px" },
        type: "submit",
        onKeyDown: (event) => {
          calls.push("own");
          if (event.key === "ArrowUp") event.preventDefault();
        },
      });
      expect(trigger).toHaveClass("inset-ring");
      expect(trigger.style.outlineOffset).toBe("-2px");
      expect(trigger.style.getPropertyValue("anchor-name")).toMatch(/^--/);
      expect(trigger).toHaveAttribute("type", "submit");
      fireEvent.keyDown(trigger, { key: "ArrowUp" });
      expect(calls).toEqual(["own"]);
      expect(popover.matches(":popover-open")).toBe(false);
    });

    it("never yields the keys the menu owns", () => {
      const { trigger, popover } = renderMenu({
        popoverTarget: "elsewhere",
        "aria-haspopup": "listbox",
      } as unknown as Props);
      expect(trigger).toHaveAttribute("popovertarget", popover.id);
      expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    });

    it("is an auto popover with no role of its own", () => {
      const { popover } = renderMenu();
      expect(popover).toHaveAttribute("popover", "auto");
      expect(popover).toHaveAttribute("tabindex", "-1");
      expect(popover.className).toBe("ds contextual-menu");
      expect(popover).not.toHaveAttribute("role");
    });
  });

  describe("closed", () => {
    it("is a static list: items and separators in order, with no roles", () => {
      const { popover } = renderMenu();
      const list = popover.firstElementChild as HTMLElement;
      expect(list).toHaveClass("ds", "contextual-menu-list");
      expect(list).not.toHaveAttribute("role");
      expect(
        [...list.children].map((child) => child.textContent || child.tagName),
      ).toEqual(["Cut", "⧉Copy⌘C", "HR", "Paste", "Docs", "Custom Special"]);
      expect(screen.getByText("Copy").closest(".copy")).not.toBeNull();
    });

    it("renders a link item as a link, and an action item as script-only", () => {
      renderMenu();
      expect(screen.getByText("Docs").closest("a")).toHaveAttribute(
        "href",
        "#docs",
      );
      expect(
        screen.getByText("Cut").closest(".contextual-menu-item"),
      ).toHaveClass("script-only");
    });

    it("marks its trigger script-only only when no item is a live link", () => {
      const { trigger, rerender } = renderMenu();
      expect(trigger).not.toHaveClass("script-only");
      rerender(<PlainMenu items={items.slice(0, 2)}>Actions</PlainMenu>);
      expect(trigger).toHaveClass("script-only");
      rerender(
        <PlainMenu items={[{ url: "#gone", label: "Gone", disabled: true }]}>
          Actions
        </PlainMenu>,
      );
      expect(trigger).toHaveClass("script-only");
    });

    it("chooses nothing", () => {
      const onSelect = vi.fn();
      renderMenu({ onSelect });
      fireEvent.click(screen.getByText("Copy"));
      expect(onSelect).not.toHaveBeenCalled();
    });

    it("shows a caret on a submenu parent", () => {
      renderMenu({ items: submenuItems });
      expect(
        screen.getByText("Parent").parentElement?.querySelector(".caret"),
      ).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("open", () => {
    it("is a vertical menu named by its trigger", async () => {
      const { trigger } = await openMenu();
      const menu = screen.getByRole("menu");
      expect(menu).toHaveAttribute("aria-labelledby", trigger.id);
      expect(menu).toHaveAttribute("aria-orientation", "vertical");
      expect(screen.getByText("Paste").parentElement).toHaveAttribute(
        "aria-disabled",
        "true",
      );
    });

    it("takes a label in place of its trigger", async () => {
      await openMenu({ menuLabel: "Row actions" });
      const menu = screen.getByRole("menu", { name: "Row actions" });
      expect(menu).not.toHaveAttribute("aria-labelledby");
    });

    it("takes ids in place of its trigger, over a label", async () => {
      render(<span id="name">Row 3 actions</span>);
      await openMenu({ menuLabelledBy: "name", menuLabel: "Ignored" });
      const menu = screen.getByRole("menu", { name: "Row 3 actions" });
      expect(menu).toHaveAttribute("aria-labelledby", "name");
      expect(menu).not.toHaveAttribute("aria-label");
    });

    it("unmounts when it closes, leaving the static list", async () => {
      const { trigger, popover } = await openMenu();
      fireEvent.click(trigger);
      await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
      expect(popover.querySelector(".ds.contextual-menu-list")).not.toBeNull();
    });
  });

  describe("the keyboard", () => {
    it("moves with the arrows, wrapping, and reaches the ends", async () => {
      await openMenu();
      press("ArrowUp");
      await waitForItemFocus("Custom Special");
      press("ArrowDown");
      await waitForItemFocus("Cut");
      press("End");
      await waitForItemFocus("Custom Special");
      press("Home");
      await waitForItemFocus("Cut");
    });

    it("lands on a disabled item, where Enter chooses nothing", async () => {
      const onSelect = vi.fn();
      const { popover } = await openMenu({ onSelect });
      press("ArrowDown");
      press("ArrowDown");
      await waitForItemFocus("Paste");
      press("Enter");
      expect(onSelect).not.toHaveBeenCalled();
      expect(popover.matches(":popover-open")).toBe(true);
    });

    it("stops at the ends with the wrap option off", async () => {
      await openMenu({}, "Cut", withContextualMenu(Plain, { wrap: false }));
      press("ArrowUp");
      await waitForItemFocus("Cut");
    });

    it("moves to the first item whose label starts with what was typed", async () => {
      await openMenu();
      press("d");
      await waitForItemFocus("Docs");
    });

    it("types ahead onto a disabled item, where Enter chooses nothing", async () => {
      const onSelect = vi.fn();
      await openMenu({ onSelect });
      press("p");
      await waitForItemFocus("Paste");
      press("Enter");
      expect(onSelect).not.toHaveBeenCalled();
    });

    it.each(["Enter", " "])(
      "chooses with %j, closes, and returns focus to the trigger",
      async (key) => {
        const onSelect = vi.fn();
        const { trigger, popover } = await openMenu({ onSelect });
        press(key);
        await waitFor(() => expect(trigger).toHaveFocus());
        expect(onSelect).toHaveBeenCalledWith(
          expect.objectContaining({ key: "cut" }),
          expect.anything(),
        );
        expect(popover.matches(":popover-open")).toBe(false);
      },
    );

    it("closes on Escape, with focus on the trigger", async () => {
      const { trigger, popover } = await openMenu();
      press("Escape");
      await waitFor(() => expect(trigger).toHaveFocus());
      expect(popover.matches(":popover-open")).toBe(false);
    });

    it("closes on Tab and lets focus move on past the trigger", async () => {
      const { popover } = await openMenu();
      // Rendered in the test's own tree, so cleanup removes it.
      render(<button type="button">After</button>);
      const after = screen.getByRole("button", { name: "After" });
      // Uncancelled, so the browser's own Tab takes focus on.
      expect(press("Tab")).toBe(true);
      // The browser's own Tab moves focus on before the toggle event.
      after.focus();
      await waitFor(() => expect(popover.matches(":popover-open")).toBe(false));
      await act(async () => {});
      expect(after).toHaveFocus();
    });

    it("leaves Escape to the popover, unhandled and uncancelled", async () => {
      await openMenu();
      const seen = vi.fn((event: KeyboardEvent) => event.defaultPrevented);
      document.addEventListener("keydown", seen);
      press("Escape");
      document.removeEventListener("keydown", seen);
      expect(seen).toHaveReturnedWith(false);
    });
  });

  describe("choosing", () => {
    it("calls onSelect with the item and the click, then closes", async () => {
      const onSelect = vi.fn();
      const { popover } = await openMenu({ onSelect });
      fireEvent.click(screen.getByText("Copy"));
      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({ key: "copy" }),
        expect.objectContaining({ type: "click" }),
      );
      await waitFor(() => expect(popover.matches(":popover-open")).toBe(false));
    });

    it("chooses a link, which a router may take", async () => {
      const onSelect = vi.fn((_item: MenuItem, event: React.MouseEvent) =>
        event.preventDefault(),
      );
      await openMenu({ onSelect });
      fireEvent.click(screen.getByText("Docs"));
      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({ url: "#docs" }),
        expect.anything(),
      );
    });

    it("leaves a modified click on a link to the browser", async () => {
      const onSelect = vi.fn();
      const { popover } = await openMenu({ onSelect });
      fireEvent.click(screen.getByText("Docs"), { metaKey: true });
      expect(onSelect).not.toHaveBeenCalled();
      expect(popover.matches(":popover-open")).toBe(true);
    });

    it("never chooses a disabled item, and drops a disabled link's href", async () => {
      const onSelect = vi.fn();
      const { popover } = await openMenu({
        onSelect,
        items: [
          { key: "cut", label: "Cut" },
          { url: "#gone", label: "Gone", disabled: true },
        ],
      });
      const gone = screen.getByRole("menuitem", { name: "Gone" });
      expect(gone).not.toHaveAttribute("href");
      fireEvent.click(gone);
      expect(onSelect).not.toHaveBeenCalled();
      expect(popover.matches(":popover-open")).toBe(true);
    });

    it("closes without an onSelect", async () => {
      const { popover } = await openMenu();
      fireEvent.click(screen.getByText("Copy"));
      await waitFor(() => expect(popover.matches(":popover-open")).toBe(false));
    });
  });

  describe("submenus", () => {
    const openSubmenus = async (onSelect = vi.fn()) => {
      const parts = await openMenu({ items: submenuItems, onSelect }, "First");
      const parent = screen.getByRole("menuitem", { name: "Parent" });
      return { ...parts, parent, onSelect };
    };

    it("opens on ArrowRight and closes on ArrowLeft, with the real state", async () => {
      const { parent } = await openSubmenus();
      expect(parent).toHaveAttribute("aria-haspopup", "menu");
      press("ArrowDown");
      await waitForItemFocus("Parent");
      expect(parent).toHaveAttribute("aria-expanded", "false");
      press("ArrowRight");
      await waitForItemFocus("Sub one");
      const submenu = screen.getByRole("menu", { name: "Parent" });
      expect(parent).toHaveAttribute("aria-expanded", "true");
      expect(parent).toHaveAttribute("aria-controls", submenu.id);
      expect(submenu.style.getPropertyValue("position-anchor")).toBe(
        parent.style.getPropertyValue("anchor-name"),
      );
      press("ArrowDown");
      await waitForItemFocus("Sub two");
      press("ArrowLeft");
      await waitForItemFocus("Parent");
      expect(screen.queryByText("Sub one")).toBeNull();
    });

    it("closes only the submenu on Escape, with focus on its parent", async () => {
      const { popover } = await openSubmenus();
      press("ArrowDown");
      await waitForItemFocus("Parent");
      press("ArrowRight");
      await waitForItemFocus("Sub one");
      press("Escape");
      await waitForItemFocus("Parent");
      expect(screen.queryByText("Sub one")).toBeNull();
      expect(popover.matches(":popover-open")).toBe(true);
    });

    it("opens on hover, and closes when the pointer leaves", async () => {
      const { parent } = await openSubmenus();
      const anchor = parent.closest(
        ".ds.contextual-menu-submenu",
      ) as HTMLElement;
      fireEvent.pointerEnter(anchor);
      expect(within(anchor).getByText("Sub one")).toBeInTheDocument();
      expect(parent).toHaveAttribute("aria-expanded", "true");
      fireEvent.pointerLeave(anchor);
      expect(screen.queryByText("Sub one")).toBeNull();
      expect(parent).not.toHaveAttribute("aria-controls");
    });

    it("never chooses a parent: Enter opens its submenu, and the arrows go on", async () => {
      const { onSelect, popover } = await openSubmenus();
      press("ArrowDown");
      await waitForItemFocus("Parent");
      press("Enter");
      await waitForItemFocus("Sub one");
      press("ArrowDown");
      await waitForItemFocus("Sub two");
      expect(onSelect).not.toHaveBeenCalled();
      expect(popover.matches(":popover-open")).toBe(true);
    });

    it("opens a submenu on a click of its parent", async () => {
      const { parent, onSelect } = await openSubmenus();
      fireEvent.click(parent);
      await waitForItemFocus("Sub one");
      expect(onSelect).not.toHaveBeenCalled();
    });

    it("closes the whole menu when a nested leaf is chosen", async () => {
      const { parent, onSelect, trigger } = await openSubmenus();
      fireEvent.pointerEnter(
        parent.closest(".ds.contextual-menu-submenu") as HTMLElement,
      );
      fireEvent.click(screen.getByText("Sub two"));
      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({ key: "sub2" }),
        expect.anything(),
      );
      await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
      // Reopening does not resurrect the submenu from stale hover state.
      fireEvent.click(trigger);
      await waitForItemFocus("First");
      expect(screen.queryByText("Sub two")).toBeNull();
    });
  });

  describe("closing", () => {
    const ways: [
      string,
      (parts: Awaited<ReturnType<typeof openMenu>>) => void,
    ][] = [
      [
        "Escape",
        ({ popover }) => fireEvent.keyDown(popover, { key: "Escape" }),
      ],
      ["a click outside", () => fireEvent.pointerUp(document.body)],
      ["the trigger", ({ trigger }) => fireEvent.click(trigger)],
      ["a choice", () => fireEvent.click(screen.getByText("Copy"))],
    ];

    it.each(ways)("unmounts the open menu on %s", async (_way, close) => {
      const parts = await openMenu();
      act(() => close(parts));
      await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
      expect(parts.popover.matches(":popover-open")).toBe(false);
    });

    it("leaves focus where it is when it closes with focus outside", async () => {
      const { popover } = await openMenu();
      const outside = document.createElement("button");
      document.body.append(outside);
      act(() => outside.focus());
      act(() => popover.hidePopover());
      await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
      expect(outside).toHaveFocus();
      outside.remove();
    });

    it("returns focus to the trigger inside a shadow root", async () => {
      const host = document.createElement("div");
      document.body.append(host);
      const shadow = host.attachShadow({ mode: "open" });
      const container = document.createElement("div");
      shadow.append(container);
      const { unmount } = render(<PlainMenu items={items}>Actions</PlainMenu>, {
        container,
      });
      const popover = shadow.querySelector("[popover]") as HTMLElement;
      act(() => popover.showPopover());
      await waitFor(() =>
        expect(shadow.activeElement?.textContent).toBe("Cut"),
      );
      act(() => popover.hidePopover());
      await waitFor(() =>
        expect(shadow.activeElement?.textContent).toBe("Actions"),
      );
      unmount();
      host.remove();
    });
  });

  describe("state the toggle event missed", () => {
    it("re-reads the state on pageshow while open", async () => {
      const { popover } = await openMenu();
      // A close the menu never heard of, as a cache restore can leave.
      let swallowed = (): void => {};
      const toggled = new Promise<void>((resolve) => {
        swallowed = resolve;
      });
      const swallow = (event: Event) => {
        event.stopPropagation();
        swallowed();
      };
      window.addEventListener("toggle", swallow, true);
      popover.hidePopover();
      await toggled;
      window.removeEventListener("toggle", swallow, true);
      expect(screen.getByRole("menu", { hidden: true })).toBeInTheDocument();
      act(() => {
        window.dispatchEvent(new Event("pageshow"));
      });
      expect(screen.queryByRole("menu", { hidden: true })).toBeNull();
    });

    it("adds no window listener while closed, and removes it on close", async () => {
      const add = vi.spyOn(window, "addEventListener");
      const remove = vi.spyOn(window, "removeEventListener");
      const { trigger } = renderMenu();
      expect(add).not.toHaveBeenCalledWith("pageshow", expect.anything());
      fireEvent.click(trigger);
      await waitFor(() =>
        expect(add).toHaveBeenCalledWith("pageshow", expect.any(Function)),
      );
      fireEvent.click(trigger);
      await waitFor(() =>
        expect(remove).toHaveBeenCalledWith("pageshow", expect.any(Function)),
      );
      add.mockRestore();
      remove.mockRestore();
    });
  });
});
