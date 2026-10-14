import { withTooltip } from "@canonical/react-ds-global";
import { type ReactElement, useMemo } from "react";
import type { DateTimeProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds data-timeline-datetime";

type TimeProps = {
  readonly value: string;
  readonly display: string;
  readonly className: string;
};

const Time = ({ value, display, className }: TimeProps): ReactElement => (
  <time className={className} dateTime={value}>
    {display}
  </time>
);

/**
 * When an event happened, in the form every event shows, with the other form
 * as its tooltip. Where toggling is allowed it is a pressed-state button
 * switching every event's form at once.
 */
export default function DateTime({
  value,
  display,
  alternate,
  tooltip,
  toggleable,
  pressed,
  onToggle,
}: DateTimeProps): ReactElement {
  const Tipped = useMemo(
    () => withTooltip(Time, alternate, { distance: "6px" }),
    [alternate],
  );
  const Shown = tooltip && alternate !== display ? Tipped : Time;
  if (!toggleable) {
    return (
      <Shown
        value={value}
        display={display}
        className={componentCssClassName}
      />
    );
  }
  return (
    <button
      type="button"
      className={componentCssClassName}
      aria-pressed={pressed}
      onClick={onToggle}
    >
      <Shown value={value} display={display} className="value" />
    </button>
  );
}
