// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps } from "react";
import type { CommandPaletteResult_node$key } from "../../../__generated__/CommandPaletteResult_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Node to offer, from an operation that
   * spreads `...CommandPaletteResult_node`.
   */
  readonly node: CommandPaletteResult_node$key;
  /**
   * Called when the reader chooses the result, before the router navigates
   * to its home: the palette closes on it.
   */
  readonly onChoose: () => void;
};

/**
 * Props accepted by `CommandPaletteResult`, which
 * renders no element of its own: its own, then the native props of the
 * `<li>` the command arm of its node's type renders as its root, where the
 * palette sets the option's role, id and selection. `children` is excluded, since the arm fills its slots
 * from the node, and `onClick`, since a click is the result's own: it chooses
 * the result.
 */
export type CommandPaletteResultProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps | "children" | "onClick">;
