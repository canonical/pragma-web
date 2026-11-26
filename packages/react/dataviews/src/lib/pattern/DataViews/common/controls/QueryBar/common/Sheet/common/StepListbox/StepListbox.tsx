import {
  type KeyboardEvent,
  type ReactElement,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import type { QueryInputOption } from "../../../../../../../../../_work_in_progress/QueryInput/index.js";
import type { StepListboxProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds data-views-query-bar-step-listbox";

/** Whether an option can be chosen: neither disabled nor the one held. */
const isChoosable = (option: QueryInputOption): boolean =>
  option.disabled !== true && option.current !== true;

/**
 * One step of "Add filter" as a full-width listbox, named by the step:
 * the fields, a field's operators or its values. Each option is a stop of
 * its own in turn: Up and Down move focus between options without
 * choosing, Home and End to the ends, and Enter, Space or a click chooses
 * the focused option. With several values, Space toggles an option and
 * the listbox is multiselectable. `aria-selected` marks only an option
 * chosen; a disabled option, or the one held, carries `aria-disabled`.
 * An option's hint is part of its name, after a comma. Focus moves to the
 * first option chosen, else the first option, as the step mounts.
 */
export default function StepListbox({
  label,
  options,
  emptyText,
  selected,
  multiple = false,
  onChoose,
  className,
  ...rest
}: StepListboxProps): ReactElement {
  const baseId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(() =>
    Math.max(
      options.findIndex(({ id }) => selected.has(id)),
      0,
    ),
  );

  // The stop rests on an option there is, as the options change.
  const stop = Math.min(focused, options.length - 1);

  // The step takes focus as it mounts: on the option its stop rests on,
  // or, with none to offer, on the list, which says so.
  // @note Impure: moves focus.
  useEffect(() => {
    const list = listRef.current;
    (
      list?.querySelector<HTMLElement>('[role="option"][tabindex="0"]') ?? list
    )?.focus();
  }, []);

  // Whether focus is in the step, kept while it goes nowhere, as when the
  // option holding it leaves.
  const hasFocusRef = useRef(true);
  const stopId = options.at(stop)?.id;
  // Options arriving or leaving can take focus with them: the list's
  // own as options land, or a focused option a new result drops. Focus
  // that was in the step comes back to the option at the stop, or to the
  // list while it has none.
  // @note Impure: moves focus.
  // biome-ignore lint/correctness/useExhaustiveDependencies: the options' count and the stop's option are what move focus away, so they run it
  useEffect(() => {
    const list = listRef.current;
    /* v8 ignore next -- unreachable: the list renders before its effects run */
    if (list === null || !hasFocusRef.current) return;
    const { activeElement, body } = list.ownerDocument;
    if (activeElement !== list && activeElement !== body) return;
    (
      list.querySelector<HTMLElement>('[role="option"][tabindex="0"]') ?? list
    ).focus();
  }, [options.length, stopId]);

  /** Move the stop, and focus, to an option by its place. */
  const moveTo = (index: number): void => {
    const next = Math.min(Math.max(index, 0), options.length - 1);
    setFocused(next);
    listRef.current
      ?.querySelectorAll<HTMLElement>('[role="option"]')
      [next]?.focus();
  };

  const choose = (option: QueryInputOption): void => {
    if (isChoosable(option)) onChoose(option);
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    index: number,
    option: QueryInputOption,
  ): void => {
    switch (event.key) {
      case "ArrowDown":
        moveTo(index + 1);
        break;
      case "ArrowUp":
        moveTo(index - 1);
        break;
      case "Home":
        moveTo(0);
        break;
      case "End":
        moveTo(options.length - 1);
        break;
      case "Enter":
      case " ":
        choose(option);
        break;
      default:
        return;
    }
    event.preventDefault();
  };

  const isEmpty = options.length === 0;
  const emptyId = `${baseId}-empty`;
  return (
    <>
      <div
        {...rest}
        ref={listRef}
        role="listbox"
        aria-label={label}
        aria-multiselectable={multiple || undefined}
        // With no option, the list itself holds the stop and says why.
        {...(isEmpty ? { tabIndex: 0, "aria-describedby": emptyId } : {})}
        onFocus={(event) => {
          hasFocusRef.current = true;
          rest.onFocus?.(event);
        }}
        onBlur={(event) => {
          // Focus going nowhere, as from an option that leaves, stays ours.
          const next = event.relatedTarget;
          if (next !== null && !event.currentTarget.contains(next)) {
            hasFocusRef.current = false;
          }
          rest.onBlur?.(event);
        }}
        className={[componentCssClassName, className].filter(Boolean).join(" ")}
      >
        {options.map((option, index) => {
          const isSelected = selected.has(option.id);
          return (
            <div
              key={option.id}
              id={`${baseId}-${index}`}
              role="option"
              className="option"
              tabIndex={index === stop ? 0 : -1}
              // One name, so no browser spaces the hint's comma apart.
              aria-label={[option.name ?? option.label, option.hint]
                .filter(Boolean)
                .join(", ")}
              // Several: every option says whether it is chosen. One: only
              // the option chosen says so.
              aria-selected={multiple ? isSelected : isSelected || undefined}
              aria-disabled={isChoosable(option) ? undefined : true}
              data-current={option.current || undefined}
              onKeyDown={(event) => handleKeyDown(event, index, option)}
              onClick={() => {
                setFocused(index);
                choose(option);
              }}
              onFocus={() => setFocused(index)}
            >
              {multiple && <span className="mark" aria-hidden="true" />}
              <span className="label">{option.label}</span>
              {option.hint && <span className="hint">{option.hint}</span>}
            </div>
          );
        })}
      </div>
      {isEmpty && (
        <span id={emptyId} className="empty">
          {emptyText}
        </span>
      )}
    </>
  );
}
