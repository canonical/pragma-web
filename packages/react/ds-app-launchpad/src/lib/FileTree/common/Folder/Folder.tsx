/* @canonical/generator-ds 0.9.0-experimental.4 */
import type React from "react";
import { Node } from "../Node/index.js";
import "./styles.css";
import type { FolderProps } from "./types.js";

/**
 * description of the Folder component
 * @returns {React.ReactElement} - Rendered Folder
 */
const Folder = ({
  name,
  defaultOpen,
  ...props
}: FolderProps): React.ReactElement => {
  return (
    <Node {...props} name={name} nodeType="folder" defaultOpen={defaultOpen} />
  );
};

export default Folder;
