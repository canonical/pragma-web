/* @canonical/generator-canonical-ds 0.0.1 */
import type React from "react";
import type { ComponentProps } from "react";

export type CodeDiffViewerLineSelectOptions = {
  hunkLineNumber: number;
  diffLineNumber: number;
};

export type CodeDiffViewerAddComment = (
  props: {
    onClose: () => void;
  } & CodeDiffViewerLineSelectOptions,
) => React.ReactNode;

type OwnProps = {
  /** Add comment element.
   * If provided, the code viewer will be in interactive mode.
   */
  AddComment?: CodeDiffViewerAddComment;
  /** Callback function for when a line is clicked.
   * If provided, the code viewer will be in interactive mode.
   */
  onLineClick?: (options: CodeDiffViewerLineSelectOptions) => void;

  /**
   * Disable width calculation for the table (default: false).
   * This is useful when there is multiple instances of this component on the same page.
   * To avoid doing the same width calculation for each instance separately.
   *
   * Instead, ref the table element and set the width on the parent element.
   * To update the table width, call the `utils/updateTableWidth` function.
   */
  disableWidthCalculation?: boolean;
};

// The native props are the wrapper `<div>`'s, the root element they are
// spread onto. `ref` is excluded because the component forwards it to the
// inner `<table>` instead.
export type CodeDiffViewerProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "ref">;
