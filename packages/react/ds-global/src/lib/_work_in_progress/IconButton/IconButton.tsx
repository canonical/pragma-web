import type React from "react";
import { Button } from "../../component/Button/index.js";
import type { IconButtonProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds icon-button";

/**
 * An icon button is a square Button that shows a single icon and no visible
 * label. Use it for very common actions with a recognizable icon, such as
 * edit, delete or close in a table row, for the trigger of a settings or
 * options panel, and for actions that sit side by side in a toolbar. Unlike a
 * Button with an icon and a label, its box is exactly as wide as it is tall in
 * every density, and its baseline sits where a labelled Button's label
 * baseline sits, so it lines up with text and with other buttons in a row. It
 * has no visible text, so it is always named explicitly and always paired with
 * a Tooltip that states the action.
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
