/* @canonical/generator-canonical-ds 0.0.1 */
import type { ComponentProps } from "react";

export type DiffContentLine = {
  content: string;
} & (
  | {
      type: "add";
      addLineNumber: number;
    }
  | {
      type: "remove";
      removeLineNumber: number;
    }
  | {
      type: "context";
      // we need both line numbers for context lines
      addLineNumber: number;
      removeLineNumber: number;
    }
);

export type DiffHunkLine = {
  type: "hunk";
  hunkHeader: string;
  hunkIndex: number;
};

type DiffLineCommonProps = {
  /** Callback function for when a line is clicked. */
  onLineClick?: (() => void) | undefined;
};

export type DiffContentLineProps = DiffLineCommonProps &
  DiffContentLine &
  Omit<ComponentProps<"tr">, keyof DiffLineCommonProps | keyof DiffContentLine>;
export type DiffHunkLineProps = DiffLineCommonProps &
  DiffHunkLine &
  Omit<ComponentProps<"tr">, keyof DiffLineCommonProps | keyof DiffHunkLine>;
export type DiffLineProps = DiffContentLineProps | DiffHunkLineProps;
