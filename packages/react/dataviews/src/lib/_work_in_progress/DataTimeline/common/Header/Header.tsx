import { type ReactElement, useContext } from "react";
import { MessagesContext } from "../../../../common/index.js";
import { FilterMenu, Order, Reset } from "./common/index.js";
import type { HeaderProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds data-timeline-header";

/**
 * The timeline's control bar: its filters, led by "Filter by:", a reset
 * while any filter holds a restriction, and the order control stating the
 * order in force. Each change edits the collection's query, never the page
 * alone. Before scripts take over every control is a real link to the query
 * its change leads to, where the provider has a location; after, the
 * filters are the design system's menus and the rest are buttons.
 *
 * @implements ds:global.subcomponent.timeline-header
 */
export default function Header({
  filters,
  reset,
  order,
  hydrated,
}: HeaderProps): ReactElement {
  const messages = useContext(MessagesContext);
  return (
    <div className={componentCssClassName}>
      {filters.length === 0 ? null : (
        <div className="filters">
          <span className="filter-label">{messages.filterBy}</span>
          {filters.map((filter) => (
            <FilterMenu
              key={filter.field}
              filter={filter}
              hydrated={hydrated}
            />
          ))}
          {reset === null ? null : <Reset reset={reset} hydrated={hydrated} />}
        </div>
      )}
      {order === null ? null : <Order order={order} hydrated={hydrated} />}
    </div>
  );
}
