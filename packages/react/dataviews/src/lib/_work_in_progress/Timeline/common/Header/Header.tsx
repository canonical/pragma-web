import { ContextualMenu, Icon } from "@canonical/react-ds-global";
import {
  type ReactElement,
  type ReactNode,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
} from "react";
import { MessagesContext } from "../../../../common/index.js";
import { useHydrationFocusHandoff } from "../../../../hooks/index.js";
import type {
  HeaderFilter,
  HeaderOrder,
  HeaderProps,
  HeaderReset,
} from "./types.js";
import "./styles.css";

const componentCssClassName = "ds data-timeline-header";

function Refusal({
  id,
  refusal,
}: {
  readonly id: string;
  readonly refusal: string | null;
}): ReactElement | null {
  return refusal === null ? null : (
    <span id={id} className="refusal">
      {refusal}
    </span>
  );
}

function FilterMenu({
  filter,
  hydrated,
}: {
  readonly filter: HeaderFilter;
  readonly hydrated: boolean;
}): ReactElement | null {
  const messages = useContext(MessagesContext);
  const refusalId = useId();
  const root = useRef<HTMLDivElement>(null);
  const hadFocus = useRef(false);
  // A reader inside the disclosure as scripts take over keeps focus on the menu's button.
  useLayoutEffect(() => {
    const held = root.current;
    if (!hydrated) {
      hadFocus.current =
        held?.contains(held.ownerDocument.activeElement) === true;
      return;
    }
    if (hadFocus.current) {
      hadFocus.current = false;
      held?.querySelector<HTMLButtonElement>("button")?.focus();
    }
  }, [hydrated]);
  const trigger = (
    <span className="trigger-content">
      <span className="label">{filter.label}</span>
      <Icon icon="chevron-down" />
    </span>
  );
  const checkmark = <Icon icon="checkmark" />;
  if (!hydrated && filter.options.every(({ href }) => href === null)) {
    return null;
  }
  return (
    <div ref={root} className="filter" data-field={filter.field}>
      {hydrated ? (
        <ContextualMenu
          label={messages.filterByField(filter.label)}
          maxWidth="fit-content"
          trigger={trigger}
          items={filter.options.map((option) => ({
            key: option.value,
            label: option.label,
            icon: option.applied ? checkmark : undefined,
          }))}
          onSelect={(item) => {
            filter.onSelect(String(item.key));
          }}
        />
      ) : (
        <details className="menu">
          <summary className="trigger">{trigger}</summary>
          <ul className="options">
            {filter.options.map((option) =>
              option.href === null ? null : (
                <li key={option.value}>
                  <a
                    href={option.href}
                    aria-current={option.applied ? "true" : undefined}
                  >
                    {option.applied ? checkmark : null}
                    {option.label}
                  </a>
                </li>
              ),
            )}
          </ul>
        </details>
      )}
      <Refusal id={refusalId} refusal={filter.refusal} />
    </div>
  );
}

function Control({
  href,
  hydrated,
  label,
  describedBy,
  onActivate,
  children,
}: {
  readonly href: string | null;
  readonly hydrated: boolean;
  readonly label?: string;
  readonly describedBy?: string | undefined;
  readonly onActivate: () => void;
  readonly children: ReactNode;
}): ReactElement | null {
  const { link, button } = useHydrationFocusHandoff({ hydrated });
  if (hydrated) {
    return (
      <button
        ref={button}
        type="button"
        className="control"
        aria-label={label}
        aria-describedby={describedBy}
        onClick={onActivate}
      >
        {children}
      </button>
    );
  }
  return href === null ? null : (
    <a
      ref={link}
      className="control"
      href={href}
      aria-label={label}
      aria-describedby={describedBy}
    >
      {children}
    </a>
  );
}

function Reset({
  reset,
  hydrated,
}: {
  readonly reset: HeaderReset;
  readonly hydrated: boolean;
}): ReactElement | null {
  const messages = useContext(MessagesContext);
  return (
    <Control
      href={reset.href}
      hydrated={hydrated}
      label={messages.resetFilters}
      onActivate={reset.onReset}
    >
      <Icon icon="restart" />
      <span className="label">{messages.reset}</span>
    </Control>
  );
}

function Order({
  order,
  hydrated,
}: {
  readonly order: HeaderOrder;
  readonly hydrated: boolean;
}): ReactElement {
  const messages = useContext(MessagesContext);
  const refusalId = useId();
  const { direction } = order;
  const text =
    direction === null
      ? messages.orderByDate
      : direction === "desc"
        ? messages.sortLatest
        : messages.sortEarliest;
  return (
    <div className="order">
      <Control
        href={order.href}
        hydrated={hydrated}
        label={text}
        describedBy={order.refusal === null ? undefined : refusalId}
        onActivate={order.onToggle}
      >
        {direction === null ? null : (
          <Icon icon={direction === "desc" ? "arrow-down" : "arrow-up"} />
        )}
        <span className={direction === null ? "label kept" : "label"}>
          {text}
        </span>
      </Control>
      <Refusal id={refusalId} refusal={order.refusal} />
    </div>
  );
}

/**
 * The timeline's control bar: its filters, led by "Filter by:", a reset
 * while any filter holds a restriction, and the order control stating the
 * order in force. Each change edits the collection's query, never the page
 * alone. Before scripts take over every control is a real link to the query
 * its change leads to, where the provider has a location; after, the
 * filters are the design system's menus and the rest are buttons.
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
