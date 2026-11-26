import type { InvokerCommand } from "../types.js";

/**
 * The attributes that make a native button an invoker of a dialog's
 * command: `commandfor` naming the dialog, `command` the command, which
 * the platform runs on a click before any script does, and without one.
 * Spelled as attributes, since React's types do not know them yet. Pure.
 *
 * @param command - What the button does to the dialog.
 * @param target - The dialog's id.
 * @returns The attributes, to spread onto the button.
 */
export default function spellInvoker(
  command: InvokerCommand,
  target: string,
): Readonly<Record<string, string>> {
  return { commandfor: target, command };
}
