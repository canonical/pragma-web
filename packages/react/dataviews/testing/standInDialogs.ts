import { assertInvariant } from "@canonical/dataviews-core/bindings";

/** Where the focus was as each modal opened, to return it on close. */
const openers = new WeakMap<HTMLDialogElement, Element | null>();

const FOCUSABLE =
  "input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])";

/** Run the invoker command of a clicked button, as the platform does. */
const handleCommandClick = (event: MouseEvent): void => {
  const invoker =
    event.target instanceof Element
      ? event.target.closest<HTMLButtonElement>("button[commandfor]")
      : null;
  if (event.defaultPrevented || invoker === null || invoker.disabled) {
    return;
  }
  const target = invoker.ownerDocument.getElementById(
    assertInvariant(
      invoker.getAttribute("commandfor"),
      "the matched invoker has commandfor",
    ),
  );
  if (!(target instanceof HTMLDialogElement)) {
    return;
  }
  const command = invoker.getAttribute("command");
  if (command === "show-modal" && !target.open) {
    // A click focuses its button first, as Chromium and Gecko do.
    invoker.focus();
    target.showModal();
  } else if (command === "close") {
    target.close();
  }
};

/** Cancel the topmost open dialog on Escape, as the platform does. */
const handleEscapeKeyDown = (event: KeyboardEvent): void => {
  if (event.key !== "Escape" || event.defaultPrevented) {
    return;
  }
  const top = [...document.querySelectorAll("dialog[open]")].at(-1);
  if (!(top instanceof HTMLDialogElement)) {
    return;
  }
  event.preventDefault();
  if (top.dispatchEvent(new Event("cancel", { cancelable: true }))) {
    top.close();
  }
};

/**
 * Stand in for what jsdom's `<dialog>` lacks, as the platform behaves:
 * `showModal` focuses the `autofocus` element or the first control, `close`
 * returns the focus to the opener, a button's `commandfor` and `command`
 * open or close the dialog it names, and Escape cancels the top modal. Does
 * nothing without a DOM, or where dialogs are native.
 *
 * @note Impure: patches `HTMLDialogElement.prototype` and listens on the
 * document.
 */
export default function standInDialogs(): void {
  if (
    typeof HTMLDialogElement === "undefined" ||
    typeof HTMLDialogElement.prototype.showModal === "function"
  ) {
    return;
  }
  HTMLDialogElement.prototype.showModal = function showModal(
    this: HTMLDialogElement,
  ): void {
    if (this.open) {
      throw new DOMException(
        "The dialog is already open.",
        "InvalidStateError",
      );
    }
    openers.set(this, this.ownerDocument.activeElement);
    this.open = true;
    (
      this.querySelector<HTMLElement>("[autofocus]") ??
      this.querySelector<HTMLElement>(FOCUSABLE)
    )?.focus();
  };
  HTMLDialogElement.prototype.close = function close(
    this: HTMLDialogElement,
  ): void {
    if (!this.open) {
      return;
    }
    this.open = false;
    const opener = openers.get(this);
    if (opener instanceof HTMLElement && opener.isConnected) {
      opener.focus();
    }
    // A focus the opener could not take leaves the closed dialog for the
    // body, as it does in a browser.
    const { activeElement } = this.ownerDocument;
    if (activeElement instanceof HTMLElement && this.contains(activeElement)) {
      activeElement.blur();
    }
    this.dispatchEvent(new Event("close"));
  };
  document.addEventListener("click", handleCommandClick);
  document.addEventListener("keydown", handleEscapeKeyDown);
}
