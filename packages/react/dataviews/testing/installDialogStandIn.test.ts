import { afterEach, describe, expect, it, vi } from "vitest";
import installDialogStandIn from "./installDialogStandIn.js";

/** A dialog with a button inside, its opener and its closer, on the page. */
const createDialog = () => {
  const dialog = document.createElement("dialog");
  dialog.id = `dialog-${Math.random().toString(36).slice(2)}`;
  dialog.innerHTML =
    "<button type='button' class='inside'>Inside</button><button type='button' class='closer'>Close</button>";
  const opener = document.createElement("button");
  opener.setAttribute("commandfor", dialog.id);
  opener.setAttribute("command", "show-modal");
  const closer = dialog.querySelector(".closer") as HTMLButtonElement;
  closer.setAttribute("commandfor", dialog.id);
  closer.setAttribute("command", "close");
  document.body.append(opener, dialog);
  return {
    dialog,
    opener,
    closer,
    inside: dialog.querySelector(".inside") as HTMLButtonElement,
  };
};

describe("installDialogStandIn", () => {
  let uninstall: () => void = () => {};

  afterEach(() => {
    uninstall();
    document.body.innerHTML = "";
  });

  it("opens modally, focusing the first control, and closes, returning focus", () => {
    uninstall = installDialogStandIn();
    const { dialog, opener, inside } = createDialog();
    const closed = vi.fn();
    dialog.addEventListener("close", closed);
    opener.focus();
    dialog.showModal();
    dialog.showModal();
    expect(dialog.open).toBe(true);
    expect(inside).toHaveFocus();
    dialog.close();
    dialog.close();
    expect(dialog.open).toBe(false);
    expect(closed).toHaveBeenCalledOnce();
    expect(opener).toHaveFocus();
  });

  it("returns focus to nothing that has left the page", () => {
    uninstall = installDialogStandIn();
    const { dialog, opener } = createDialog();
    opener.focus();
    dialog.showModal();
    opener.remove();
    dialog.close();
    expect(document.activeElement).not.toBe(opener);
  });

  it("sends Escape to the topmost dialog as a cancel, then a close", () => {
    uninstall = installDialogStandIn();
    const { dialog } = createDialog();
    dialog.showModal();
    const held = (event: Event) => event.preventDefault();
    dialog.addEventListener("cancel", held);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(dialog.open).toBe(true);
    dialog.removeEventListener("cancel", held);
    const taken = new KeyboardEvent("keydown", {
      key: "Escape",
      cancelable: true,
    });
    taken.preventDefault();
    document.dispatchEvent(taken);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    expect(dialog.open).toBe(true);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(dialog.open).toBe(false);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
  });

  it("runs a button's invoker command on a click", () => {
    uninstall = installDialogStandIn();
    const { dialog, opener, closer } = createDialog();
    expect(opener.command).toBe("show-modal");
    expect(document.createElement("button").command).toBe("");
    opener.click();
    expect(dialog.open).toBe(true);
    closer.click();
    expect(dialog.open).toBe(false);
  });

  it("runs no command for a cancelled click, a disabled button, or no dialog", () => {
    uninstall = installDialogStandIn();
    const { dialog, opener } = createDialog();
    const cancel = (event: Event) => event.preventDefault();
    opener.addEventListener("click", cancel);
    opener.click();
    opener.removeEventListener("click", cancel);
    opener.disabled = true;
    opener.click();
    opener.disabled = false;
    opener.setAttribute("commandfor", "nothing");
    opener.click();
    opener.setAttribute("commandfor", dialog.id);
    opener.setAttribute("command", "toggle");
    opener.click();
    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    const text = document.createTextNode("text");
    document.body.append(text);
    text.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(dialog.open).toBe(false);
  });

  it("leaves buttons without commands where invokers are off, and restores jsdom", () => {
    uninstall = installDialogStandIn({ invokers: false });
    const { dialog, opener } = createDialog();
    expect("command" in opener).toBe(false);
    opener.click();
    expect(dialog.open).toBe(false);
    uninstall();
    uninstall = () => {};
    expect("showModal" in dialog).toBe(false);
  });
});
