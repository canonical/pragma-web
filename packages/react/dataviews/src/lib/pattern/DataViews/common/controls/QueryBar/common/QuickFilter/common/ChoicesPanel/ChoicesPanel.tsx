import type { PredicateOperand } from "@canonical/dataviews-core";
import {
  listOfferedOperators,
  spellWireKey,
} from "@canonical/dataviews-core/bindings";
import { Button, Icon } from "@canonical/react-ds-global";
import { CheckboxInput, TextInput } from "@canonical/react-ds-global-form";
import type { KeyboardEvent, ReactElement } from "react";
import { useState } from "react";
import { AssistiveText } from "../../../../../../../../../common/index.js";
import { useIsHydrated } from "../../../../../../../../../hooks/index.js";
import { spellCount } from "../../../../../../../../../utils/index.js";
import { useDataViewsRoot } from "../../../../../../../hooks/index.js";
import {
  ALTERNATIVE_SET_OPERATOR,
  NO_RECORDS,
  SET_OPERATOR_SWITCH_MESSAGES,
} from "../../../../../../constants.js";
import { listFacetOptions } from "../../../../../../utils/index.js";
import { useFieldFacets } from "../../hooks/index.js";
import type { ChoicesPanelProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds data-views-quick-filter-choices";

/** Past this many options, a search narrows them. */
const SEARCH_PAST = 10;

/**
 * A choice's panel: a checkbox per option, the schema's or, where they are
 * the server's, those its facet lists, beside any the field holds; each
 * option's count, where a facet answers the applied query, is part of its
 * name. Each tick commits at once, one transition, and the panel stays
 * open. Once scripts run, a search, named on screen, narrows the options
 * past ten, saying how many it leaves, Up and Down move between it and
 * the checkboxes, and a standing set can move to the other set operator.
 * While the server's options are on their way, and where there are none,
 * the panel says so, and it says how many arrived.
 */
export default function ChoicesPanel({
  definition,
  label,
  conjuncts,
  group,
  named,
  onCommit,
}: ChoicesPanelProps): ReactElement {
  const { provider, messages } = useDataViewsRoot("QueryBar");
  const { field } = definition;
  const facets = useFieldFacets({ provider, field });
  const hydrated = useIsHydrated();
  const [search, setSearch] = useState("");
  // The set the panel edits: the field's first any-of or none-of set.
  const standing = conjuncts.find(
    ({ ref }) => ref.operator === "isAny" || ref.operator === "isNone",
  );
  const offered = listOfferedOperators(definition, provider.capabilities);
  // With no set standing, the set the source offers: none-of where any-of
  // is not, so the panel is never a dead end.
  const operator =
    standing === undefined
      ? offered.includes("isAny") || !offered.includes("isNone")
        ? "isAny"
        : "isNone"
      : standing.ref.operator === "isNone"
        ? "isNone"
        : "isAny";
  const held = standing?.predicate.operands ?? [];
  const declared = offered.includes(operator);
  const declaredOptions = definition.options;
  const serverOwned = declaredOptions === undefined;
  // The server's options are text; a set may hold one no facet lists yet.
  const listed: readonly PredicateOperand[] = declaredOptions ?? [
    ...new Set([
      ...listFacetOptions(facets.latest ?? undefined),
      ...held.map(String),
    ]),
  ];
  // Loading only while a facet is on its way: a source that never answers
  // one leaves the options the field holds, or none.
  const isLoading = serverOwned && facets.latest === null && facets.pending;
  const counts =
    facets.answered?.kind === "values"
      ? new Map(
          facets.answered.values.map(({ value, count }) => [
            String(value),
            count,
          ]),
        )
      : null;
  // Whether the options were seen on their way, so their arrival is said.
  const [hadPending, setHadPending] = useState(false);
  if (isLoading && !hadPending) setHadPending(true);
  const isSearched = hydrated && listed.length > SEARCH_PAST;
  const wanted = search.trim().toLocaleLowerCase();
  const shown = listed.filter((option) =>
    String(option).toLocaleLowerCase().includes(wanted),
  );

  /** Tick or untick one option, as one transition. */
  const toggle = (option: PredicateOperand): void => {
    const next = held.includes(option)
      ? held.filter((operand) => operand !== option)
      : [...held, option];
    // The last untick removes the set, which held what was unticked.
    if (next.length === 0 && standing !== undefined) {
      onCommit(group.removePredicate(standing.ref));
      return;
    }
    onCommit(
      group.setPredicate(
        { field, operator, operands: next },
        standing?.ref.nth ?? 0,
      ),
    );
  };

  /** Up and Down move between the search and the checkboxes, and stop at either end. */
  // @note Impure: moves focus.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const stops = [
      ...event.currentTarget.querySelectorAll<HTMLInputElement>(
        'input[role="searchbox"], input[type="checkbox"]:not(:disabled)',
      ),
    ];
    const at = stops.indexOf(event.target as HTMLInputElement);
    if (at === -1) return;
    event.preventDefault();
    stops.at(event.key === "ArrowDown" ? at + 1 : Math.max(at - 1, 0))?.focus();
  };

  const alternative = ALTERNATIVE_SET_OPERATOR[operator];
  const renderSwitch = (): ReactElement | null =>
    hydrated && standing !== undefined && offered.includes(alternative) ? (
      <Button
        type="button"
        importance="tertiary"
        className="switch"
        onClick={() =>
          onCommit(
            group.editPredicates({
              remove: [standing.ref],
              add: [{ field, operator: alternative, operands: held }],
            }),
          )
        }
      >
        {messages[SET_OPERATOR_SWITCH_MESSAGES[alternative]]}
      </Button>
    ) : null;

  /** What the live region says as things stand. */
  const readStatus = (): string => {
    if (isLoading) return messages.optionsPending;
    if (wanted !== "") {
      return shown.length === 0
        ? messages.optionsNone
        : messages.optionsShown({ count: shown.length });
    }
    if (!hadPending) return "";
    return listed.length === 0
      ? messages.optionsNone
      : messages.optionsShown({ count: listed.length });
  };

  const renderOptions = (): ReactElement => {
    if (isLoading) {
      return <p className="status">{messages.optionsPending}</p>;
    }
    return (
      <fieldset className="options">
        <legend className="legend">
          {messages.operatorPhrase({ operator, operands: [], label })}
        </legend>
        {shown.length === 0 ? (
          <p className="status">{messages.optionsNone}</p>
        ) : (
          shown.map((option) => {
            const text = String(option);
            const count =
              counts === null
                ? null
                : spellCount(counts.get(text) ?? NO_RECORDS, messages);
            return (
              // biome-ignore lint/a11y/noLabelWithoutControl: the label wraps CheckboxInput, a native checkbox the rule cannot see through
              <label key={text} className="option">
                <CheckboxInput
                  {...(named ? { name: spellWireKey(field, operator) } : {})}
                  value={text}
                  checked={held.includes(option)}
                  // Undeclared, the set may only shrink.
                  disabled={!declared && !held.includes(option)}
                  onChange={() => toggle(option)}
                />
                {text}
                {count !== null && (
                  <>
                    <AssistiveText>, </AssistiveText>
                    <span className="count">{count}</span>
                  </>
                )}
              </label>
            );
          })
        )}
      </fieldset>
    );
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: the panel hears the arrow keys that bubble from its search and checkboxes
    <div className={componentCssClassName} onKeyDown={handleKeyDown}>
      {/* The search filters only once scripts run, so it waits for them. */}
      {isSearched && (
        <div className="search">
          <Icon icon="search" />
          <TextInput
            // The text input has no search type: the role says what it is.
            role="searchbox"
            aria-label={messages.searchOptions({ label })}
            // Its name on screen too, beside the search icon.
            placeholder={messages.searchOptions({ label })}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      )}
      {/* Present from the start, so what it says is heard: the options
          on their way, how many arrived, and how many the search leaves. */}
      <AssistiveText role="status">{readStatus()}</AssistiveText>
      {renderOptions()}
      {renderSwitch()}
    </div>
  );
}
