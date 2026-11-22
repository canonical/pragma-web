import type { ComponentProps, ReactNode } from "react";

type OwnProps = {
  /** The type's name, the group's heading. */
  readonly title: string;
  /** How many results the type holds. */
  readonly count: number;
  /**
   * Whether the group began on an earlier page: its heading then says it
   * continues.
   */
  readonly continued?: boolean;
  /** The group's rows: one `<li>` per result, in rank order. */
  readonly children: ReactNode;
};

/**
 * Props accepted by `SearchResultGroup`: its heading and rows, then the
 * native props of its `<section>` root.
 */
export type SearchResultGroupProps = OwnProps &
  Omit<ComponentProps<"section">, keyof OwnProps>;
