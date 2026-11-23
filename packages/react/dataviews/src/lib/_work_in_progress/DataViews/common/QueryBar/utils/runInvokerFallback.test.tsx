import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { installDialogStandIn } from "../../../../../../../testing/index.js";
import runInvokerFallback from "./runInvokerFallback.js";
import spellInvoker from "./spellInvoker.js";

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
    uninstall = installDialogStandIn({ invokers: false });
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
    uninstall = installDialogStandIn();
    const { container } = renderDialog();
    const dialog = container.querySelector("dialog") as HTMLDialogElement;
    let shows = 0;
    const showModal = dialog.showModal.bind(dialog);
    dialog.showModal = () => {
      shows += 1;
      showModal();
    };
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(dialog.open).toBe(true);
    // Only the browser's own command showed it.
    expect(shows).toBe(0);
  });
});
