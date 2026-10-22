import type { ComponentProps } from "react";

type OwnProps = {
  /**
   * A translated message, with code names between backticks, e.g.
   * "`LazyComponent` reads a delayed fetch with `use()`".
   */
  readonly message: string;
};

/**
 * Props for `CodeMessage`: the message, plus the native props of the root
 * `<p>`, which reach the element unchanged.
 */
export type CodeMessageProps = OwnProps &
  Omit<ComponentProps<"p">, keyof OwnProps | "children">;
