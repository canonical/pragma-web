import { type ReactElement, useContext } from "react";
import { MessagesContext } from "../../../../common/index.js";
import { useTimelineExpansion } from "../../hooks/index.js";
import type { SizedEvent } from "../../utils/index.js";
import { Event } from "../Event/index.js";
import { ExpansionIndicator } from "../ExpansionIndicator/index.js";
import { SelectEvent } from "../SelectEvent/index.js";
import type { EventListProps, NamedEvent } from "./types.js";

const componentCssClassName = "events";

/**
 * The page's events, in display order, as an ordered list, after a polite
 * line saying how many of them are shown. A long page is collapsed below its
 * first events, or between its first and last, behind the strip that
 * reveals the rest.
 */
export default function EventList({
  events,
  dateTimePosition,
  formats,
  expansion,
  selection,
  renderItem,
  order,
  isFiltered,
}: EventListProps): ReactElement {
  const messages = useContext(MessagesContext);
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
  const drawEvent = (
    { item: named, size }: SizedEvent<NamedEvent>,
    index: number,
  ) => {
    const { name, ...item } = named;
    const control =
      selection === null ? null : (
        <SelectEvent selection={selection} rowId={item.id} name={name} />
      );
    return (
      <li key={item.id} className="item">
        {renderItem === null ? (
          <Event
            item={item}
            markerSize={size}
            dateTimePosition={dateTimePosition}
            formats={formats}
            control={control}
          />
        ) : (
          (renderItem(item, {
            order,
            isVisible: true,
            isFiltered,
            markerSize: size,
            index,
            control,
          }) ?? null)
        )}
      </li>
    );
  };
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
    <>
      <p className="showing" aria-live="polite">
        {messages.eventsShown(topCount + bottomCount, events.length)}
      </p>
      {events.length === 0 ? null : (
        <ol className={componentCssClassName}>
          {events.slice(0, topCount).map(drawEvent)}
          {indicatorPosition === "middle" ? indicator : null}
          {events
            .slice(bottomStart, bottomStart + bottomCount)
            .map((event, at) => drawEvent(event, bottomStart + at))}
          {indicatorPosition === "bottom" ? indicator : null}
        </ol>
      )}
    </>
  );
}
