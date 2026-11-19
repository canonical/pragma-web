import type {
  DataViewsMessages,
  PredicateOperand,
} from "@canonical/dataviews-core";
import {
  applyQueryCommand,
  spellWireKey,
} from "@canonical/dataviews-core/bindings";
import { Button } from "@canonical/react-ds-global";
import { type ReactElement, useId } from "react";
import {
  useDataViewsValue,
  useHydrationFocusHandoff,
  useIsHydrated,
} from "../../../../../../hooks/index.js";
import { spellCount } from "../../../../../../utils/index.js";
import { useDataViewsRoot, useFilterHandle } from "../../../../hooks/index.js";
import { NO_RECORDS, PHRASE_MESSAGES } from "../constants.js";
import type { ChoicesFilterProps } from "./types.js";

const componentCssClassName = "ds data-views-filters-choices";

const NONE_SELECTED: ReadonlySet<PredicateOperand> = new Set();

/** The other set operator, which a standing set may move to. */
const ALTERNATIVE_OPERATOR = { isAny: "isNone", isNone: "isAny" } as const;

/** The message naming the control that moves a set to each operator. */
const SWITCH_MESSAGES = {
  isAny: "matchAnyInstead",
  isNone: "matchNoneInstead",
} as const satisfies Readonly<
  Record<ChoicesFilterProps["operator"], keyof DataViewsMessages>
>;

/**
 * One closed-set filter: a checkbox per option, named as the wire spells
 * the set, with each option's facet count. A standing set can move to the
 * other set operator, by a link before scripts and a button after.
 *
 * @implements ds:apps.subcomponent.data_views_filters-choices_filter
 */
export default function ChoicesFilter({
  options,
  serverOwned,
  counts,
  handle,
  operator,
  alternativeDeclared,
  alternativeHandle,
  host,
  label,
  field: fieldName,
  declared,
  leavesWhenCleared,
  onLeave,
  className,
  ...rest
}: ChoicesFilterProps): ReactElement | null {
  const { messages } = useDataViewsRoot("Filters");
  const field = useFilterHandle(handle);
  const alternativeField = useFilterHandle(alternativeHandle);
  // The set the control shows may be any conjunct at its address, so the
  // move names the one it is.
  const nth = useDataViewsValue(handle.nth);
  const hydrated = useIsHydrated();
  // The move link a server rendered and the button replacing it: the button
  // takes the link's focus, or the reader who tabbed to the move before
  // hydration is left on nothing.
  const { link: moveLink, button: moveButton } = useHydrationFocusHandoff({
    hydrated,
  });
  const baseId = useId();
  const standing = field.applied.kind === "value";
  const selected = standing ? field.applied.value : NONE_SELECTED;
  // Offered while nothing stands: any-of wherever it is declared; none-of
  // only where any-of is not, and otherwise reached by moving a standing set.
  const offered = declared && (operator === "isAny" || !alternativeDeclared);
  if (!offered && !standing) {
    return null;
  }
  // Each option once as its text, the set's own after those listed.
  const listed = serverOwned
    ? [...new Set([...options, ...Array.from(selected, String)])]
    : options;
  if (listed.length === 0) {
    return null;
  }
  /**
   * Where moving the set to the alternative leads: the query the core's own
   * transition makes of the applied one, so the link and the button arrive
   * at the same place.
   */
  const spellMove = (to: ChoicesFilterProps["operator"]): string | null => {
    // Read once, as rendered: the link is drawn only before hydration, when
    // nothing moves the query under it; once hydrated the button stands in.
    const { slice, window } = host.state.get();
    const moved = applyQueryCommand(slice, window, {
      kind: "editPredicates",
      remove: [{ field: fieldName, operator, nth }],
      add: [{ field: fieldName, operator: to, operands: [...selected] }],
    });
    const params = host.spellQuery({
      slice: moved.slice,
      window: moved.window,
    });
    return params === null ? null : `?${params}`;
  };
  const renderSwitch = (): ReactElement | null => {
    // A set moves only onto an empty one: moving onto a standing set would
    // overwrite a restriction in force.
    if (
      !alternativeDeclared ||
      !standing ||
      alternativeField.applied.kind === "value"
    ) {
      return null;
    }
    const alternative = ALTERNATIVE_OPERATOR[operator];
    const text = messages[SWITCH_MESSAGES[alternative]];
    if (hydrated) {
      return (
        <Button
          ref={moveButton}
          type="button"
          importance="tertiary"
          className="switch"
          onClick={() => {
            host.editPredicates(
              [{ field: fieldName, operator, nth }],
              [
                {
                  field: fieldName,
                  operator: alternative,
                  operands: [...selected],
                },
              ],
            );
            // The control leaves with the set it moved.
            onLeave();
          }}
        >
          {text}
        </Button>
      );
    }
    const destination = spellMove(alternative);
    return destination === null ? null : (
      <a ref={moveLink} className="switch" href={destination}>
        {text}
      </a>
    );
  };
  return (
    <fieldset
      {...rest}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <legend className="legend">
        {messages[PHRASE_MESSAGES[operator]](label)}
      </legend>
      {listed.map((option, place) => {
        const countId = `${baseId}-count-${place}`;
        // A facet that lists no record holding an option counts none.
        const count =
          counts === null
            ? null
            : spellCount(counts.get(String(option)) ?? NO_RECORDS, messages);
        return (
          <div key={String(option)} className="option">
            <label>
              <input
                type="checkbox"
                name={spellWireKey(fieldName, operator)}
                value={String(option)}
                checked={selected.has(option)}
                // Undeclared, the set may only shrink: adding an option would
                // be a restriction the source never offered.
                disabled={!declared && !selected.has(option)}
                aria-describedby={count === null ? undefined : countId}
                onChange={() => {
                  const next = listed.filter((candidate) =>
                    candidate === option
                      ? !selected.has(option)
                      : selected.has(candidate),
                  );
                  if (next.length === 0) {
                    field.clear();
                  } else {
                    field.set(next);
                  }
                  if (
                    !declared ||
                    // An option listed only because the set held it leaves
                    // with the set's hold on it, whatever else stays.
                    (serverOwned && !options.includes(String(option))) ||
                    (next.length === 0 && (!offered || leavesWhenCleared))
                  ) {
                    // The checkbox that had focus leaves with the set — an
                    // undeclared one, or one offered only while it stands —
                    // or is disabled as an option the set may not regain:
                    // neither can keep focus.
                    onLeave();
                  }
                }}
              />
              {String(option)}
            </label>
            {count === null ? null : (
              <span id={countId} className="count">
                {count}
              </span>
            )}
          </div>
        );
      })}
      {renderSwitch()}
    </fieldset>
  );
}
