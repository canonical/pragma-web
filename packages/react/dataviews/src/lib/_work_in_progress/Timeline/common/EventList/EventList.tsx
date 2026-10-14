import type { ReactElement } from "react";
import { useTimelineExpansion } from "../../hooks/index.js";
import type { SizedEvent } from "../../utils/index.js";
import { Event } from "../Event/index.js";
import { ExpansionIndicator } from "../ExpansionIndicator/index.js";
import { SelectEvent } from "../SelectEvent/index.js";
import type { EventListProps, NamedEvent } from "./types.js";

const componentCssClassName = "events";

/**
 * The page's events, in display order, as an ordered list. A long page is
 * collapsed below its first events, or between its first and last, behind
 * the strip that reveals the rest.
 */
export default function EventList({
  events,
  dateTimePosition,
  formats,
  expansion,
  selection,
}: EventListProps): ReactElement {
  const {
    topCount,
    bottomCount,
    hiddenCount,
    indicatorPosition,
    step,
    showMore,
    showAll,
  } = useTimelineExpansion({
    count: events.length,
    ...(expansion === false ? { method: "none" } : expansion),
  });
  const bottomStart =
    indicatorPosition === "middle" ? events.length - bottomCount : topCount;
  const drawEvent = ({ item, size }: SizedEvent<NamedEvent>) => (
    <li key={item.id} className="item">
      <Event
        item={item}
        markerSize={size}
        dateTimePosition={dateTimePosition}
        formats={formats}
        control={
          selection === null ? undefined : (
            <SelectEvent
              selection={selection}
              rowId={item.id}
              name={item.name}
            />
          )
        }
      />
    </li>
  );
  const indicator = (
    <li key="expansion" className="item expansion">
      <ExpansionIndicator
        hiddenCount={hiddenCount}
        step={step}
        onShowMore={showMore}
        onShowAll={showAll}
      />
    </li>
  );
  return (
    <ol className={componentCssClassName}>
      {events.slice(0, topCount).map(drawEvent)}
      {indicatorPosition === "middle" ? indicator : null}
      {events.slice(bottomStart, bottomStart + bottomCount).map(drawEvent)}
      {indicatorPosition === "bottom" ? indicator : null}
    </ol>
  );
}
