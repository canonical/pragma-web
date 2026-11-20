import { ContextualMenu, Icon } from "@canonical/react-ds-global";
import {
  type ReactElement,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
} from "react";
import { MessagesContext } from "../../../../../../common/index.js";
import { Refusal } from "../Refusal/index.js";
import type { FilterMenuProps } from "./types.js";

/**
 * One filter's values: the design system's menu once scripts take over, a
 * disclosure of links to each value's query before, and nothing before
 * scripts where there is no location to link to.
 */
export default function FilterMenu({
  filter,
  hydrated,
}: FilterMenuProps): ReactElement | null {
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
          items={filter.options.map((option) => ({
            key: option.value,
            label: option.label,
            icon: option.applied ? checkmark : undefined,
          }))}
          onSelect={(item) => {
            filter.onSelect(String(item.key));
          }}
        >
          {trigger}
        </ContextualMenu>
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
