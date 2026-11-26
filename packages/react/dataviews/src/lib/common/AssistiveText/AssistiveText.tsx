import type { ReactElement } from "react";
import type { AssistiveTextProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds assistive-text";

/**
 * Text for assistive technology only: kept in the accessibility tree and
 * out of sight, such as the comma that reads a count apart from its word,
 * or a name's words where the eye has a mark.
 */
export default function AssistiveText({
  children,
  className,
  ...props
}: AssistiveTextProps): ReactElement {
  return (
    <span
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      {children}
    </span>
  );
}
