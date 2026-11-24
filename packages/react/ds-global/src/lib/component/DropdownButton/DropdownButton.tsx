import type React from "react";
import { hasVisibleChildren } from "../../utils/index.js";
import { Button } from "../Button/index.js";
import { withContextualMenu } from "../ContextualMenu/index.js";
import { Icon } from "../Icon/index.js";
import type { DropdownButtonProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds dropdown-button";

/** A Button that opens a contextual menu. */
const ButtonMenu = withContextualMenu(Button);

/**
 * A Dropdown Button is a specialized button that includes a persistent
 * chevron icon to indicate nested functionality. Unlike standard Buttons that
 * execute a single, immediate action, the Dropdown Button reveals a
 * ContextualMenu of options or controls. This visual cue ensures users
 * understand that an interaction will expand the interface to provide
 * further choices rather than triggering an instantaneous system change.
 *
 * `import { DropdownButton } from "@canonical/react-ds-global";`
 *
 * @implements ds:global.component.dropdown_button
 */
export default function DropdownButton({
  className,
  children,
  ...props
}: DropdownButtonProps): React.ReactElement {
  // The chevron hides an empty label from Button's own check, so this warns
  // for it.
  // @note Impure: warns in development.
  if (
    typeof process !== "undefined" &&
    process.env.NODE_ENV !== "production" &&
    !hasVisibleChildren(children) &&
    !props["aria-label"] &&
    !props["aria-labelledby"]
  ) {
    console.warn(
      "DropdownButton: a button with no visible children needs an `aria-label` or `aria-labelledby` to be accessible.",
    );
  }

  return (
    <ButtonMenu
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      {children}
      {/* Inside the label, so it hides with it while loading. */}
      <span className="chevron">
        <Icon icon="chevron-down" />
      </span>
    </ButtonMenu>
  );
}
