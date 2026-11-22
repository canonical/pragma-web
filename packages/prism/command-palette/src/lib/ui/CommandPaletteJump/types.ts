// Scaffolded by @canonical/summon-component:react v0.46.0

import type { ComponentProps } from "react";
import type { MessageKey } from "../../i18n/index.js";

/** A place of the site the palette jumps to: what it reads and its address. */
export interface PaletteDestination {
  /** The place's name, which the field's text narrows by. */
  readonly label: string;
  /** The place's address on the site, from the site's router. */
  readonly href: string;
}

/**
 * The site's destinations, which the palette narrows on a site whose
 * provider serves no search.
 */
export interface PaletteDestinations {
  /** Each lens's home, in the rail's order. */
  readonly places: readonly PaletteDestination[];
  /** The pages the reader read before this one, latest first. */
  readonly recent: readonly PaletteDestination[];
}

/** One destination in its group, with its place among every option. */
export interface JumpOption {
  /** The destination. */
  readonly destination: PaletteDestination;
  /** Its position over every group's options. */
  readonly index: number;
}

/** The destinations of one group the field's text kept. */
export interface JumpGroup {
  /** The catalog key of the group's heading. */
  readonly heading: MessageKey;
  /** The group's options, in the order the shell gave them. */
  readonly options: readonly JumpOption[];
}

type OwnProps = {
  /** The site's destinations, which the field's text narrows. */
  readonly destinations: PaletteDestinations;
  /**
   * Called when the reader follows a destination's link, before the router
   * navigates to it: the palette closes on it.
   */
  readonly onChoose: () => void;
  /**
   * The text the field opens with: the text of the page's field the
   * palette was opened from, carried into it. Empty when absent.
   */
  readonly initialText?: string;
};

/**
 * Props accepted by `CommandPaletteJump`: its own, then the native props of
 * the `<div>` it renders as its root. `children` is excluded: it renders
 * its field and its options.
 */
export type CommandPaletteJumpProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "children">;
