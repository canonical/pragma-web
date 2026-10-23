import { fireEvent, render } from "@testing-library/react";
import { type ReactElement, useRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import useOpenShortcut from "./useOpenShortcut.js";

/** A dialog the shortcut opens, or none when `attached` is false. */
const Harness = ({
  attached = true,
}: {
  readonly attached?: boolean;
}): ReactElement => {
  const dialog = useRef<HTMLDialogElement>(null);
  useOpenShortcut(dialog);
  return attached ? <dialog aria-label="Palette" ref={dialog} /> : <p />;
};

/** The harness's dialog. */
const findDialog = (container: HTMLElement): HTMLDialogElement => {
  const dialog = container.querySelector("dialog");
  if (dialog === null) throw new Error("the harness rendered no dialog");
  return dialog;
};

/** Press K on the document as `init` says, and report whether its default ran. */
const press = (init: KeyboardEventInit): boolean =>
  fireEvent.keyDown(document, { key: "k", ...init });

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useOpenShortcut", () => {
  it.each([
    ["Ctrl+K", { ctrlKey: true }],
    ["Cmd+K", { metaKey: true }],
    ["Cmd+K with Caps Lock", { metaKey: true, key: "K" }],
  ])("opens the dialog on %s, preventing the browser's own", (_, init) => {
    const { container } = render(<Harness />);
    expect(press(init)).toBe(false);
    expect(findDialog(container).open).toBe(true);
  });

  it.each([
    ["a plain K", {}],
    ["Ctrl with another key", { ctrlKey: true, key: "j" }],
    ["Alt+Ctrl+K", { altKey: true, ctrlKey: true }],
    ["Shift+Ctrl+K", { shiftKey: true, ctrlKey: true }],
    ["an auto-repeat", { ctrlKey: true, repeat: true }],
    ["a key mid-composition", { ctrlKey: true, isComposing: true }],
  ])("leaves %s to the browser", (_, init) => {
    const { container } = render(<Harness />);
    expect(press(init)).toBe(true);
    expect(findDialog(container).open).toBe(false);
  });

  it("does not open an open dialog again, and still takes the chord", () => {
    const { container } = render(<Harness />);
    press({ ctrlKey: true });
    const showModal = vi.spyOn(findDialog(container), "showModal");
    expect(press({ ctrlKey: true })).toBe(false);
    expect(showModal).not.toHaveBeenCalled();
    expect(findDialog(container).open).toBe(true);
  });

  it("leaves the chord to the browser while no dialog is mounted", () => {
    render(<Harness attached={false} />);
    expect(press({ ctrlKey: true })).toBe(true);
  });

  it("stops listening when it unmounts", () => {
    const { container, unmount } = render(<Harness />);
    const dialog = findDialog(container);
    unmount();
    expect(press({ ctrlKey: true })).toBe(true);
    expect(dialog.open).toBe(false);
  });
});
