import type { FooterRoot, NavRoot } from "@canonical/react-ds-app";
import type { ComponentProps, ReactNode } from "react";

type OwnProps = {
  /** The side navigation's tree: groups of items, each item with a `url`. */
  readonly root: NavRoot;
  /** The side navigation's footer rows. Omit it to hide the footer. */
  readonly footerRoot?: FooterRoot;
  /** The accessible name of the side navigation's landmark. */
  readonly label: string;
  /** The page, rendered in the shell's `<main>`. */
  readonly children: ReactNode;
};

/**
 * Props for `ApplicationShell`: the side navigation's data and the page, plus
 * the native props of the root `<div>`, which reach the element unchanged.
 */
export type ApplicationShellProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps>;
