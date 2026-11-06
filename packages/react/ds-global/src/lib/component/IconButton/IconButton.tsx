import type React from "react";
import { Button } from "../Button/index.js";
import type { IconButtonProps } from "./types.js";
import "./styles.css";

// Only the component's own class: the Button it renders already supplies
// the `ds` scope, so the markup carries `ds` once.
const componentCssClassName = "icon-button";

/**
 * A square, icon-only Button. It renders `Button` — so importance,
 * anticipation, loading, disabled and the density seat all come from Button —
 * and only makes the box square around a centred icon, with its baseline
 * seated where a labelled Button's label baseline sits.
 *
 * The design-system ontology has no IconButton block yet. Until it does, this
 * follows the "Icon buttons" guideline of Button: pair it with a Tooltip that
 * states the action, and name it with `aria-label` or `aria-labelledby`.
 *
 * `import { IconButton } from "@canonical/react-ds-global";`
 *
 * @implements ds:global.component.icon_button
 */
export default function IconButton({
  className,
  icon,
  ...props
}: IconButtonProps): React.ReactElement {
  return (
    <Button
      {...props}
      icon={icon}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    />
  );
}
