/** What a tap on a row must not also toggle the row through. */
const CONTROLS = [
  "a",
  "button",
  "input",
  "label",
  "select",
  "textarea",
  "summary",
  "[contenteditable]",
  "[role='button']",
  "[role='checkbox']",
  "[role='combobox']",
  "[role='link']",
  "[role='menuitem']",
  "[role='menuitemcheckbox']",
  "[role='menuitemradio']",
  "[role='option']",
  "[role='radio']",
  "[role='slider']",
  "[role='switch']",
  "[role='tab']",
  "[role='textbox']",
].join(", ");

/**
 * Whether a tap landed on a control of the row's own — its checkbox, a link
 * or a button in a cell — which answers for itself, so the row does not also
 * toggle for the same tap. Only a control within the row counts: a table
 * placed inside a label or an editable region is not every row's control.
 */
export default function isWithinControl(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false;
  }
  const control = target.closest(CONTROLS);
  return (
    control !== null &&
    target.closest("[data-row-id]")?.contains(control) === true
  );
}
