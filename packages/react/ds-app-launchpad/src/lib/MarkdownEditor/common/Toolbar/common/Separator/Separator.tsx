/* @canonical/generator-ds 0.9.0-experimental.4 */
import type React from "react";
import "./styles.css";
import type { ToolbarSeparatorProps } from "./types.js";

const componentCssClassName = "ds toolbar-separator";

/**
 * A visual separator between groups of controls in a toolbar.
 */
const ToolbarSeparator = ({
  className,
  ...props
}: ToolbarSeparatorProps): React.ReactElement => {
  return (
    <div
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      {...props}
    />
  );
};

export default ToolbarSeparator;
