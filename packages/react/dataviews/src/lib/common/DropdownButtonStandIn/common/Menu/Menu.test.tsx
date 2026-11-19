import { assertInvariant } from "@canonical/dataviews-core/bindings";
import { Button } from "@canonical/react-ds-global";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import installPopoverStandIn from "../../../../../../testing/installPopoverStandIn.js";
import withDropdownPanel from "../../withDropdownPanel.js";
import { DropdownPanel } from "../Panel/index.js";
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

const onSelect = vi.fn();

const ActionsTrigger = withDropdownPanel(Button, ({ ref, id, triggerId }) => (
  <DropdownPanel ref={ref} id={id} aria-labelledby={triggerId}>
    <Menu items={items} onSelect={onSelect} data-testid="menu" />
  </DropdownPanel>
));

/** Opens the menu through its trigger. */
const openMenu = async () => {
  render(<ActionsTrigger>Actions</ActionsTrigger>);
  const trigger = assertInvariant(
    screen.getByText("Actions").closest("button"),
    "the element renders",
  );
  fireEvent.click(trigger);
  await flushToggles();
  return trigger;
};

describe("DropdownPanel.Menu", () => {
  it("is attached to DropdownPanel", () => {
    expect(DropdownPanel.Menu).toBe(Menu);
    expect(Menu.displayName).toBe("DropdownPanel.Menu");
  });

  describe("items", () => {
    it("renders items and separators in order", () => {
      render(<Menu items={items} />);
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
      render(<Menu items={items} />);
      expect(screen.getByText("Docs").closest("a")).toHaveAttribute(
        "href",
        "/docs",
      );
      expect(
        screen.getByText("Rename").closest(".dropdown-button-menu-item"),
      ).toHaveAttribute("data-requires-script", "");
    });

    it("marks itself script-only only when no item is a link", () => {
      const { rerender } = render(<Menu items={items} data-testid="menu" />);
      expect(screen.getByTestId("menu")).not.toHaveAttribute(
        "data-requires-script",
      );
      rerender(<Menu items={items.slice(0, 2)} data-testid="menu" />);
      expect(screen.getByTestId("menu")).toHaveAttribute(
        "data-requires-script",
        "",
      );
    });

    it("keeps the consumer's props, its class first", () => {
      render(<Menu items={items} className="wide" data-testid="menu" />);
      expect(screen.getByTestId("menu").className).toBe(
        "ds dropdown-button-menu wide",
      );
    });
  });

  describe("in a panel", () => {
    it("makes the trigger advertise a menu, and the panel take no role", () => {
      render(<ActionsTrigger>Actions</ActionsTrigger>);
      const trigger = screen.getByText("Actions").closest("button");
      expect(trigger).toHaveAttribute("aria-haspopup", "menu");
      expect(trigger?.nextElementSibling).not.toHaveAttribute("role");
      expect(trigger?.nextElementSibling).not.toHaveAttribute(
        "aria-labelledby",
      );
    });

    it("calls onSelect with the item and the click, then closes", async () => {
      onSelect.mockClear();
      const trigger = await openMenu();
      const panel = assertInvariant(
        trigger.nextElementSibling,
        "the element renders",
      ) as HTMLElement;
      fireEvent.click(screen.getByText("Copy"));
      await flushToggles();
      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({ key: "copy" }),
        expect.objectContaining({ type: "click" }),
      );
      expect(panel.matches(":popover-open")).toBe(false);
    });

    it("never chooses a disabled item", async () => {
      onSelect.mockClear();
      const trigger = await openMenu();
      fireEvent.click(screen.getByText("Delete"));
      await flushToggles();
      expect(onSelect).not.toHaveBeenCalled();
      expect(
        (
          assertInvariant(
            trigger.nextElementSibling,
            "the element renders",
          ) as HTMLElement
        ).matches(":popover-open"),
      ).toBe(true);
    });

    it("renders its items without a panel, inert", () => {
      onSelect.mockClear();
      render(<Menu items={items} onSelect={onSelect} />);
      fireEvent.click(screen.getByText("Copy"));
      expect(onSelect).not.toHaveBeenCalled();
    });

    it("chooses without an onSelect, and still closes", async () => {
      const Plain = withDropdownPanel(Button, ({ ref, id, triggerId }) => (
        <DropdownPanel ref={ref} id={id} aria-labelledby={triggerId}>
          <Menu items={items} />
        </DropdownPanel>
      ));
      render(<Plain>Plain</Plain>);
      const trigger = assertInvariant(
        screen.getByText("Plain").closest("button"),
        "the trigger renders",
      );
      fireEvent.click(trigger);
      await flushToggles();
      fireEvent.click(screen.getByText("Copy"));
      await flushToggles();
      expect(
        (
          assertInvariant(
            trigger.nextElementSibling,
            "the element renders",
          ) as HTMLElement
        ).matches(":popover-open"),
      ).toBe(false);
    });
  });
});
