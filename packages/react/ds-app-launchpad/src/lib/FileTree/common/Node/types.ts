import type { ComponentProps, ReactNode } from "react";
import type { FileTreeData } from "../../types.js";

export type ContextOptions = {
  depth: number;
  path: string;

  addChildNode: (node: FileTreeData) => void;
  childNodes: FileTreeData[];
};

export type FileOptions = {
  nodeType: "file";
};

export type FolderOptions = {
  nodeType: "folder";
  defaultOpen?: boolean;
};

type OwnProps = {
  name: string;

  /** Shows a marker to the right of the node */
  marker?: ReactNode;
} & (FileOptions | FolderOptions);

export type ProviderProps = OwnProps &
  Omit<ComponentProps<"li">, keyof OwnProps>;
