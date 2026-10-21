import type { ComponentProps } from "react";

type OwnProps = {
  /**
   * The syntax-tree element a Markdown renderer hands each override. It is
   * the renderer's, never an attribute, so it never reaches the markup.
   */
  readonly node?: unknown;
};

/** Props accepted by the prose link: an anchor's, as Markdown renders it. */
export type ProseLinkProps = OwnProps &
  Omit<ComponentProps<"a">, keyof OwnProps>;
