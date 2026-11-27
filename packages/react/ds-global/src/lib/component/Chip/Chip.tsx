import type React from "react";
import { useMemo } from "react";
import { Icon } from "../Icon/index.js";
import Context from "./common/Context.js";
import { Dismiss } from "./common/index.js";
import type { ChipContextValue } from "./common/types.js";
import type { ChipProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds chip";

/**
 * A chip is a compact, interactive component used to represent an attribute,
 * entity, while facilitating secondary actions. Chips elevate specific
 * information in the visual hierarchy, such as categories or selected tags,
 * allowing users to trigger contextual behaviors like filtering, triggering a
 * Popover, selection, or dismissal. Unlike the Tag, chips are always
 * actionable. Chips should complement, rather than replace, the primary page
 * actions.
 *
 * A chip has exactly one action, and it decides which of two ways the chip is
 * used:
 *
 * - **Action chip**: pass `onClick`. The whole chip is a `<button>` and takes
 *   focus, for example to apply a filter or open a popover.
 * - **Dismissible chip**: pass one `Chip.Dismiss` child instead. The chip is a
 *   `<span>` and only its dismiss control takes focus, for example to remove
 *   an applied filter.
 *
 * The full `lead: value` text is exposed as a native tooltip, so a truncated
 * value stays readable.
 *
 * `import { Chip } from "@canonical/react-ds-global";`
 *
 * @implements ds:global.component.chip
 */
const Chip = (props: ChipProps): React.ReactElement => {
  const { value, lead, icon, badge, criticality, className, children } = props;
  const text = lead ? `${lead}: ${value}` : value;

  const contextValue = useMemo<ChipContextValue>(
    () => ({ defaultDismissLabel: `Dismiss ${text}` }),
    [text],
  );

  const rootClassName = [componentCssClassName, criticality, className]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {icon && (
        <span className="icon">
          <Icon icon={icon} />
        </span>
      )}
      {lead && (
        <>
          {/* the fragment is necessary because it renders a span and an empty space after the span */}
          <span className="lead">{`${lead}:`}</span>{" "}
        </>
      )}
      <span className="value">{value}</span>
      {badge && <span className="badge">{badge}</span>}
    </>
  );

  // Remove the chip's own props, so only native props reach the element
  // (otherwise `value="Bob"` would become an HTML attribute).
  // This is repeated in each branch on purpose: `ChipProps` is button props
  // or span props, and only after checking `onClick` does TypeScript know
  // which. Destructured once above the `if`, `rest` would fit neither element.
  if (props.onClick) {
    const {
      value: _value,
      lead: _lead,
      icon: _icon,
      badge: _badge,
      criticality: _criticality,
      className: _className,
      children: _children,
      ...rest
    } = props;
    return (
      // `type` and `title` are defaults placed before the spread, so a caller
      // can still override either through the native prop.
      <button type="button" title={text} {...rest} className={rootClassName}>
        {content}
      </button>
    );
  }

  const {
    value: _value,
    lead: _lead,
    icon: _icon,
    badge: _badge,
    criticality: _criticality,
    className: _className,
    children: _children,
    onClick: _onClick,
    ...rest
  } = props;
  return (
    <span title={text} {...rest} className={rootClassName}>
      <Context.Provider value={contextValue}>
        {content}
        {children}
      </Context.Provider>
    </span>
  );
};

Chip.Dismiss = Dismiss;

export default Chip;
