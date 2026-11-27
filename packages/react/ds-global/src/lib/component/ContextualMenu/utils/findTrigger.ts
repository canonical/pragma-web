/**
 * The element in the popover's tree whose `popovertarget` names it.
 *
 * @param popover The popover.
 * @returns Its trigger, or undefined.
 * @note Impure: reads the DOM.
 */
export default function findTrigger(
  popover: HTMLElement,
): HTMLElement | undefined {
  const root = popover.getRootNode();
  if (!(root instanceof Document || root instanceof ShadowRoot)) return;
  return (
    root.querySelector<HTMLElement>(`[popovertarget="${popover.id}"]`) ??
    undefined
  );
}
