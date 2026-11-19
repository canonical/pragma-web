import { assertInvariant } from "@canonical/dataviews-core/bindings";
import { Button } from "@canonical/react-ds-global";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { createRef } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import elementAt from "../../../../../../testing/elementAt.js";
import installPopoverStandIn from "../../../../../../testing/installPopoverStandIn.js";
import withDropdownPanel from "../../withDropdownPanel.js";
import type { DropdownMenuEntry } from "../Menu/types.js";
import { DropdownPanel } from "../Panel/index.js";
import MenuList from "./MenuList.js";

let uninstall: () => void;
beforeAll(() => {
  uninstall = installPopoverStandIn();
  // jsdom lays nothing out, so it has no scrollIntoView for the menu hook's
  // focus move to call.
  Element.prototype.scrollIntoView = () => {};
});
afterAll(() => {
  uninstall();
  Reflect.deleteProperty(Element.prototype, "scrollIntoView");
});

/** Lets the queued toggle events, the effects and the focus frames run. */
const flushFrames = () =>
  act(async () => {
    for (let frame = 0; frame < 4; frame += 1) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
  });

const items: DropdownMenuEntry[] = [
  { key: "cut", label: "Cut" },
  { key: "copy", label: "Copy" },
  { type: "separator", key: "s" },
  { key: "paste", label: "Paste", disabled: true },
  { url: "#docs", label: "Docs" },
];

const onSelect = vi.fn();

const ActionsTrigger = withDropdownPanel(Button, ({ ref, id, triggerId }) => (
  <DropdownPanel ref={ref} id={id} aria-labelledby={triggerId}>
    <DropdownPanel.Menu items={items} onSelect={onSelect} />
  </DropdownPanel>
));

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
      await flushFrames();
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
      await waitFor(() =>
        expect(document.activeElement).toHaveTextContent("Cut"),
      );
    });

    it("focuses the last enabled item when opened by ArrowUp", async () => {
      const { trigger } = renderMenu();
      act(() => trigger.focus());
      fireEvent.keyDown(trigger, { key: "ArrowUp" });
      await waitFor(() =>
        expect(document.activeElement).toHaveTextContent("Docs"),
      );
    });

    it("unmounts when the panel closes, leaving the static list", async () => {
      const { trigger, panel } = renderMenu();
      fireEvent.click(trigger);
      await flushFrames();
      fireEvent.click(trigger);
      await flushFrames();
      expect(panel.querySelector('[role="menu"]')).toBeNull();
      expect(panel.querySelector(".dropdown-button-menu")).not.toBeNull();
    });
  });

  describe("the keyboard", () => {
    const openByKeyboard = async () => {
      const parts = renderMenu();
      act(() => parts.trigger.focus());
      fireEvent.keyDown(parts.trigger, { key: "ArrowDown" });
      await flushFrames();
      return parts;
    };

    it("moves with the arrows, wrapping, and reaches the ends", async () => {
      await openByKeyboard();
      press("ArrowUp");
      await flushFrames();
      expect(document.activeElement).toHaveTextContent("Docs");
      press("ArrowDown");
      await flushFrames();
      expect(document.activeElement).toHaveTextContent("Cut");
      press("End");
      await flushFrames();
      expect(document.activeElement).toHaveTextContent("Docs");
      press("Home");
      await flushFrames();
      expect(document.activeElement).toHaveTextContent("Cut");
    });

    it("moves to the first item whose label starts with what was typed", async () => {
      await openByKeyboard();
      press("d");
      await flushFrames();
      expect(document.activeElement).toHaveTextContent("Docs");
    });

    it("chooses with Enter, closes, and returns focus to the trigger", async () => {
      onSelect.mockClear();
      const { trigger, panel } = await openByKeyboard();
      press("Enter");
      await flushFrames();
      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({ key: "cut" }),
        expect.anything(),
      );
      expect(panel.matches(":popover-open")).toBe(false);
      expect(document.activeElement).toBe(trigger);
    });

    it.each(["Escape", "Tab"])(
      "closes on %s, with focus on the trigger",
      async (key) => {
        const { trigger, panel } = await openByKeyboard();
        press(key);
        await flushFrames();
        expect(panel.matches(":popover-open")).toBe(false);
        expect(document.activeElement).toBe(trigger);
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
      await flushFrames();
      expect(panel.matches(":popover-open")).toBe(false);
    });

    it("leaves no stale state after a click outside", async () => {
      const { trigger, panel } = await openByKeyboard();
      fireEvent.pointerUp(document.body);
      await flushFrames();
      expect(panel.matches(":popover-open")).toBe(false);
      expect(trigger).toHaveAttribute("aria-expanded", "false");
      expect(panel.querySelector('[role="menu"]')).toBeNull();
    });

    it("keeps the menu open on a modified click on a link", async () => {
      onSelect.mockClear();
      const { panel } = await openByKeyboard();
      fireEvent.click(screen.getByText("Docs"), { metaKey: true });
      await flushFrames();
      expect(onSelect).not.toHaveBeenCalled();
      expect(panel.matches(":popover-open")).toBe(true);
    });
  });

  describe("the consumer's props", () => {
    it("reach the open list: its ref, onKeyDown and onMouseLeave", async () => {
      const onKeyDown = vi.fn();
      const onMouseLeave = vi.fn();
      const objectRef = createRef<HTMLDivElement>();
      const calls: string[] = [];
      const { rerender } = render(
        <MenuList
          items={items}
          hide={() => {}}
          focusIntent="first"
          ref={objectRef}
          onKeyDown={(event) => {
            calls.push("consumer");
            onKeyDown(event);
          }}
          onMouseLeave={onMouseLeave}
        />,
      );
      const list = screen.getByRole("menu");
      expect(objectRef.current).toBe(list);
      fireEvent.keyDown(list, { key: "End" });
      fireEvent.mouseLeave(list);
      expect(onKeyDown).toHaveBeenCalledTimes(1);
      expect(onMouseLeave).toHaveBeenCalledTimes(1);
      const callbackRef = vi.fn();
      rerender(
        <MenuList
          items={items}
          hide={() => {}}
          focusIntent="first"
          ref={callbackRef}
        />,
      );
      expect(callbackRef).toHaveBeenCalledWith(screen.getByRole("menu"));
      expect(calls).toEqual(["consumer"]);
    });

    it("hand back a callback ref's cleanup, which runs on unmount", () => {
      const cleanup = vi.fn();
      const callbackRef = vi.fn(() => cleanup);
      const { unmount } = render(
        <MenuList
          items={items}
          hide={() => {}}
          focusIntent="first"
          ref={callbackRef}
        />,
      );
      unmount();
      expect(cleanup).toHaveBeenCalledTimes(1);
      expect(callbackRef).not.toHaveBeenCalledWith(null);
    });

    it("run before the menu's own keyboard", async () => {
      const order: string[] = [];
      render(
        <MenuList
          items={items}
          hide={() => {}}
          focusIntent="first"
          onKeyDown={(event) =>
            order.push(`consumer ${event.defaultPrevented}`)
          }
        />,
      );
      await flushFrames();
      fireEvent.keyDown(screen.getByRole("menu"), { key: "End" });
      // The hook prevents the default only after the consumer has run.
      expect(order).toEqual(["consumer false"]);
    });
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

  it("opens an empty menu at its end without a target", async () => {
    render(<MenuList items={[]} hide={() => {}} focusIntent="last" />);
    await flushFrames();
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
      await flushFrames();
      return { container, root };
    };

    it("keeps focus on the item that had it", async () => {
      const { container, root } = await hydrateOpen(
        (container) =>
          assertInvariant(
            container.querySelector("a"),
            "the element renders",
          ) as HTMLElement,
      );
      await waitFor(() =>
        expect(document.activeElement).toHaveTextContent("Docs"),
      );
      act(() => root.unmount());
      container.remove();
    });

    it("leaves focus outside when it was outside", async () => {
      const { container, root } = await hydrateOpen((container) =>
        elementAt([...container.querySelectorAll("button")], -1),
      );
      await flushFrames();
      expect(document.activeElement).toHaveTextContent("Elsewhere");
      act(() => root.unmount());
      container.remove();
    });
  });
});
