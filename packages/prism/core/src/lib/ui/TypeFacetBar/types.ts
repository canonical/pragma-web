import type { ComponentProps } from "react";

/** One value of the Type facet: a type, its count and where applying it leads. */
export interface TypeFacetValue {
  /** The type's identity, unique in the bar (its class IRI). */
  readonly id: string;
  /** The type's name, as the reader reads it. */
  readonly label: string;
  /** How many results the type holds under the other filters. */
  readonly count: number;
  /** The address with the type applied (or, when applied, released). */
  readonly href: string;
  /** Whether the type is the one applied. */
  readonly selected: boolean;
}

type OwnProps = {
  /** The facet's values, in the order the bar shows them. */
  readonly facets: readonly TypeFacetValue[];
  /** The facet's name; the catalog's "Type" when absent. */
  readonly label?: string;
  /**
   * Whether an applied type's chip closes the facet: true in the filter
   * sheet, false on the facet bar, which holds one line and shows the
   * applied type by its bold value alone. True when absent.
   */
  readonly withChip?: boolean;
};

/**
 * Props accepted by `TypeFacetBar`: its values, its name and whether it
 * shows the applied type's chip, then the native
 * props of its `<nav>` root.
 *
 * `children` is excluded: the bar renders its own values.
 */
export type TypeFacetBarProps = OwnProps &
  Omit<ComponentProps<"nav">, keyof OwnProps | "children">;
