import type { DialogStandInConfig } from "./types.js";

/** The selector of what a modal dialog focuses as it opens. */
const FOCUSABLE =
  "[autofocus], button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex='-1'])";

/**
 * Installs a stand-in for the modal dialog API, which jsdom does not
 * implement, so unit tests can drive a `<dialog>` as a browser would.
 *
 * `showModal` opens a dialog and focuses its first focusable descendant;
 * `close` closes it, dispatches `close`, and returns focus to what had it
 * before it opened. Escape on the page sends the topmost modal dialog its
 * close request: a cancelable `cancel`, then, unless that is cancelled,
 * `close`. A key whose default was prevented sends none. With invokers, a
 * click on a `button[commandfor]` runs its `command`, `show-modal` or
 * `close`, unless the click was cancelled.
 *
 * The real platform also makes the page behind a modal dialog inert and
 * draws the dialog in the top layer; a browser test checks those.
 *
 * @param config - Whether buttons run invoker commands.
 * @returns A function that removes the stand-in and restores jsdom.
 * @note Impure: patches `HTMLDialogElement.prototype` and, with invokers,
 * `HTMLButtonElement.prototype`, and adds document listeners.
 */
export default function installDialogStandIn({
  invokers = true,
}: DialogStandInConfig = {}): () => void {
  const modals: HTMLDialogElement[] = [];
  const previousFocus = new WeakMap<HTMLDialogElement, Element | null>();
  const dialogPrototype = HTMLDialogElement.prototype;
  const buttonPrototype = HTMLButtonElement.prototype;

  const show = (dialog: HTMLDialogElement): void => {
    if (dialog.open) return;
    previousFocus.set(dialog, dialog.ownerDocument.activeElement);
    dialog.setAttribute("open", "");
    modals.push(dialog);
    dialog.querySelector<HTMLElement>(FOCUSABLE)?.focus();
  };

  const close = (dialog: HTMLDialogElement): void => {
    if (!dialog.open) return;
    dialog.removeAttribute("open");
    modals.splice(modals.indexOf(dialog), 1);
    dialog.dispatchEvent(new Event("close"));
    const previous = previousFocus.get(dialog);
    if (previous instanceof HTMLElement && previous.isConnected) {
      previous.focus();
    }
  };

  const handleKeyDown = (event: KeyboardEvent): void => {
    const topmost = modals.at(-1);
    if (event.key !== "Escape" || event.defaultPrevented || !topmost) return;
    const cancel = new Event("cancel", { cancelable: true });
    if (topmost.dispatchEvent(cancel)) close(topmost);
  };

  const handleClick = (event: MouseEvent): void => {
    if (event.defaultPrevented || !(event.target instanceof Element)) return;
    const button = event.target.closest("button[commandfor]");
    if (!(button instanceof HTMLButtonElement) || button.disabled) return;
    const target = document.getElementById(
      String(button.getAttribute("commandfor")),
    );
    if (!(target instanceof HTMLDialogElement)) return;
    const command = button.getAttribute("command");
    if (command === "show-modal") show(target);
    if (command === "close") close(target);
  };

  Object.assign(dialogPrototype, {
    showModal(this: HTMLDialogElement) {
      show(this);
    },
    close(this: HTMLDialogElement) {
      close(this);
    },
  });
  if (invokers) {
    Object.defineProperty(buttonPrototype, "command", {
      configurable: true,
      get(this: HTMLButtonElement) {
        return this.getAttribute("command") ?? "";
      },
    });
    document.addEventListener("click", handleClick);
  }
  document.addEventListener("keydown", handleKeyDown);

  return () => {
    document.removeEventListener("keydown", handleKeyDown);
    document.removeEventListener("click", handleClick);
    const patched = dialogPrototype as Partial<HTMLDialogElement>;
    delete patched.showModal;
    delete patched.close;
    delete (buttonPrototype as { command?: string }).command;
  };
}
