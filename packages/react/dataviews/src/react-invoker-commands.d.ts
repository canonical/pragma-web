/**
 * The invoker-command attributes, which React's types do not list yet: a
 * button names the element it commands with `commandfor` and the command
 * with `command`, such as `show-modal` or `close` for a dialog.
 */
import "react";

declare module "react" {
  interface ButtonHTMLAttributes<T> {
    /** The id of the element the button commands. */
    commandfor?: string;
    /** The command, such as `show-modal` or `close`. */
    command?: string;
  }
}
