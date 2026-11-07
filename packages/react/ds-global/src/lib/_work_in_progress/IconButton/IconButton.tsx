import type React from "react";
import { Button } from "../../component/Button/index.js";
import type { IconButtonProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds icon-button";

/**
 * An icon button is a square Button with one icon and no visible label. Use it
 * for common actions with a recognizable icon, such as edit or delete in a
 * table row, a settings panel trigger, or toolbar actions. Its baseline
 * matches a labelled Button's, and it is always named and paired with a
 * Tooltip.
 *
 * `import { IconButton } from "@canonical/react-ds-global";`
 *
 * @implements ds:global.component.icon_button
 */
export default function IconButton({
  className,
  ...props
}: IconButtonProps): React.ReactElement {
  return (
    <Button
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    />
  );
}
