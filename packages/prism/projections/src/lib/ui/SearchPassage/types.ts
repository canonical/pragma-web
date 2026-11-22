import type { ComponentProps } from "react";

/** A run of the passage that holds the text: its start and length, in UTF-16 units. */
export interface PassageRange {
  readonly start: number;
  readonly length: number;
}

/** One piece of a passage: plain text, or a run that holds the text. */
export interface PassagePiece {
  /** Where the piece starts in the passage, in UTF-16 units. */
  readonly start: number;
  readonly text: string;
  readonly matched: boolean;
}

type OwnProps = {
  /** The passage, as the provider cut it. */
  readonly passage: string;
  /** The runs of the passage that hold the text, in passage order. */
  readonly ranges: readonly PassageRange[];
};

/**
 * Props accepted by `SearchPassage`: the passage and its matched runs,
 * then the native props of its `<p>` root.
 *
 * `children` is excluded: the passage is the content.
 */
export type SearchPassageProps = OwnProps &
  Omit<ComponentProps<"p">, keyof OwnProps | "children">;
