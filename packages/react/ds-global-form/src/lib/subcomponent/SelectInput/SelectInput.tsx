import { Icon } from "@canonical/react-ds-global";
import { forwardRef, type ReactElement } from "react";
import type { SelectInputProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds input select chrome";

/**
 * Presentational select input — pure markup, no react-hook-form.
 *
 * Usable standalone (controlled via `value`/`onChange`, or uncontrolled) or via
 * the field tier, which spreads react-hook-form's `register()` result onto it.
 * @returns {ReactElement} - Rendered Select
 *
 * `import { SelectInput } from "@canonical/react-ds-global-form";`
 *
 * @implements ds:global.subcomponent.select_input
 */
export const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  function SelectInput(
    { id, className, style, options, ...nativeProps },
    ref,
  ): ReactElement {
    return (
      <div
        style={style}
        className={[componentCssClassName, className].filter(Boolean).join(" ")}
      >
        {/* `id` goes on the <select> (not the wrapper) so the Field label's
         * `htmlFor` targets a labelable element. */}
        <select id={id} className="p" ref={ref} {...nativeProps}>
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              lang={option.lang}
            >
              {option.label}
            </option>
          ))}
        </select>
        {/* A <select> is a replaced element — no ::before/::after, no children
         * — so the chevron overlays it as a grid sibling in the wrapper. */}
        {!nativeProps.multiple && (
          <Icon icon="chevron-down" className="chevron" />
        )}
      </div>
    );
  },
);

export default SelectInput;
