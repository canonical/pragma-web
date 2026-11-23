/**
 * Narrow mode: the container's width followed, and the stop and focus moved
 * off the hidden chips as the bar narrows.
 */
import { act, fireEvent, render, screen } from "@testing-library/react";
import { type ReactElement, useRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  installResizeObserverStandIn,
  type ResizeObserverStandIn,
} from "../../../../../../../testing/index.js";
import useNarrowMode from "./useNarrowMode.js";

/** A bar's shape: a chip list and an entry, saying whether it is narrow. */
function Bar({
  onNarrow,
  onWide = () => {},
}: {
  readonly onNarrow: () => void;
  readonly onWide?: () => void;
}): ReactElement {
  const rootRef = useRef<HTMLDivElement>(null);
  const entryRef = useRef<HTMLInputElement>(null);
  const isNarrow = useNarrowMode({ rootRef, entryRef, onNarrow, onWide });
  return (
    <div ref={rootRef} data-testid="root" data-narrow={isNarrow}>
      <ul className="ds query-chips">
        <li>
          <button type="button">status</button>
        </li>
      </ul>
      <input ref={entryRef} aria-label="Entry" />
      <button type="button">Elsewhere</button>
    </div>
  );
}

describe("useNarrowMode", () => {
  let standIn: ResizeObserverStandIn;

  beforeEach(() => {
    standIn = installResizeObserverStandIn();
  });

  afterEach(() => {
    standIn.uninstall();
    document.documentElement.style.fontSize = "";
  });

  it("is wide until a size is reported, and follows the 37.5rem width", () => {
    render(<Bar onNarrow={() => {}} />);
    const root = screen.getByTestId("root");
    expect(root).toHaveAttribute("data-narrow", "false");
    act(() => {
      standIn.resize(root, 599);
    });
    expect(root).toHaveAttribute("data-narrow", "true");
    act(() => {
      standIn.resize(root, 600);
    });
    expect(root).toHaveAttribute("data-narrow", "false");
  });

  it("reads the rem from the document's root font size", () => {
    document.documentElement.style.fontSize = "20px";
    render(<Bar onNarrow={() => {}} />);
    const root = screen.getByTestId("root");
    act(() => {
      standIn.resize(root, 700);
    });
    expect(root).toHaveAttribute("data-narrow", "true");
  });

  it("moves the stop off the chips, and focus in a chip to the entry, as it narrows", () => {
    const onNarrow = vi.fn();
    render(<Bar onNarrow={onNarrow} />);
    const root = screen.getByTestId("root");
    screen.getByRole("button", { name: "status" }).focus();
    act(() => {
      standIn.resize(root, 320);
    });
    expect(onNarrow).toHaveBeenCalledOnce();
    expect(screen.getByRole("textbox", { name: "Entry" })).toHaveFocus();
    // Still narrow: nothing moves again.
    act(() => {
      standIn.resize(root, 300);
    });
    expect(onNarrow).toHaveBeenCalledOnce();
  });

  it("moves focus a hidden chip dropped to the entry, and none that left the chips", () => {
    const onNarrow = vi.fn();
    render(<Bar onNarrow={onNarrow} />);
    const root = screen.getByTestId("root");
    const chip = screen.getByRole("button", { name: "status" });
    // Hidden by the container query, the chip lets focus drop to the page.
    chip.focus();
    chip.blur();
    act(() => {
      standIn.resize(root, 320);
    });
    expect(screen.getByRole("textbox", { name: "Entry" })).toHaveFocus();
    act(() => {
      standIn.resize(root, 1024);
    });
    // Focus that went elsewhere and was then dropped moves nowhere.
    screen.getByRole("button", { name: "Elsewhere" }).focus();
    (document.activeElement as HTMLElement).blur();
    act(() => {
      standIn.resize(root, 320);
    });
    expect(document.body).toHaveFocus();
  });

  it("leaves focus outside the chips where it is", () => {
    const onNarrow = vi.fn();
    render(<Bar onNarrow={onNarrow} />);
    const elsewhere = screen.getByRole("button", { name: "Elsewhere" });
    elsewhere.focus();
    act(() => {
      standIn.resize(screen.getByTestId("root"), 320);
    });
    expect(onNarrow).toHaveBeenCalledOnce();
    expect(elsewhere).toHaveFocus();
  });

  it("stops observing once unmounted", () => {
    const { unmount } = render(<Bar onNarrow={() => {}} />);
    const root = screen.getByTestId("root");
    expect(standIn.observing(root)).toBe(1);
    unmount();
    expect(standIn.observing(root)).toBe(0);
  });

  it("tells widening, once the bar has been narrow", () => {
    const onWide = vi.fn();
    render(<Bar onNarrow={() => {}} onWide={onWide} />);
    const root = screen.getByTestId("root");
    act(() => {
      standIn.resize(root, 1024);
    });
    expect(onWide).not.toHaveBeenCalled();
    act(() => {
      standIn.resize(root, 320);
    });
    act(() => {
      standIn.resize(root, 1024);
    });
    expect(onWide).toHaveBeenCalledOnce();
  });

  it("keeps a chip's focus that a press on the chip itself left", () => {
    render(<Bar onNarrow={() => {}} />);
    const root = screen.getByTestId("root");
    const chip = screen.getByRole("button", { name: "status" });
    chip.focus();
    fireEvent.pointerDown(chip);
    chip.blur();
    act(() => {
      standIn.resize(root, 320);
    });
    expect(screen.getByRole("textbox", { name: "Entry" })).toHaveFocus();
  });

  it("forgets a chip's focus that a press elsewhere took away", () => {
    render(<Bar onNarrow={() => {}} />);
    const root = screen.getByTestId("root");
    const chip = screen.getByRole("button", { name: "status" });
    chip.focus();
    // A press on blank page drops focus with it.
    fireEvent.pointerDown(document.body);
    chip.blur();
    act(() => {
      standIn.resize(root, 320);
    });
    expect(document.body).toHaveFocus();
  });
});
