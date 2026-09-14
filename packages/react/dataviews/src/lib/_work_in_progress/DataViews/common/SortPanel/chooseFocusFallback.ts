/**
 * Where focus goes once the control a reader was on in the sort panel is
 * disabled or removed, so it is not stranded on nothing: the same term's
 * Remove while that term is still listed, the Remove now standing where the
 * term stood once it is gone, and the panel itself once no term is left.
 */
export default function chooseFocusFallback(
  panel: HTMLElement,
  term: { readonly field: string; readonly place: number },
): HTMLElement {
  const removes = panel.querySelectorAll<HTMLElement>(".remove");
  return (
    Array.from(removes).find(
      (button) => button.dataset["field"] === term.field,
    ) ??
    removes.item(Math.min(term.place, removes.length - 1)) ??
    panel
  );
}
