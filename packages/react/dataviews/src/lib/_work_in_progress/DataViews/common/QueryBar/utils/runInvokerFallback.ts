import type { MouseEvent } from "react";

/**
 * Run an invoker button's command on its dialog where the browser does
 * not, as one without invoker commands does nothing on the click: show it
 * modally, or close it. Where the browser runs the command itself, this
 * does nothing, so the dialog never sees it twice. Without scripts, such a
 * browser leaves the button inert.
 *
 * @param event - The click on a button carrying `commandfor` and `command`.
 * @note Impure: shows or closes the dialog the button names.
 */
export default function runInvokerFallback(
  event: MouseEvent<HTMLButtonElement>,
): void {
  // Read off the prototype, as a browser without invoker commands lacks it.
  if ("command" in HTMLButtonElement.prototype) return;
  const button = event.currentTarget;
  const target = button.ownerDocument.getElementById(
    button.getAttribute("commandfor") ?? "",
  );
  if (!(target instanceof HTMLDialogElement)) return;
  const command = button.getAttribute("command");
  if (command === "show-modal" && !target.open) target.showModal();
  if (command === "close" && target.open) target.close();
}
