import { assertInvariant } from "@canonical/dataviews-core/bindings";
import { Button } from "@canonical/react-ds-global";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { installPopoverStandIn } from "../../../../../../testing/index.js";
import withDropdownMenu from "../../withDropdownMenu.js";
import type { PanelState } from "../Panel/hooks/index.js";
import Menu from "./Menu.js";
import type { DropdownMenuEntry, DropdownMenuItem } from "./types.js";

let uninstall: () => void;
beforeAll(() => {
  uninstall = installPopoverStandIn();
});
afterAll(() => uninstall());

/** Lets the queued toggle events reach React. */
const flushToggles = () => act(async () => {});

const Shortcut = ({ item }: { item: DropdownMenuItem }) => (
  <em>Custom {item.label}</em>
);

const items: DropdownMenuEntry[] = [
  { key: "rename", label: "Rename", icon: "✎", slot: "F2" },
  { key: "copy", label: "Copy", className: "copy" },
  { type: "separator", key: "danger" },
  { key: "delete", label: "Delete", disabled: true },
  { url: "/docs", label: "Docs" },
  {
    key: "custom",
    label: "Special",
    displayItemsType: "custom",
    Component: Shortcut,
  },
];

/** A closed panel's state, for the menu rendered on its own. */
const closed: PanelState = {
  panelId: "panel",
  triggerId: "trigger",
  anchorName: "--panel",
  elementRef: { current: null },
  isOpen: false,
  setOpen: () => {},
  focusIntent: "first",
  setFocusIntent: () => {},
  show: () => {},
  hide: () => {},
};

const ActionsTrigger = withDropdownMenu(Button);

/** Opens the menu through its trigger. */
const openMenu = async (props: {
  onSelect?: () => void;
  label?: string;
  labelledBy?: string;
}) => {
  render(
    <ActionsTrigger items={items} {...props}>
      Actions
    </ActionsTrigger>,
  );
  const trigger = assertInvariant(
    screen.getByText("Actions").closest("button"),
    "the element renders",
  );
  fireEvent.click(trigger);
  await waitFor(() => expect(screen.getByRole("menu")).toBeInTheDocument());
  return {
    trigger,
    panel: assertInvariant(
      trigger.nextElementSibling,
      "the element renders",
    ) as HTMLElement,
  };
};

describe("Menu", () => {
  describe("closed", () => {
    it("renders items and separators in order", () => {
      render(<Menu items={items} panel={closed} />);
      const menu = document.querySelector(".dropdown-button-menu");
      expect(
        [...(menu?.children ?? [])].map(
          (child) => child.textContent || child.tagName,
        ),
      ).toEqual([
        "✎RenameF2",
        "Copy",
        "HR",
        "Delete",
        "Docs",
        "Custom Special",
      ]);
    });

    it("renders a link item as a link, and an action item as script-only", () => {
      render(<Menu items={items} panel={closed} />);
      expect(screen.getByText("Docs").closest("a")).toHaveAttribute(
        "href",
        "/docs",
      );
      expect(
        screen.getByText("Rename").closest(".dropdown-button-menu-item"),
      ).toHaveAttribute("data-requires-script", "");
    });

    it("marks itself script-only only when no item is a link", () => {
      const { container, rerender } = render(
        <Menu items={items} panel={closed} />,
      );
      const menu = () =>
        assertInvariant(
          container.firstElementChild,
          "the element renders",
        ) as HTMLElement;
      expect(menu()).not.toHaveAttribute("data-requires-script");
      rerender(<Menu items={items.slice(0, 2)} panel={closed} />);
      expect(menu()).toHaveAttribute("data-requires-script", "");
    });

    it("is a static list: choosing does nothing", () => {
      const onSelect = vi.fn();
      render(<Menu items={items} onSelect={onSelect} panel={closed} />);
      fireEvent.click(screen.getByText("Copy"));
      expect(onSelect).not.toHaveBeenCalled();
      expect(screen.queryByRole("menu")).toBeNull();
    });
  });

  describe("open", () => {
    it("is named by its trigger", async () => {
      const { trigger } = await openMenu({});
      expect(screen.getByRole("menu")).toHaveAttribute(
        "aria-labelledby",
        trigger.id,
      );
    });

    it("takes a label in place of its trigger's name", async () => {
      await openMenu({ label: "Row actions" });
      const menu = screen.getByRole("menu", { name: "Row actions" });
      expect(menu).not.toHaveAttribute("aria-labelledby");
    });

    it("takes ids in place of its trigger, over a label", async () => {
      render(<span id="name">Row 3 actions</span>);
      await openMenu({ labelledBy: "name", label: "Ignored" });
      const menu = screen.getByRole("menu", { name: "Row 3 actions" });
      expect(menu).toHaveAttribute("aria-labelledby", "name");
      expect(menu).not.toHaveAttribute("aria-label");
    });

    it("calls onSelect with the item and the click, then closes", async () => {
      const onSelect = vi.fn();
      const { panel } = await openMenu({ onSelect });
      fireEvent.click(screen.getByText("Copy"));
      await flushToggles();
      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({ key: "copy" }),
        expect.objectContaining({ type: "click" }),
      );
      expect(panel.matches(":popover-open")).toBe(false);
    });

    it("never chooses a disabled item", async () => {
      const onSelect = vi.fn();
      const { panel } = await openMenu({ onSelect });
      fireEvent.click(screen.getByText("Delete"));
      expect(onSelect).not.toHaveBeenCalled();
      expect(panel.matches(":popover-open")).toBe(true);
    });

    it("chooses without an onSelect, and still closes", async () => {
      const { panel } = await openMenu({});
      fireEvent.click(screen.getByText("Copy"));
      await flushToggles();
      expect(panel.matches(":popover-open")).toBe(false);
    });
  });
});
