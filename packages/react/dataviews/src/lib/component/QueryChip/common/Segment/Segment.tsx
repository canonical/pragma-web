import { type ComponentProps, type ReactElement, useContext } from "react";
import { useRovingItem } from "../../../../common/index.js";
import Context from "../Context.js";
import type { SegmentProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds query-chip-segment";

/** Button attributes with no meaning on the plain-text form. */
const BUTTON_ONLY_PROPS = [
  "form",
  "formAction",
  "formEncType",
  "formMethod",
  "formNoValidate",
  "formTarget",
  "name",
  "value",
  "popoverTarget",
  "popoverTargetAction",
] as const;

/** Drops the button-only attributes, for a Segment rendered as plain text. */
const omitButtonProps = (
  props: Record<string, unknown>,
): ComponentProps<"span"> =>
  Object.fromEntries(
    Object.entries(props).filter(
      ([key]) => !(BUTTON_ONLY_PROPS as readonly string[]).includes(key),
    ),
  );

/**
 * One settled part of a query chip, such as its field, its operator or its
 * value: a piece of text with its own fill, which can be activated on its
 * own; under the default `separated` unity it is also hovered and marked
 * invalid on its own. The host composes one Segment for each settled part.
 *
 * @implements ds:global_dataviews.subcomponent.query_chip-segment
 */
export default function Segment({
  children,
  label,
  condition,
  invalid,
  description,
  onActivate,
  className,
  ...props
}: SegmentProps): ReactElement {
  const part = useContext(Context);
  const {
    ref,
    onFocus,
    "aria-describedby": hostDescribedBy,
    ...rest
  } = props as ComponentProps<"button">;
  // Only the chip's first Segment is its toolbar item, and only while the
  // chip holds no Entry. The host's ref and focus handler are kept.
  const rovingItem = useRovingItem<HTMLButtonElement>({
    id: part.isItem ? part.id : undefined,
    ref,
    onFocus,
  });
  const classes = [componentCssClassName, className].filter(Boolean).join(" ");
  const isFlagged = invalid || part.isRefusedReason;
  // One glyph slot, shaped by the --modifier-icon channel: Criticality
  // Error's on a Segment at fault or a refused chip's first Segment, else
  // the operator's Condition mark.
  const glyph = (isFlagged || condition) && (
    // The `error` class only feeds the glyph's shape from the criticality
    // channel; `data-fault` marks the purpose.
    <span
      className={isFlagged ? "glyph error" : "glyph"}
      data-fault={isFlagged || undefined}
      aria-hidden="true"
    />
  );

  if (onActivate && part.isMounted) {
    const descriptionId = description ? part.descriptionId : undefined;
    return (
      <>
        <button
          {...rest}
          type="button"
          className={classes}
          data-condition={condition}
          data-invalid={invalid || undefined}
          ref={rovingItem ? rovingItem.ref : ref}
          onFocus={rovingItem ? rovingItem.onFocus : onFocus}
          // A button lives in a roving toolbar, where every Segment but the
          // toolbar item stays out of the tab order.
          tabIndex={rovingItem?.tabIndex ?? -1}
          data-roving-item={rovingItem?.["data-roving-item"]}
          onClick={(event) => {
            rovingItem?.onClick(event);
            onActivate();
          }}
          aria-label={label}
          aria-describedby={
            [descriptionId, ...part.faultIds, hostDescribedBy]
              .filter(Boolean)
              .join(" ") || undefined
          }
          disabled={part.disabled}
        >
          {glyph}
          <span className="text">{children}</span>
        </button>
        {descriptionId && (
          // Spoken through the button's description only, not twice.
          <span id={descriptionId} hidden>
            {description}
          </span>
        )}
      </>
    );
  }

  // The chip renders a plain-text Segment's description after its last
  // part, so the clause reads whole before the reason.
  return (
    <span
      // Before scripts run, a button's Segment renders its plain-text form.
      {...omitButtonProps({
        ...rest,
        // A button's ref and focus handler are for the button, which renders
        // once scripts run; the plain-text form takes them only when the
        // Segment is never a button.
        ...(onActivate ? {} : { ref, onFocus }),
        "aria-describedby": hostDescribedBy,
      })}
      className={classes}
      data-condition={condition}
      data-invalid={invalid || undefined}
      data-disabled={part.disabled || undefined}
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
  );
}
