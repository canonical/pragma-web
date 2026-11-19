import type { MenuEntry } from "@canonical/react-ds-global";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { isMenuSeparator } from "../utils/index.js";
import useMenuNavigation from "./useMenuNavigation.js";

const ITEMS: MenuEntry[] = [
  { key: "copy", label: "Copy" },
  { type: "separator", key: "s" },
  { key: "cut", label: "Cut" },
  { key: "paste", label: "Paste", disabled: true },
];

/** A list driven by the hook, as the open menu renders it. */
const Harness = ({
  items = ITEMS,
  onHide = () => {},
  label,
}: {
  items?: MenuEntry[];
  onHide?: () => void;
  label?: string;
}) => {
  const menu = useMenuNavigation({ items, wrap: true, onHide });
  const entries = menu.annotatedRoot.items ?? [];
  // A section is a plain HTMLElement, as the hook types its refs.
  return (
    <section
      {...menu.getMenuProps({
        ref: menu.popupRef,
        ...(label === undefined ? { labelledBy: "name" } : { label }),
      })}
      tabIndex={-1}
    >
      {entries.map((entry) =>
        isMenuSeparator(entry) ? (
          <hr key={entry.key} />
        ) : (
          <section key={entry.key} {...menu.getItemProps(entry)}>
            {entry.label}
          </section>
        ),
      )}
    </section>
  );
};

describe("useMenuNavigation", () => {
  it("names the menu and focuses its first enabled item", async () => {
    render(<Harness label="Edit" />);
    expect(screen.getByRole("menu", { name: "Edit" })).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole("menuitem", { name: "Copy" })).toHaveFocus(),
    );
  });

  it("names the menu by an element", () => {
    render(
      <>
        <span id="name">Actions</span>
        <Harness />
      </>,
    );
    expect(screen.getByRole("menu", { name: "Actions" })).toBeInTheDocument();
  });

  it("focuses the list when no item is enabled", async () => {
    render(<Harness items={[{ key: "x", label: "X", disabled: true }]} />);
    await waitFor(() => expect(screen.getByRole("menu")).toHaveFocus());
  });

  it("skips separators and moves focus with the arrows", async () => {
    Element.prototype.scrollIntoView = () => {};
    render(<Harness label="Edit" />);
    const copy = screen.getByRole("menuitem", { name: "Copy" });
    await waitFor(() => expect(copy).toHaveFocus());
    fireEvent.keyDown(copy, { key: "ArrowDown" });
    await waitFor(() =>
      expect(screen.getByRole("menuitem", { name: "Cut" })).toHaveFocus(),
    );
  });

  it("moves no focus while focus is outside the menu", async () => {
    render(
      <>
        <button type="button">Outside</button>
        <Harness label="Edit" />
      </>,
    );
    const copy = screen.getByRole("menuitem", { name: "Copy" });
    await waitFor(() => expect(copy).toHaveFocus());
    const outside = screen.getByRole("button", { name: "Outside" });
    outside.focus();
    act(() => {
      fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowDown" });
    });
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(outside).toHaveFocus();
  });

  it("closes on Tab, keeping focus from moving on", () => {
    const onHide = vi.fn();
    render(<Harness label="Edit" onHide={onHide} />);
    const tab = fireEvent.keyDown(screen.getByRole("menu"), { key: "Tab" });
    expect(tab).toBe(false);
    expect(onHide).toHaveBeenCalledOnce();
  });

  it("closes on Escape", () => {
    const onHide = vi.fn();
    render(<Harness label="Edit" onHide={onHide} />);
    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
    expect(onHide).toHaveBeenCalledOnce();
  });
});
