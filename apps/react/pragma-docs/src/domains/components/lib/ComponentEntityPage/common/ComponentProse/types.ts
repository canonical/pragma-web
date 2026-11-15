import type { ComponentProps } from "react";

type OwnProps = {
  /** The Markdown text: a component's usage or its guidelines. */
  readonly source: string;
};

/**
 * Props accepted by `ComponentProse`: the text, then the native props of
 * its `<div>` root, the content of a section of the component page. The
 * native `children` are excluded: the part renders the text.
 */
export type ComponentProseProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "children">;
