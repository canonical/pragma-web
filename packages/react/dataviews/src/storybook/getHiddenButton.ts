import type { within } from "storybook/test";

/**
 * The one button in a story's canvas whose text is this label, shown or not.
 *
 * A role query cannot find a hidden button by name: Testing Library gives an
 * element the stylesheet sets to `display: none` an empty accessible name, so
 * `getByRole("button", { name, hidden: true })` never matches it. The
 * baseline's submit controls are hidden once scripting is enabled, so a story
 * asserting as much finds its control by its text instead.
 *
 * @throws When no button, or more than one, has this text.
 */
export default function getHiddenButton(
  canvas: ReturnType<typeof within>,
  label: string,
): HTMLButtonElement {
  const found = canvas
    .getAllByRole("button", { hidden: true })
    .filter(
      (button: HTMLElement): button is HTMLButtonElement =>
        button instanceof HTMLButtonElement && button.textContent === label,
    );
  const [button] = found;
  if (button === undefined || found.length > 1) {
    throw new Error(
      `Expected one button reading "${label}", found ${found.length}`,
    );
  }
  return button;
}
