import type { ComponentType } from "react";

/**
 * How much of the graph a lens's operations need.
 *
 * - `1`: every operation compiles against the contract SDL alone, so the
 *   lens runs over any conforming provider.
 * - `2`: some operation selects a provider extension, so the lens runs only
 *   over a provider that serves it.
 */
export type LensTier = 1 | 2;

/** What a lens's index route declares about the lens. */
export interface LensEntry {
  /** The lens's name, as the rail and the breadcrumbs show it. */
  readonly label: string;
  /** The rail glyph: a component rendering a decorative, `aria-hidden` icon. */
  readonly icon: ComponentType;
  /** The lens's place in the rail, ascending; unique across the route table. */
  readonly order: number;
  /** How much of the graph the lens's operations need. */
  readonly tier: LensTier;
}

/** A lens collected off the route table: its declaration and its route. */
export interface CollectedLens<TName extends string = string>
  extends LensEntry {
  /** The index route's name in the table, which links to the lens. */
  readonly name: TName;
}
