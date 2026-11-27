import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { installPopoverStandIn } from "../../../../testing/index.js";
import ContextualMenu from "./ContextualMenu.js";
import type { MenuEntry } from "./types.js";
import { assertDefined } from "./utils/index.js";

let uninstall: () => void;
beforeAll(() => {
  uninstall = installPopoverStandIn();
});
afterAll(() => uninstall());

const items: MenuEntry[] = [
  { key: "cut", label: "Cut" },
  { key: "copy", label: "Copy" },
];

describe("ContextualMenu", () => {
  it("makes its own id, which a trigger points at", async () => {
    const { container } = render(<ContextualMenu items={items} />);
    const popover = assertDefined(
      container.querySelector<HTMLElement>("[popover]"),
      "the popover is rendered",
    );
    expect(popover.id).not.toBe("");
    expect(popover.style.getPropertyValue("position-anchor")).toMatch(/^--/);
    const trigger = document.createElement("button");
    trigger.id = "opener";
    trigger.setAttribute("popovertarget", popover.id);
    document.body.append(trigger);
    fireEvent.click(trigger);
    await waitFor(() =>
      expect(screen.getByRole("menuitem", { name: "Cut" })).toHaveFocus(),
    );
    expect(screen.getByRole("menu")).toHaveAttribute(
      "aria-labelledby",
      "opener",
    );
    trigger.remove();
  });

  it("takes an id, a class, a style and the toggle listeners", async () => {
    const onBeforeToggle = vi.fn();
    const onToggle = vi.fn();
    render(
      <>
        <button type="button" popoverTarget="menu">
          Actions
        </button>
        <ContextualMenu
          id="menu"
          items={items}
          className="wide"
          style={{ minInlineSize: "20rem" }}
          onBeforeToggle={onBeforeToggle}
          onToggle={onToggle}
        />
      </>,
    );
    const popover = assertDefined(
      document.getElementById("menu"),
      "the menu is rendered",
    );
    expect(popover).toHaveClass("ds", "contextual-menu", "wide");
    expect(popover.style.minInlineSize).toBe("20rem");
    expect(popover.style.getPropertyValue("position-anchor")).toBe("--menu");
    fireEvent.click(screen.getByText("Actions"));
    await waitFor(() =>
      expect(screen.getByRole("menuitem", { name: "Cut" })).toHaveFocus(),
    );
    expect(onBeforeToggle).toHaveBeenCalled();
    expect(onToggle).toHaveBeenCalled();
    // A trigger with no id leaves the menu unnamed.
    expect(screen.getByRole("menu")).not.toHaveAttribute("aria-labelledby");
  });

  it("focuses a disabled first item, which takes focus", async () => {
    render(
      <>
        <button type="button" popoverTarget="menu">
          Actions
        </button>
        <ContextualMenu
          id="menu"
          items={[{ key: "paste", label: "Paste", disabled: true }]}
        />
      </>,
    );
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() =>
      expect(screen.getByRole("menuitem", { name: "Paste" })).toHaveFocus(),
    );
  });

  it("focuses the menu itself when it holds no item", async () => {
    render(
      <>
        <button type="button" popoverTarget="menu">
          Actions
        </button>
        <ContextualMenu id="menu" items={[{ type: "separator", key: "s" }]} />
      </>,
    );
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(screen.getByRole("menu")).toHaveFocus());
  });

  it("opens with no trigger at all, unnamed", async () => {
    render(<ContextualMenu id="lonely" items={items} />);
    act(() =>
      assertDefined(
        document.getElementById("lonely"),
        "the menu is rendered",
      ).showPopover(),
    );
    await waitFor(() =>
      expect(screen.getByRole("menuitem", { name: "Cut" })).toHaveFocus(),
    );
    expect(screen.getByRole("menu")).not.toHaveAttribute("aria-labelledby");
    const errors = vi.fn();
    window.addEventListener("error", errors);
    act(() =>
      assertDefined(
        document.getElementById("lonely"),
        "the menu is rendered",
      ).hidePopover(),
    );
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    window.removeEventListener("error", errors);
    expect(errors).not.toHaveBeenCalled();
  });

  it("keeps focus in a menu reopened before its close was reported", async () => {
    render(
      <>
        <button type="button" id="opener" popoverTarget="menu">
          Actions
        </button>
        <ContextualMenu id="menu" items={items} />
      </>,
    );
    const trigger = screen.getByText("Actions");
    fireEvent.click(trigger);
    await waitFor(() =>
      expect(screen.getByRole("menuitem", { name: "Cut" })).toHaveFocus(),
    );
    const firstList = screen.getByRole("menu");
    const triggerFocus = vi.fn();
    trigger.addEventListener("focus", triggerFocus);
    fireEvent.click(screen.getByRole("menuitem", { name: "Copy" }));
    fireEvent.click(trigger);
    // A fresh list opens on its first item, and the late close never sent
    // focus to the trigger.
    await waitFor(() =>
      expect(screen.getByRole("menuitem", { name: "Cut" })).toHaveFocus(),
    );
    expect(screen.getByRole("menu")).not.toBe(firstList);
    expect(triggerFocus).not.toHaveBeenCalled();
  });

  describe("the trigger's arrows", () => {
    /** A trigger with an id, a second button, and the menu. */
    const renderPage = () => {
      render(
        <>
          <button type="button" id="opener" popoverTarget="menu">
            Actions
          </button>
          <button type="button">Elsewhere</button>
          <ContextualMenu id="menu" items={items} />
        </>,
      );
      return {
        trigger: screen.getByText("Actions"),
        popover: assertDefined(
          document.getElementById("menu"),
          "the menu is rendered",
        ),
      };
    };

    const waitForItemFocus = (name: string) =>
      waitFor(() =>
        expect(screen.getByRole("menuitem", { name })).toHaveFocus(),
      );

    it("open nothing in a tree that is no document", () => {
      const container = document.createElement("div");
      render(
        <>
          <button type="button" id="opener" popoverTarget="menu">
            Actions
          </button>
          <ContextualMenu id="menu" items={items} />
        </>,
        { container },
      );
      const event = new KeyboardEvent("keydown", {
        key: "ArrowDown",
        bubbles: true,
        cancelable: true,
      });
      act(() => {
        within(container).getByText("Actions").dispatchEvent(event);
      });
      expect(event.defaultPrevented).toBe(false);
    });

    it.each([
      ["ArrowDown", "Cut"],
      ["ArrowUp", "Copy"],
    ])("open the menu on %s, on %s", async (key, name) => {
      const { trigger, popover } = renderPage();
      const event = new KeyboardEvent("keydown", {
        key,
        bubbles: true,
        cancelable: true,
      });
      act(() => {
        trigger.dispatchEvent(event);
      });
      expect(event.defaultPrevented).toBe(true);
      expect(popover.matches(":popover-open")).toBe(true);
      await waitForItemFocus(name);
    });

    it("open on the first item again after an ArrowUp open closes", async () => {
      const { trigger } = renderPage();
      fireEvent.keyDown(trigger, { key: "ArrowUp" });
      await waitForItemFocus("Copy");
      fireEvent.keyDown(document.activeElement as Element, { key: "Escape" });
      await waitFor(() => expect(trigger).toHaveFocus());
      fireEvent.click(trigger);
      await waitForItemFocus("Cut");
    });

    it("move focus into an open menu, and the arrows go on from there", async () => {
      const { trigger } = renderPage();
      fireEvent.click(trigger);
      await waitForItemFocus("Cut");
      act(() => trigger.focus());
      fireEvent.keyDown(trigger, { key: "ArrowUp" });
      await waitForItemFocus("Copy");
      fireEvent.keyDown(document.activeElement as Element, { key: "ArrowUp" });
      await waitForItemFocus("Cut");
      act(() => trigger.focus());
      fireEvent.keyDown(trigger, { key: "ArrowDown" });
      await waitForItemFocus("Cut");
    });

    it("leave other keys, other elements and a prevented key alone", () => {
      const { trigger, popover } = renderPage();
      fireEvent.keyDown(trigger, { key: "a" });
      fireEvent.keyDown(screen.getByText("Elsewhere"), { key: "ArrowDown" });
      const prevented = new KeyboardEvent("keydown", {
        key: "ArrowDown",
        bubbles: true,
        cancelable: true,
      });
      prevented.preventDefault();
      trigger.dispatchEvent(prevented);
      expect(popover.matches(":popover-open")).toBe(false);
    });
  });
});
