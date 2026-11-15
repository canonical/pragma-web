// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ComponentProps, ReactNode } from "react";
import type { FormationChip_node$key } from "#relay/__generated__/FormationChip_node.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of the Formation to render, from an operation that
   * spreads `...FormationChip_node`.
   */
  readonly node: FormationChip_node$key;
  /** The mention's text, in place of the formation's name. */
  readonly children?: ReactNode;
  /**
   * Whether the mention links to the formation's home and peeks at its card:
   * `false` sets it as inert text, for a mention of the page it sits on.
   */
  readonly linked?: boolean;
};

/**
 * Props accepted by `FormationChip`: its own, then the native props of the
 * `<span>` the chip renders as its root.
 */
export type FormationChipProps = OwnProps &
  Omit<ComponentProps<"span">, keyof OwnProps>;
