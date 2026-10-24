import { act, fireEvent, render } from "@testing-library/react";
import { type ReactElement, useRef } from "react";
import { describe, expect, it, vi } from "vitest";
import type { UseBackdropCloseProps } from "./types.js";
import useBackdropClose from "./useBackdropClose.js";

/** An open dialog holding a field, closed by a click on its backdrop. */
const Harness = (
  handlers: Omit<UseBackdropCloseProps, "close">,
): ReactElement => {
  const dialog = useRef<HTMLDialogElement>(null);
  const backdrop = useBackdropClose({
    ...handlers,
    close: () => dialog.current?.close(),
  });
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: the click only identifies a click on the backdrop, which has no keyboard equivalent; Escape closes a dialog natively
    <dialog
      aria-label="Palette"
      onClick={backdrop.onClick}
      onPointerDown={backdrop.onPointerDown}
      onPointerUp={backdrop.onPointerUp}
      ref={dialog}
    >
      <input aria-label="Field" />
    </dialog>
  );
};

/** Render the harness and open its dialog. */
const renderOpen = (handlers: Omit<UseBackdropCloseProps, "close"> = {}) => {
  const { container } = render(<Harness {...handlers} />);
  const dialog = container.querySelector("dialog");
  const field = container.querySelector("input");
  if (dialog === null || field === null) {
    throw new Error("the harness rendered no dialog or no field");
  }
  act(() => {
    dialog.showModal();
  });
  return { dialog, field };
};

/**
 * Press on `pressed`, release on `released`, and click on the nearest
 * element holding both, as a browser does.
 */
const click = (
  pressed: Element,
  released: Element,
  clicked: Element = released,
): void => {
  fireEvent.pointerDown(pressed);
  fireEvent.pointerUp(released);
  fireEvent.click(clicked);
};

describe("useBackdropClose", () => {
  it("closes the dialog on a press and a release on its backdrop", () => {
    const { dialog } = renderOpen();
    click(dialog, dialog);
    expect(dialog.open).toBe(false);
  });

  it("leaves the dialog open when a press in the field is released on the backdrop", () => {
    const { dialog, field } = renderOpen();
    click(field, dialog);
    expect(dialog.open).toBe(true);
  });

  it("leaves the dialog open when a press on the backdrop is released in the field", () => {
    const { dialog, field } = renderOpen();
    click(dialog, field, dialog);
    expect(dialog.open).toBe(true);
  });

  it("leaves the dialog open on a click inside it", () => {
    const { dialog, field } = renderOpen();
    fireEvent.pointerDown(dialog);
    fireEvent.pointerUp(dialog);
    fireEvent.click(field);
    expect(dialog.open).toBe(true);
    fireEvent.click(dialog);
    expect(dialog.open).toBe(true);
  });

  it("calls the consumer's handlers, before closing", () => {
    const onPointerDown = vi.fn();
    const onPointerUp = vi.fn();
    const openOnClick: boolean[] = [];
    const onClick = vi.fn((event: { currentTarget: HTMLDialogElement }) => {
      openOnClick.push(event.currentTarget.open);
    });
    const { dialog } = renderOpen({ onClick, onPointerDown, onPointerUp });
    click(dialog, dialog);
    expect(onPointerDown).toHaveBeenCalledTimes(1);
    expect(onPointerUp).toHaveBeenCalledTimes(1);
    expect(openOnClick).toEqual([true]);
    expect(dialog.open).toBe(false);
  });
});
