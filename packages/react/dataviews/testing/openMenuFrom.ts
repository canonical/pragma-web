import { assertInvariant } from "@canonical/dataviews-core/bindings";
import { fireEvent } from "@testing-library/react";
import waitForFrames from "./waitForFrames.js";

/**
 * Opens the popover menu a button names, as a click does, and waits for the
 * menu to take focus, a few frames after it opens.
 *
 * @param trigger The button whose `popovertarget` names the menu's panel.
 * @returns The open menu.
 * @note Impure: clicks the button and waits for focus to move.
 */
export default async function openMenuFrom(
  trigger: HTMLElement,
): Promise<HTMLElement> {
  const panelId = assertInvariant(
    trigger.getAttribute("popovertarget"),
    "a menu button names its panel",
  );
  fireEvent.click(trigger);
  // Read afresh each frame: a menu closing as this one opens may still stand.
  return waitForFrames(() => {
    const menu = document
      .getElementById(panelId)
      ?.querySelector<HTMLElement>('[role="menu"]');
    return menu?.contains(document.activeElement) ? menu : null;
  }, "an open menu holding focus");
}
