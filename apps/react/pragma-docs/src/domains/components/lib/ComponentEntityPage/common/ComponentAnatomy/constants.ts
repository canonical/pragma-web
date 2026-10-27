/** The step a tree path starts from: the anatomy's root, as the DSL spells it. */
export const ROOT_STEP = "$root";

/** The step a switch takes in a tree path: a switch is no node of the anatomy. */
export const SWITCH_STEP = "switch";

/**
 * The type segment of a design-system block's URI that marks a component,
 * the one block type the site gives a page: `global.component.button`.
 */
export const COMPONENT_SEGMENT = "component";

/** The prefix the graph's compact addresses give a design-system block. */
export const BLOCK_PREFIX = "ds:";
