import type { ComponentProps } from "react";

type OwnProps = {
  /** The previous page's address, or none on the first page. */
  readonly previousHref?: string;
  /** The next page's address, or none on the last page. */
  readonly nextHref?: string;
  /** The page's position, as the caller words it ("21–40 of 41"). */
  readonly label: string;
};

/**
 * Props accepted by `PaginationBar`: the two ends' addresses and the
 * position, then the native props of its `<nav>` root.
 *
 * `children` is excluded: the bar renders its own links.
 */
export type PaginationBarProps = OwnProps &
  Omit<ComponentProps<"nav">, keyof OwnProps | "children">;
