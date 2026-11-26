import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import runInvokerFallback from "./runInvokerFallback.js";
import spellInvoker from "./spellInvoker.js";

/**
 * Make the page a browser that runs no invoker command: the shared dialog
 * stand-in leaves a click whose default is prevented alone, so a button's
 * `commandfor` does nothing but what its own handler does.
 *
 * @returns A function that brings invoker commands back.
 */
const withoutInvokers = (): (() => void) => {
  const prevent = (event: Event): void => {
    if (
      event.target instanceof Element &&
      event.target.closest("button[commandfor]") !== null
    ) {
      event.preventDefault();
    }
  };
  document.addEventListener("click", prevent, true);
  return () => document.removeEventListener("click", prevent, true);
};

/** A dialog, and buttons that show and close it, or name nothing. */
const renderDialog = () =>
  render(
    <>
      <button
        type="button"
        {...spellInvoker("show-modal", "sheet")}
        onClick={runInvokerFallback}
      >
        Open
      </button>
      <button
        type="button"
        {...spellInvoker("show-modal", "missing")}
        onClick={runInvokerFallback}
      >
        Nothing
      </button>
      <button type="button" onClick={runInvokerFallback}>
        Unnamed
      </button>
      <dialog id="sheet">
        <button
          type="button"
          {...spellInvoker("close", "sheet")}
          onClick={runInvokerFallback}
        >
          Close
        </button>
      </dialog>
    </>,
  );

describe("runInvokerFallback", () => {
  let uninstall: () => void = () => {};

  afterEach(() => {
    uninstall();
  });

  it("shows and closes the dialog where the browser runs no invoker command", () => {
    uninstall = withoutInvokers();
    const { container } = renderDialog();
    const dialog = container.querySelector("dialog") as HTMLDialogElement;
    fireEvent.click(screen.getByRole("button", { name: "Nothing" }));
    fireEvent.click(screen.getByRole("button", { name: "Unnamed" }));
    expect(dialog.open).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(dialog.open).toBe(true);
    // Shown already, it is not shown again.
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(dialog.open).toBe(false);
    // Closed already, it is not closed again.
    fireEvent.click(
      screen.getByRole("button", { name: "Close", hidden: true }),
    );
    expect(dialog.open).toBe(false);
  });

  it("leaves the command to a browser that runs it", () => {
    // A browser with invoker commands has the property; its own run of the
    // command is held back, so only the fallback could show the dialog.
    Object.defineProperty(HTMLButtonElement.prototype, "command", {
      configurable: true,
      get(this: HTMLButtonElement) {
        return this.getAttribute("command") ?? "";
      },
    });
    const restore = withoutInvokers();
    uninstall = () => {
      restore();
      delete (HTMLButtonElement.prototype as { command?: string }).command;
    };
    const { container } = renderDialog();
    const dialog = container.querySelector("dialog") as HTMLDialogElement;
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(dialog.open).toBe(false);
  });
});
