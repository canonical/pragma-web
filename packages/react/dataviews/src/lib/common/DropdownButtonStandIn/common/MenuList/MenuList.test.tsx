import { assertInvariant } from "@canonical/dataviews-core/bindings";
import { Button } from "@canonical/react-ds-global";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import {
  elementAt,
  installPopoverStandIn,
} from "../../../../../../testing/index.js";
import withDropdownMenu from "../../withDropdownMenu.js";
import type { DropdownMenuEntry } from "../Menu/types.js";
import MenuList from "./MenuList.js";

let uninstall: () => void;
beforeAll(() => {
  uninstall = installPopoverStandIn();
});
afterAll(() => uninstall());

/** Waits for the open menu's item named `name` to hold focus. */
const waitForItemFocus = (name: string) =>
  waitFor(() => expect(screen.getByRole("menuitem", { name })).toHaveFocus());

const items: DropdownMenuEntry[] = [
  { key: "cut", label: "Cut" },
  { key: "copy", label: "Copy" },
  { type: "separator", key: "s" },
  { key: "paste", label: "Paste", disabled: true },
  { url: "#docs", label: "Docs" },
];

const onSelect = vi.fn();

const Trigger = withDropdownMenu(Button);

/** The trigger and its menu of `items`. */
const ActionsTrigger = ({ children }: { children: string }) => (
  <Trigger items={items} onSelect={onSelect}>
    {children}
  </Trigger>
);

/** Renders the trigger and its menu, closed. */
const renderMenu = () => {
  render(<ActionsTrigger>Actions</ActionsTrigger>);
  const trigger = assertInvariant(
    screen.getByText("Actions").closest("button"),
    "the element renders",
  );
  const panel = assertInvariant(
    trigger.nextElementSibling,
    "the element renders",
  ) as HTMLElement;
  return { trigger, panel };
};

/** Presses a key on whatever has focus. */
const press = (key: string) =>
  fireEvent.keyDown(
    assertInvariant(document.activeElement, "the element renders") as Element,
    { key },
  );

describe("MenuList", () => {
  describe("opening", () => {
    it("is a named menu of items, only while open", async () => {
      const { trigger, panel } = renderMenu();
      expect(panel.querySelector('[role="menu"]')).toBeNull();
      fireEvent.click(trigger);
      await waitForItemFocus("Cut");
      const menu = panel.querySelector('[role="menu"]');
      expect(menu).toHaveAttribute("aria-labelledby", trigger.id);
      expect(menu).toHaveClass("ds", "dropdown-button-menu");
      expect(menu?.querySelectorAll('[role="menuitem"]')).toHaveLength(4);
      expect(menu?.querySelector("hr.separator")).not.toBeNull();
      expect(screen.getByText("Paste").parentElement).toHaveAttribute(
        "aria-disabled",
        "true",
      );
    });

    it.each([
      ["a click", (trigger: HTMLElement) => fireEvent.click(trigger)],
      [
        "ArrowDown",
        (trigger: HTMLElement) =>
          fireEvent.keyDown(trigger, { key: "ArrowDown" }),
      ],
    ])("focuses the first item when opened by %s", async (_way, open) => {
      const { trigger } = renderMenu();
      act(() => trigger.focus());
      open(trigger);
      await waitForItemFocus("Cut");
    });

    it("focuses the last enabled item when opened by ArrowUp", async () => {
      const { trigger } = renderMenu();
      act(() => trigger.focus());
      fireEvent.keyDown(trigger, { key: "ArrowUp" });
      await waitForItemFocus("Docs");
    });

    it("unmounts when the menu closes, leaving the static list", async () => {
      const { trigger, panel } = renderMenu();
      fireEvent.click(trigger);
      await waitForItemFocus("Cut");
      fireEvent.click(trigger);
      await waitFor(() =>
        expect(panel.querySelector('[role="menu"]')).toBeNull(),
      );
      expect(panel.querySelector(".dropdown-button-menu")).not.toBeNull();
    });
  });

  describe("the keyboard", () => {
    const openByKeyboard = async () => {
      const parts = renderMenu();
      act(() => parts.trigger.focus());
      fireEvent.keyDown(parts.trigger, { key: "ArrowDown" });
      await waitForItemFocus("Cut");
      return parts;
    };

    it("moves with the arrows, wrapping, and reaches the ends", async () => {
      await openByKeyboard();
      press("ArrowUp");
      await waitForItemFocus("Docs");
      press("ArrowDown");
      await waitForItemFocus("Cut");
      press("End");
      await waitForItemFocus("Docs");
      press("Home");
      await waitForItemFocus("Cut");
    });

    it("moves to the first item whose label starts with what was typed", async () => {
      await openByKeyboard();
      press("d");
      await waitForItemFocus("Docs");
    });

    it("chooses with Enter, closes, and returns focus to the trigger", async () => {
      onSelect.mockClear();
      const { trigger, panel } = await openByKeyboard();
      press("Enter");
      await waitFor(() => expect(trigger).toHaveFocus());
      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({ key: "cut" }),
        expect.anything(),
      );
      expect(panel.matches(":popover-open")).toBe(false);
    });

    it.each(["Escape", "Tab"])(
      "closes on %s, with focus on the trigger",
      async (key) => {
        const { trigger, panel } = await openByKeyboard();
        press(key);
        await waitFor(() => expect(trigger).toHaveFocus());
        expect(panel.matches(":popover-open")).toBe(false);
      },
    );

    it("leaves Escape to the popover, unhandled and uncancelled", async () => {
      const { panel } = await openByKeyboard();
      const seen = vi.fn((event: KeyboardEvent) => event.defaultPrevented);
      // The popover's close request runs at the document; the key must reach
      // it, so the menu neither stops nor cancels it.
      document.addEventListener("keydown", seen);
      press("Escape");
      document.removeEventListener("keydown", seen);
      expect(seen).toHaveReturnedWith(false);
      await waitFor(() =>
        expect(panel.querySelector('[role="menu"]')).toBeNull(),
      );
      expect(panel.matches(":popover-open")).toBe(false);
    });

    it("leaves no stale state after a click outside", async () => {
      const { trigger, panel } = await openByKeyboard();
      fireEvent.pointerUp(document.body);
      await waitFor(() =>
        expect(trigger).toHaveAttribute("aria-expanded", "false"),
      );
      expect(panel.matches(":popover-open")).toBe(false);
      expect(panel.querySelector('[role="menu"]')).toBeNull();
    });

    it("keeps the menu open on a modified click on a link", async () => {
      onSelect.mockClear();
      const { panel } = await openByKeyboard();
      fireEvent.click(screen.getByText("Docs"), { metaKey: true });
      expect(onSelect).not.toHaveBeenCalled();
      expect(panel.matches(":popover-open")).toBe(true);
    });
  });

  it("leaves the hook's other keys to it", async () => {
    render(<MenuList items={items} hide={() => {}} focusIntent="first" />);
    await waitForItemFocus("Cut");
    fireEvent.keyDown(screen.getByRole("menu"), { key: "End" });
    await waitForItemFocus("Docs");
  });

  it("chooses without an onSelect", async () => {
    const hide = vi.fn();
    render(
      <MenuList
        items={[{ key: "cut", label: "Cut" }]}
        hide={hide}
        focusIntent="first"
      />,
    );
    fireEvent.click(screen.getByText("Cut"));
    expect(hide).toHaveBeenCalledTimes(1);
  });

  it("opens an empty menu at its end without a target", () => {
    render(<MenuList items={[]} hide={() => {}} focusIntent="last" />);
    expect(screen.getByRole("menu")).toBeEmptyDOMElement();
  });

  it("cancels every pending focus move when it unmounts", async () => {
    const schedule = window.requestAnimationFrame.bind(window);
    const ids: number[] = [];
    const request = vi
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((callback) => {
        const id = schedule(callback);
        ids.push(id);
        return id;
      });
    const cancel = vi.spyOn(window, "cancelAnimationFrame");
    const { unmount } = render(
      <MenuList
        items={[{ key: "cut", label: "Cut" }]}
        hide={() => {}}
        focusIntent="last"
      />,
    );
    unmount();
    // The menu's own move, as well as the hook's, is cancelled.
    expect(ids.length).toBeGreaterThan(1);
    expect(cancel.mock.calls.map(([id]) => id)).toEqual(
      expect.arrayContaining(ids),
    );
    request.mockRestore();
    cancel.mockRestore();
  });

  describe("a menu opened before hydration", () => {
    /** Server-renders the menu, opens it and focuses `focus` before hydrating. */
    const hydrateOpen = async (
      focus: (container: HTMLElement) => HTMLElement,
    ) => {
      const ui = (
        <>
          <ActionsTrigger>Actions</ActionsTrigger>
          <button type="button">Elsewhere</button>
        </>
      );
      const container = document.createElement("div");
      container.innerHTML = renderToString(ui);
      document.body.append(container);
      assertInvariant(
        container.querySelector("button"),
        "the element renders",
      ).click();
      await Promise.resolve();
      const focused = focus(container);
      act(() => focused.focus());
      const root = await act(async () => hydrateRoot(container, ui));
      return { container, root };
    };

    it("keeps focus on the item that had it", async () => {
      const { container, root } = await hydrateOpen((container) =>
        assertInvariant(container.querySelector("a"), "the element renders"),
      );
      await waitForItemFocus("Docs");
      act(() => root.unmount());
      container.remove();
    });

    it("leaves focus outside when it was outside", async () => {
      // The hook first moves focus into the menu; the menu then sends it back.
      const focusedItems: string[] = [];
      const recordFocus = (event: FocusEvent) => {
        const { target } = event;
        if (
          target instanceof HTMLElement &&
          target.getAttribute("role") === "menuitem"
        ) {
          focusedItems.push(String(target.textContent));
        }
      };
      document.addEventListener("focusin", recordFocus);
      const { container, root } = await hydrateOpen((container) =>
        elementAt([...container.querySelectorAll("button")], -1),
      );
      const elsewhere = screen.getByRole("button", { name: "Elsewhere" });
      await waitFor(() => {
        expect(focusedItems).not.toHaveLength(0);
        expect(elsewhere).toHaveFocus();
      });
      document.removeEventListener("focusin", recordFocus);
      act(() => root.unmount());
      container.remove();
    });
  });
});
