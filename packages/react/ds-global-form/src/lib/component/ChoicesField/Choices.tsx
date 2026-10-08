/* @canonical/generator-ds 0.9.0-experimental.9 */

import type React from "react";
import { Fragment } from "react";
import { Option } from "./common/index.js";
import type { ChoicesPresentationProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds form-choices";

/**
 * Plain-label option group (radios or checkboxes) with inline/stacked layout.
 * Controlled and form-agnostic: the selected value(s) flow in via `value` and
 * out via `onChange` (a single value for radios, an array for checkboxes).
 * Each option is rendered by the `Option` subcomponent (common/Option). In the
 * stacked layout, `withDividers` separates consecutive options with a hairline
 * rule and each option's `description` renders as muted text.
 * @returns {React.ReactElement} - Rendered Choices
 *
 * `import { Choices } from "@canonical/react-ds-global-form";`
 */
export const Choices = ({
  id,
  className,
  style,
  name,
  isMultiple = false,
  disabled = false,
  layout = "inline",
  columns,
  withDividers = false,
  options,
  value,
  onChange,
}: ChoicesPresentationProps): React.ReactElement => {
  const type = isMultiple ? "checkbox" : "radio";

  // In the "columns" layout the column count drives a CSS grid; the variable is
  // unused (and so left unset) in the other layouts.
  const layoutStyle =
    layout === "columns" && columns
      ? ({
          ...style,
          "--choices-columns": columns,
        } as React.CSSProperties)
      : style;

  return (
    <fieldset
      id={id}
      style={layoutStyle}
      className={[componentCssClassName, layout, className]
        .filter(Boolean)
        .join(" ")}
    >
      {options.map((option, index) => {
        const checked = isMultiple
          ? Array.isArray(value) && value.includes(option.value)
          : value === option.value;
        const handleChange = () => {
          if (isMultiple) {
            const arr = Array.isArray(value) ? value : [];
            onChange?.(
              arr.includes(option.value)
                ? arr.filter((v) => v !== option.value)
                : [...arr, option.value],
            );
          } else {
            onChange?.(option.value);
          }
        };
        return (
          <Fragment key={option.value}>
            {withDividers && layout === "stacked" && index > 0 ? (
              <hr className="ds choices-divider" />
            ) : null}
            <Option
              name={name}
              type={type}
              option={option}
              checked={checked}
              disabled={disabled || Boolean(option.disabled)}
              onChange={handleChange}
              showDescription={layout === "stacked"}
            />
          </Fragment>
        );
      })}
    </fieldset>
  );
};

export default Choices;
