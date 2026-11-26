/* @canonical/generator-ds 0.9.0-experimental.4 */
import type React from "react";
import type { DescriptionProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds field-description";

/**
 * The description of a field: supporting help text shown with the label.
 * Part of the Field chrome, reached as `Field.Description`.
 *
 * @returns {React.ReactElement} - Rendered Description
 *
 * `import { Field } from "@canonical/react-ds-global-form";`
 */
const Description = ({
  id,
  children,
  className,
  style,
}: DescriptionProps): React.ReactElement => {
  return (
    <p
      id={id}
      style={style}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      {children}
    </p>
  );
};

Description.displayName = "Field.Description";

/**
 * @implements ds:global.subcomponent.field-description
 */
export default Description;
