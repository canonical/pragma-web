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
 * toggle for the same tap.
 */
export default function isWithinControl(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(CONTROLS) !== null;
}
