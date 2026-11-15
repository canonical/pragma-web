import type { ComponentProps } from "react";
import type { HEADING_TAGS } from "./constants.js";

/** A heading tag a component's text renders. */
export type ProseHeadingTag = (typeof HEADING_TAGS)[number];

type OwnProps = {
  /** The Markdown text: a component's usage or its guidelines. */
  readonly source: string;
  /**
   * The id of the section that holds the text, which prefixes its
   * headings' ids, so two texts on one page never give two headings one id.
   */
  readonly scope: string;
};

/**
 * Props accepted by `ComponentProse`: the text and its section's id, then
 * the native props of its `<div>` root, the content of a section of the
 * component page. The native `children` are excluded: the part renders
 * the text.
 */
export type ComponentProseProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "children">;
