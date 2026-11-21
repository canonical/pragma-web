import type { ComponentProps, ReactNode } from "react";

type OwnProps = {
  /** The type's name, the group's heading. */
  readonly title: string;
  /** How many results the type holds. */
  readonly count: number;
  /** The group's rows: one `<li>` per result, in rank order. */
  readonly children: ReactNode;
};

/**
 * Props accepted by `SearchResultGroup`: its heading and rows, then the
 * native props of its `<section>` root.
 */
export type SearchResultGroupProps = OwnProps &
  Omit<ComponentProps<"section">, keyof OwnProps>;
