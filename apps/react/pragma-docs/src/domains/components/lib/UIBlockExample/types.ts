// Scaffolded by @canonical/summon-component:react v0.43.0

/**
 * The published components a UI block's card can render as its example, by
 * name.
 */
export type BlockExampleName =
  | "badge"
  | "button"
  | "chip"
  | "inlineCode"
  | "keyboardKey";

type OwnProps = {
  /** Which published component to render. */
  readonly example: BlockExampleName;
  /**
   * The modifier to render it with, by family: the name of the published
   * component's prop to its value, such as `{ importance: "secondary" }`.
   * A family the example does not honour (`BLOCK_EXAMPLE_FAMILIES`) is
   * ignored. Defaults to none: the component's default state.
   */
  readonly modifiers?: Readonly<Record<string, string>>;
};

/**
 * Props accepted by `UIBlockExample`, which renders no element of its own:
 * the published component is the root.
 */
export type UIBlockExampleProps = OwnProps;
