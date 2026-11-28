/* @canonical/generator-ds 0.9.0-experimental.4 */
import type { ComponentProps } from "react";

type OwnProps = {
  /** Folder name */
  name: string;

  /** Whether the folder is expanded by default */
  defaultOpen?: boolean;
};

export type FolderProps = OwnProps & Omit<ComponentProps<"li">, keyof OwnProps>;
