/* @canonical/generator-ds 0.9.0-experimental.4 */
import type { FileTreeData } from "../../types.js";

// Exempt from the native-prop extension convention: renders a fragment that
// maps onto `File`/`Folder` children, so it has no single root element of its
// own.
export interface TreeViewProps {
  /**
   * The list of files and folders to display in the tree
   */
  tree: FileTreeData[];
  /**
   * Should the tree be sorted alphabetically
   *
   * @default false
   */
  sortAlphabetically?: boolean;
  /**
   * The default collapsed state of each folder in the tree
   *
   * @default false
   */
  defaultCollapsed?: boolean;
}
