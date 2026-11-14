import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import MenuItem from "./MenuItem.js";

describe("MenuItem", () => {
  describe("its root", () => {
    it("is a link for an item with a url, and a div otherwise", () => {
      render(
        <>
          <MenuItem item={{ url: "/docs", label: "Docs" }} />
          <MenuItem item={{ key: "copy", label: "Copy" }} />
        </>,
      );
      expect(screen.getByText("Docs").closest("a")).toHaveAttribute(
        "href",
        "/docs",
      );
      const action = screen.getByText("Copy").parentElement;
      expect(action?.tagName).toBe("DIV");
      expect(action).toHaveAttribute("data-requires-script", "");
    });

    it("drops a disabled link's href", () => {
      render(
        <MenuItem item={{ url: "/docs", label: "Docs", disabled: true }} />,
      );
      const link = screen.getByText("Docs").closest("a");
      expect(link).not.toHaveAttribute("href");
      expect(link).toHaveClass("disabled");
    });

    it("spreads the menu hook's props and the item's class", () => {
      render(
        <MenuItem
          item={{ key: "copy", label: "Copy", className: "copy" }}
          itemProps={{ role: "menuitem", tabIndex: 0 }}
        />,
      );
      const item = screen.getByRole("menuitem");
      expect(item).toHaveAttribute("tabindex", "0");
      expect(item.className).toBe("ds dropdown-button-menu-item copy");
    });
  });

  describe("its content", () => {
    it("renders the icon, the label and the slot", () => {
      render(
        <MenuItem
          item={{ key: "r", label: "Rename", icon: "✎", slot: "F2" }}
        />,
      );
      const item = screen.getByText("Rename").parentElement;
      expect(
        [...(item?.children ?? [])].map((child) => child.className),
      ).toEqual(["icon", "label", "slot"]);
    });

    it("renders a custom component when the item opts in", () => {
      const Custom = ({ item }: { item: { label?: string } }) => (
        <strong>{item.label}!</strong>
      );
      render(
        <>
          <MenuItem
            item={{
              key: "a",
              label: "A",
              displayItemsType: "custom",
              Component: Custom,
            }}
          />
          <MenuItem item={{ key: "b", label: "B", Component: Custom }} />
        </>,
      );
      expect(screen.getByText("A!")).toBeInTheDocument();
      expect(screen.getByText("B")).toHaveClass("label");
    });
  });

  describe("choosing it", () => {
    it("selects on a plain click, after the menu hook's click", () => {
      const calls: string[] = [];
      render(
        <MenuItem
          item={{ key: "copy", label: "Copy" }}
          itemProps={{ onClick: () => calls.push("hook") }}
          onSelect={() => calls.push("select")}
        />,
      );
      fireEvent.click(screen.getByText("Copy"));
      expect(calls).toEqual(["hook", "select"]);
    });

    it("selects on Enter and Space, through the click", () => {
      const onSelect = vi.fn();
      render(
        <MenuItem item={{ key: "copy", label: "Copy" }} onSelect={onSelect} />,
      );
      const item = screen.getByText("Copy").parentElement as HTMLElement;
      fireEvent.keyDown(item, { key: "Enter" });
      fireEvent.keyDown(item, { key: " " });
      fireEvent.keyDown(item, { key: "a" });
      expect(onSelect).toHaveBeenCalledTimes(2);
    });

    it("never selects a disabled item, and cancels its click", () => {
      const onSelect = vi.fn();
      render(
        <MenuItem
          item={{ key: "copy", label: "Copy", disabled: true }}
          onSelect={onSelect}
        />,
      );
      const event = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });
      screen.getByText("Copy").dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
      expect(onSelect).not.toHaveBeenCalled();
    });

    it("leaves a modified or non-primary click on a link to the browser", () => {
      const onSelect = vi.fn();
      render(
        <MenuItem item={{ url: "/docs", label: "Docs" }} onSelect={onSelect} />,
      );
      const link = screen.getByText("Docs");
      for (const init of [
        { metaKey: true },
        { ctrlKey: true },
        { shiftKey: true },
        { altKey: true },
        { button: 1 },
      ]) {
        fireEvent.click(link, init);
      }
      expect(onSelect).not.toHaveBeenCalled();
      fireEvent.click(link);
      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it("selects an action on a modified click", () => {
      const onSelect = vi.fn();
      render(
        <MenuItem item={{ key: "copy", label: "Copy" }} onSelect={onSelect} />,
      );
      fireEvent.click(screen.getByText("Copy"), { metaKey: true });
      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it("is inert without an onSelect", () => {
      render(<MenuItem item={{ key: "copy", label: "Copy" }} />);
      expect(() => {
        fireEvent.click(screen.getByText("Copy"));
        fireEvent.keyDown(screen.getByText("Copy"), { key: "Enter" });
      }).not.toThrow();
    });
  });
});
