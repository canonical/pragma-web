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
};

/**
 * Props accepted by `UIBlockExample`, which renders no element of its own:
 * the published component is the root.
 */
export type UIBlockExampleProps = OwnProps;
