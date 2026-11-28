/* @canonical/generator-ds 0.9.0-experimental.4 */
import type { ComponentProps, ReactNode } from "react";

type OwnProps = {
  /** File name */
  name: string;

  /**
   * Shows a marker to the right of the file name.
   */
  marker?: ReactNode;
};

export type FileProps = OwnProps & Omit<ComponentProps<"li">, keyof OwnProps>;
