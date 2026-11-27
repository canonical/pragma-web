import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Item from "./Item.js";

describe("Item", () => {
  it("renders a link item as a link, and an action as script-only", () => {
    render(
      <>
        <Item item={{ url: "#docs", label: "Docs" }} />
        <Item item={{ key: "copy", label: "Copy", icon: "⧉", slot: "⌘C" }} />
      </>,
    );
    expect(screen.getByText("Docs").closest("a")).toHaveAttribute(
      "href",
      "#docs",
    );
    const copy = screen.getByText("Copy").parentElement as HTMLElement;
    expect(copy).toHaveClass("script-only");
    expect(screen.getByText("Docs").closest("a")).not.toHaveClass(
      "script-only",
    );
    expect(copy.textContent).toBe("⧉Copy⌘C");
  });

  it("drops a disabled link's href, and stays focusable", () => {
    render(
      <Item
        item={{ url: "#gone", label: "Gone", disabled: true }}
        itemProps={{ tabIndex: -1 }}
      />,
    );
    const gone = screen.getByText("Gone").parentElement as HTMLElement;
    expect(gone).not.toHaveAttribute("href");
    expect(gone).toHaveClass("script-only");
    expect(gone).toHaveAttribute("aria-disabled", "true");
    expect(gone).not.toHaveClass("disabled");
    expect(gone).toHaveAttribute("tabindex", "-1");
  });

  it("renders a custom component, and a caret on a submenu parent", () => {
    render(
      <>
        <Item
          item={{
            key: "c",
            label: "Special",
            displayItemsType: "custom",
            Component: ({ item }) => <em>Custom {item.label}</em>,
          }}
        />
        <Item item={{ key: "p", label: "Parent", items: [{ key: "x" }] }} />
      </>,
    );
    expect(screen.getByText("Custom Special")).toBeInTheDocument();
    expect(
      screen.getByText("Parent").parentElement?.querySelector(".caret"),
    ).toHaveAttribute("aria-hidden", "true");
  });

  it("chooses an enabled leaf on a click, Enter or Space", () => {
    const onSelect = vi.fn();
    const onClick = vi.fn();
    render(
      <Item
        item={{ key: "copy", label: "Copy" }}
        itemProps={{ onClick }}
        onSelect={onSelect}
      />,
    );
    const copy = screen.getByText("Copy").parentElement as HTMLElement;
    fireEvent.click(copy);
    fireEvent.keyDown(copy, { key: "Enter" });
    fireEvent.keyDown(copy, { key: " " });
    fireEvent.keyDown(copy, { key: "a" });
    expect(onSelect).toHaveBeenCalledTimes(3);
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it("never chooses a disabled item, and leaves modified link clicks", () => {
    const onSelect = vi.fn();
    const itemProps = {};
    render(
      <>
        <Item
          item={{ key: "off", label: "Off", disabled: true }}
          itemProps={itemProps}
          onSelect={onSelect}
        />
        <Item
          item={{ url: "#docs", label: "Docs" }}
          itemProps={itemProps}
          onSelect={onSelect}
        />
      </>,
    );
    fireEvent.click(screen.getByText("Off"));
    fireEvent.click(screen.getByText("Docs"), { metaKey: true });
    fireEvent.click(screen.getByText("Docs"), { button: 1 });
    expect(onSelect).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText("Docs"));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("opens a parent through onSelect, not the tree's click", () => {
    const onSelect = vi.fn();
    const onClick = vi.fn();
    render(
      <Item
        item={{ key: "p", label: "Parent", items: [{ key: "x" }] }}
        itemProps={{ onClick }}
        onSelect={onSelect}
      />,
    );
    fireEvent.keyDown(screen.getByText("Parent"), { key: "Enter" });
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("leaves a modified Enter on a link to the browser", () => {
    const onSelect = vi.fn();
    render(
      <Item
        item={{ url: "#docs", label: "Docs" }}
        itemProps={{}}
        onSelect={onSelect}
      />,
    );
    const link = screen.getByText("Docs").parentElement as HTMLElement;
    const event = new KeyboardEvent("keydown", {
      key: "Enter",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    link.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("takes no handlers before the menu opens", () => {
    const onSelect = vi.fn();
    render(<Item item={{ key: "copy", label: "Copy" }} onSelect={onSelect} />);
    const copy = screen.getByText("Copy").parentElement as HTMLElement;
    fireEvent.click(copy);
    fireEvent.keyDown(copy, { key: "Enter" });
    expect(onSelect).not.toHaveBeenCalled();
    expect(copy).not.toHaveAttribute("role");
  });

  it("opens a parent with a url without following it", () => {
    const onSelect = vi.fn();
    render(
      <Item
        item={{ url: "#more", label: "More", items: [{ key: "x" }] }}
        itemProps={{}}
        onSelect={onSelect}
      />,
    );
    const link = screen.getByText("More").parentElement as HTMLElement;
    const click = new MouseEvent("click", { bubbles: true, cancelable: true });
    link.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("opens a parent with a url on a modified Enter too", () => {
    const onSelect = vi.fn();
    render(
      <Item
        item={{ url: "#more", label: "More", items: [{ key: "x" }] }}
        itemProps={{}}
        onSelect={onSelect}
      />,
    );
    fireEvent.keyDown(screen.getByText("More"), {
      key: "Enter",
      ctrlKey: true,
    });
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
