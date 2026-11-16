import type { Key } from "@canonical/react-ds-global";
import type { BlockExampleName } from "./types.js";

/**
 * The UI blocks whose card renders an example, by the compact address each
 * published component implements, and the example each renders. A block the
 * published package does not implement has no example; nor has one whose
 * component needs a trigger and its state (a popover, a tooltip, a menu, a
 * modal) or does not fit the specimen's well (tabs, breadcrumbs, an
 * accordion).
 */
export const BLOCK_EXAMPLES: ReadonlyMap<string, BlockExampleName> = new Map([
  ["ds:global.component.badge", "badge"],
  ["ds:global.component.button", "button"],
  ["ds:global.component.chip", "chip"],
  ["ds:global.component.inline_code", "inlineCode"],
  ["ds:global.component.keyboard_key", "keyboardKey"],
]);

/** The count the example Badge shows: it renders nothing without one. */
export const EXAMPLE_BADGE_VALUE = 8;

/** The key the example KeyboardKey shows: it renders nothing without one. */
export const EXAMPLE_KEY: Key = "enter";

/**
 * The modifier families each example honours, by the name of the published
 * component's prop that takes a family's modifier (`importance` takes
 * `primary`). A family the graph records for a block but its example does
 * not list here is not drawn: the published component has no prop for it.
 */
export const BLOCK_EXAMPLE_FAMILIES: Readonly<
  Record<BlockExampleName, readonly string[]>
> = {
  badge: ["criticality"],
  button: ["importance", "anticipation"],
  chip: ["criticality", "release"],
  inlineCode: [],
  keyboardKey: [],
};

/** No modifier: the example in the component's default state. */
export const NO_MODIFIERS: Readonly<Record<string, string>> = {};
