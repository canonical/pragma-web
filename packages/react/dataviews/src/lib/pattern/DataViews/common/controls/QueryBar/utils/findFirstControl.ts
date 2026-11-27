/** What a reader can operate, before it is checked for being enabled. */
const CONTROLS =
  "input:not([type='hidden']), select, textarea, button, a[href], summary";

/**
 * The first control a reader can operate inside a container, in document
 * order: enabled, and not a hidden field. Null where none is.
 *
 * @param container - Where to look, such as the filters form.
 * @returns The control, or null.
 */
export default function findFirstControl(
  container: ParentNode,
): HTMLElement | null {
  return (
    [...container.querySelectorAll<HTMLElement>(CONTROLS)].find(
      (control) => !control.matches(":disabled"),
    ) ?? null
  );
}
