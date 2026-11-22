import type { Count } from "@canonical/dataviews-core";
import { type ReactElement, useContext } from "react";
import { MessagesContext } from "../../../../common/index.js";
import { useIsHydrated } from "../../../../hooks/index.js";
import { useTimelineExpansion } from "../../hooks/index.js";
import type { SizedEvent } from "../../utils/index.js";
import { Event } from "../Event/index.js";
import { ExpansionIndicator } from "../ExpansionIndicator/index.js";
import { SelectEvent } from "../SelectEvent/index.js";
import type { EventListProps, NamedEvent } from "./types.js";

const componentCssClassName = "events";

/**
 * The page's events, in display order, as an ordered list, after a polite
 * line saying how many of the collection's events are shown. A long page is
 * collapsed below its first events, or between its first and last, behind
 * the strip that reveals the rest; once the page shows whole, the strip asks
 * the collection for the events past it.
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
  total,
  requestMore,
  moreHref,
}: EventListProps): ReactElement {
  const messages = useContext(MessagesContext);
  const hydrated = useIsHydrated();
  const {
    topCount,
    bottomCount,
    hiddenCount,
    indicatorPosition,
    step,
    fetchesMore,
    showMore,
    showAll,
  } = useTimelineExpansion({
    count: events.length,
    ...(expansion === false ? { method: "none" } : expansion),
    requestMore,
  });
  const shown = topCount + bottomCount;
  // The events past the page join the ones it hides, as exactly as the
  // source counts the collection; without a count, only that more exist.
  const hidden: Count =
    total.kind === "unknown"
      ? total
      : {
          kind: total.kind,
          value: Math.max(hiddenCount, total.value - shown),
        };
  // Show more never offers more than are hidden: on the page, or past it
  // where the source counts the rest exactly.
  let revealed = Math.min(step, hiddenCount);
  if (fetchesMore) {
    revealed = hidden.kind === "exact" ? Math.min(step, hidden.value) : step;
  }
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
        hidden={hidden}
        step={revealed}
        onShowMore={showMore}
        onShowAll={hiddenCount > 0 ? showAll : null}
        moreHref={fetchesMore ? moreHref : null}
        hydrated={hydrated}
      />
    </li>
  );
  return (
    <>
      <p className="showing" aria-live="polite">
        {messages.eventsShown(shown, total)}
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
