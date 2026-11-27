import { Icon } from "@canonical/react-ds-global";
import type React from "react";
import type { FieldProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds side-navigation-context-switcher-field";

/**
 * The dropdown field: a button showing the current context's name.
 *
 * @implements ds:apps.subcomponent.side-navigation-context-switcher-field
 */
export default function Field({
  children,
  className,
  ...props
}: FieldProps): React.ReactElement {
  return (
    <button
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <span className="row">
        <span className="label">{children}</span>
        <Icon icon="chevron-down" className="end caret" />
      </span>
    </button>
  );
}
