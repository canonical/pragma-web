/* @canonical/generator-ds 0.9.0-experimental.9 */

import { Icon } from "@canonical/react-ds-global";
import type React from "react";
import type { ErrorProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds field-error";

/**
 * The validation message of a field: the error shown when an entry is
 * rejected. Part of the Field chrome, reached as `Field.Error`.
 *
 * @returns {React.ReactElement} - Rendered Error
 *
 * `import { Field } from "@canonical/react-ds-global-form";`
 *
 * @implements ds:global.subcomponent.field-error
 */
const FieldError = ({
  id,
  children,
  className,
  style,
}: ErrorProps): React.ReactElement => {
  return (
    <p
      id={id}
      style={style}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      role="alert"
    >
      {/* Decorative: the alert role already announces the message, so the
          icon adds no information a screen reader needs. */}
      <Icon icon="error" />
      {children}
    </p>
  );
};

FieldError.displayName = "Field.Error";

export default FieldError;
