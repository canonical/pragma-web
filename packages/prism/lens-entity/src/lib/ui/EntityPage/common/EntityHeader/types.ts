import type { ComponentProps, ReactNode } from "react";

type OwnProps = {
  /** The entity's name: the page's level-1 heading. */
  readonly title: string;
  /** The entity's address in compact form, which Copy writes. */
  readonly address: string;
  /** The entity's class: its linked chip, or its name in the reader's language. */
  readonly kind: ReactNode;
  /** The entity's one-line description; no summary row when omitted. */
  readonly summary?: string;
};

/**
 * Props accepted by `EntityHeader`: the entity's name, address, class and
 * summary, and the native props of its root `<header>`. The native
 * `children` are excluded: the header renders its own parts.
 */
export type EntityHeaderProps = OwnProps &
  Omit<ComponentProps<"header">, keyof OwnProps | "children">;
