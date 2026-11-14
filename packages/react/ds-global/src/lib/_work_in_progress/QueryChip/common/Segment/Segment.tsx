import { type ReactElement, useContext, useId } from "react";
import useRovingItem from "../../../../common/Roving/hooks/useRovingItem.js";
import Context from "../Context.js";
import type { SegmentProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds query-chip-segment";

/**
 * A solid part of a query chip, such as its field, its operator or its
 * value: a piece of text with its own fill, which can be hovered, selected
 * or marked invalid without its siblings. With `onActivate` it is a button
 * in the roving toolbar once scripts run; otherwise it is plain text.
 *
 * `import { QueryChip } from "@canonical/react-ds-global";`
 *
 * @implements ds:global_dataviews.subcomponent.query_chip-segment
 */
const Segment = ({
  children,
  label,
  condition,
  invalid,
  description,
  onActivate,
}: SegmentProps): ReactElement => {
  const chip = useContext(Context);
  const instanceId = useId();
  const rovingItem = useRovingItem({ id: `${chip.id}:${instanceId}` });
  const descriptionId = description && `${instanceId}-description`;
  const className = [componentCssClassName, condition]
    .filter(Boolean)
    .join(" ");
  // One glyph slot, shaped by the --modifier-icon channel: Criticality
  // Error's on a segment at fault, else the operator's Condition mark.
  const glyph = (invalid || condition) && (
    <span className={invalid ? "glyph error" : "glyph"} aria-hidden="true" />
  );
  const descriptionElement = descriptionId && (
    <span id={descriptionId} className="assistive">
      {description}
    </span>
  );

  if (onActivate && chip.isMounted && rovingItem) {
    return (
      <>
        <button
          type="button"
          className={className}
          data-invalid={invalid || undefined}
          {...rovingItem}
          onClick={() => {
            rovingItem.onClick();
            onActivate();
          }}
          aria-label={label}
          aria-describedby={descriptionId}
          disabled={chip.disabled}
        >
          {glyph}
          <span className="text">{children}</span>
        </button>
        {descriptionElement}
      </>
    );
  }

  return (
    <>
      <span
        className={className}
        data-invalid={invalid || undefined}
        data-disabled={chip.disabled || undefined}
      >
        {glyph}
        {label === undefined ? (
          <span className="text">{children}</span>
        ) : (
          <>
            <span className="text" aria-hidden="true">
              {children}
            </span>
            <span className="assistive">{label}</span>
          </>
        )}
      </span>
      {descriptionElement}
    </>
  );
};

export default Segment;
