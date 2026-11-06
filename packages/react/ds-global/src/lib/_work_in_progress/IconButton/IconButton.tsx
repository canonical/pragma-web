import type React from "react";
import { useEffect } from "react";
import { Button } from "../../component/Button/index.js";
import { TooltipEngine } from "../../component/Tooltip/index.js";
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
 * follows the "Icon buttons" guideline of Button: it is named with
 * `aria-label` or `aria-labelledby`, and paired with a Tooltip that states
 * the action. The Tooltip is on by default, with the `aria-label` as its
 * message, and stays closed while the button's panel is expanded. With a
 * Tooltip shown, the outermost element is the Tooltip's `.tooltip-area`
 * span; `className`, `style` and every native prop still reach the
 * `<button>`.
 *
 * `import { IconButton } from "@canonical/react-ds-global";`
 *
 * @implements ds:global.component.icon_button
 */
export default function IconButton({
  className,
  icon,
  tooltip,
  ...props
}: IconButtonProps): React.ReactElement {
  const message = tooltip ?? props["aria-label"];
  const hasTooltip = message !== false && message != null && message !== "";
  const isMissingDefaultMessage = tooltip === undefined && !hasTooltip;

  useEffect(() => {
    if (
      typeof process !== "undefined" &&
      process.env.NODE_ENV !== "production" &&
      isMissingDefaultMessage
    ) {
      console.warn(
        "IconButton: a button named only by `aria-labelledby` has no Tooltip message. Pass `tooltip` with the action, or `tooltip={false}`.",
      );
    }
  }, [isMissingDefaultMessage]);

  const button = (
    <Button
      {...props}
      icon={icon}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    />
  );

  if (!hasTooltip) return button;

  const isExpanded =
    props["aria-expanded"] === true || props["aria-expanded"] === "true";

  return (
    <TooltipEngine Message={message} open={isExpanded ? false : undefined}>
      {button}
    </TooltipEngine>
  );
}
