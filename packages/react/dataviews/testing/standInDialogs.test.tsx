import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import standInDialogs from "./standInDialogs.js";

/** A dialog named "Ask", opened by "Open" and closed by "Close". */
const renderDialog = () => {
  render(
    <>
      <button type="button" commandfor="ask" command="show-modal">
        Open
      </button>
      <dialog id="ask" aria-label="Ask">
        <button type="button" disabled>
          Off
        </button>
        <button type="button" commandfor="ask" command="close">
          Close
        </button>
        <input aria-label="Name" />
      </dialog>
    </>,
  );
  return screen.getByRole<HTMLDialogElement>("dialog", { hidden: true });
};

describe("standInDialogs", () => {
  it("installs once: a second call keeps the stand-ins", () => {
    const { showModal } = HTMLDialogElement.prototype;
    standInDialogs();
    expect(HTMLDialogElement.prototype.showModal).toBe(showModal);
  });

  it("opens from its command, focusing the first enabled control", () => {
    const dialog = renderDialog();
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(dialog.open).toBe(true);
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
  });

  it("focuses the autofocus element first", () => {
    const dialog = renderDialog();
    // React focuses `autoFocus` itself and renders no attribute.
    screen
      .getByRole("textbox", { name: "Name", hidden: true })
      .setAttribute("autofocus", "");
    dialog.showModal();
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveFocus();
  });

  it("throws when shown while already open", () => {
    const dialog = renderDialog();
    dialog.showModal();
    expect(() => dialog.showModal()).toThrow("The dialog is already open.");
  });

  it("closes from its command, returning the focus to the opener", () => {
    const dialog = renderDialog();
    const open = screen.getByRole("button", { name: "Open" });
    let closes = 0;
    dialog.addEventListener("close", () => {
      closes += 1;
    });
    fireEvent.click(open);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(dialog.open).toBe(false);
    expect(open).toHaveFocus();
    dialog.close();
    expect(closes).toBe(1);
  });

  it("leaves the focus on the body when the opener is gone", () => {
    const dialog = renderDialog();
    const opener = document.createElement("button");
    document.body.append(opener);
    opener.focus();
    dialog.showModal();
    opener.remove();
    dialog.close();
    expect(document.body).toHaveFocus();
  });

  it("ignores disabled, prevented and dangling commands", () => {
    const dialog = renderDialog();
    const open = screen.getByRole<HTMLButtonElement>("button", {
      name: "Open",
    });
    open.disabled = true;
    fireEvent.click(open);
    expect(dialog.open).toBe(false);
    open.disabled = false;
    open.addEventListener("click", (event) => event.preventDefault(), {
      once: true,
    });
    fireEvent.click(open);
    expect(dialog.open).toBe(false);
    open.setAttribute("commandfor", "nowhere");
    fireEvent.click(open);
    open.removeAttribute("commandfor");
    fireEvent.click(open);
    fireEvent.click(document);
    expect(dialog.open).toBe(false);
  });

  it("does nothing for an open dialog's show-modal, or an unknown command", () => {
    const dialog = renderDialog();
    const open = screen.getByRole("button", { name: "Open" });
    dialog.showModal();
    fireEvent.click(open);
    expect(dialog.open).toBe(true);
    open.setAttribute("command", "toggle");
    fireEvent.click(open);
    expect(dialog.open).toBe(true);
  });

  it("cancels the open dialog on Escape, unless the cancel is prevented", () => {
    const dialog = renderDialog();
    dialog.showModal();
    fireEvent.keyDown(document, { key: "a" });
    expect(dialog.open).toBe(true);
    dialog.addEventListener("cancel", (event) => event.preventDefault(), {
      once: true,
    });
    expect(fireEvent.keyDown(document, { key: "Escape" })).toBe(false);
    expect(dialog.open).toBe(true);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(dialog.open).toBe(false);
  });

  it("leaves Escape alone with no dialog open, or once prevented", () => {
    const dialog = renderDialog();
    expect(fireEvent.keyDown(document, { key: "Escape" })).toBe(true);
    dialog.showModal();
    const name = screen.getByRole("textbox", { name: "Name" });
    name.addEventListener("keydown", (event) => event.preventDefault());
    fireEvent.keyDown(name, { key: "Escape" });
    expect(dialog.open).toBe(true);
  });
});
