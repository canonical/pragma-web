import { type ReactElement, useContext } from "react";
import { MessagesContext } from "../../../../common/index.js";
import type { ExpansionIndicatorProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds data-timeline-expansion";

/**
 * How many of the page's events are hidden, with the commands revealing the
 * next ones and all of them. "Show more" never offers more than are hidden.
 */
export default function ExpansionIndicator({
  hiddenCount,
  step,
  onShowMore,
  onShowAll,
}: ExpansionIndicatorProps): ReactElement {
  const messages = useContext(MessagesContext);
  const more = Math.min(step, hiddenCount);
  return (
    <div className={componentCssClassName}>
      <span className="summary">{messages.eventsHidden(hiddenCount)}</span>
      {more > 0 ? (
        <button type="button" className="command" onClick={onShowMore}>
          {messages.showMoreEvents(more)}
        </button>
      ) : null}
      <button type="button" className="command" onClick={onShowAll}>
        {messages.showAllEvents}
      </button>
    </div>
  );
}
