import type { ReactElement } from "react";
import type { ConditionMarkProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds condition-mark";

/**
 * The mark of a Condition value, such as `≠` for Exclusion, in the text
 * colour, hidden from assistive technology: the words beside it say what
 * it shows. A filter button's trigger and a filter's words draw it.
 */
export default function ConditionMark({
  condition,
  className,
  ...props
}: ConditionMarkProps): ReactElement {
  return (
    <span
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-condition={condition}
      aria-hidden="true"
    />
  );
}
