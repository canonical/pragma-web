import type { MouseEvent } from "react";

/**
 * Whether a click on a link asks only to follow it here: the main button,
 * with no key held that sends the address to a new tab, a new window or a
 * download, which the browser keeps. Pure.
 *
 * @param event - The click.
 * @returns Whether the click may be taken over in place.
 */
export default function isPlainClick(event: MouseEvent): boolean {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}
