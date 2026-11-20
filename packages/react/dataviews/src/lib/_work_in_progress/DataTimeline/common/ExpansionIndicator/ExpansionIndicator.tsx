import { type ReactElement, useContext } from "react";
import { MessagesContext } from "../../../../common/index.js";
import { useHydrationFocusHandoff } from "../../../../hooks/index.js";
import type { ExpansionIndicatorProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds data-timeline-expansion";

/**
 * How many of the timeline's events are hidden, on the page or past it, with
 * the commands revealing the next ones and every one the page holds. Where
 * show more reaches past the page, it is a link to the grown window before
 * scripts take over, and a reader focused on it keeps focus on the button
 * replacing it.
 *
 * @implements ds:global.subcomponent.timeline-expansion_indicator
 */
export default function ExpansionIndicator({
  hidden,
  step,
  onShowMore,
  onShowAll,
  moreHref,
  hydrated,
}: ExpansionIndicatorProps): ReactElement {
  const messages = useContext(MessagesContext);
  const { link, button } = useHydrationFocusHandoff({ hydrated });
  const label = messages.showMoreEvents(step);
  let more: ReactElement | null = null;
  if (step > 0) {
    more =
      !hydrated && moreHref !== null ? (
        <a ref={link} className="command" href={moreHref}>
          {label}
        </a>
      ) : (
        <button
          ref={button}
          type="button"
          className="command"
          onClick={onShowMore}
        >
          {label}
        </button>
      );
  }
  return (
    <div className={componentCssClassName}>
      <span className="summary">{messages.eventsHidden(hidden)}</span>
      {more}
      {onShowAll === null ? null : (
        <button type="button" className="command" onClick={onShowAll}>
          {messages.showAllEvents}
        </button>
      )}
    </div>
  );
}
