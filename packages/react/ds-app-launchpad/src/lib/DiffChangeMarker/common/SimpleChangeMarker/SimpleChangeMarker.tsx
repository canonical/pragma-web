/* @canonical/generator-ds 0.9.0-experimental.12 */
import type React from "react";
import * as icons from "../../icons.js";
import "./styles.css";
import type { SimpleChangeMarkerProps } from "./types.js";

const componentCssClassName = "ds simple-change-marker";

const SimpleChangeMarker = ({
  changeType,
  className,
  ...props
}: SimpleChangeMarkerProps): React.ReactElement => {
  return (
    <div
      className={[componentCssClassName, changeType, className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {changeType === "added" && icons.AddIcon}
      {changeType === "deleted" && icons.DeleteIcon}
      {changeType === "modified" && icons.ModifyIcon}
    </div>
  );
};

export default SimpleChangeMarker;
