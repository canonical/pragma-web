import type {
  PredicateEdit,
  SchemaFieldDefinition,
  SourceRefusal,
} from "@canonical/dataviews-core";
import { listOfferedOperators } from "@canonical/dataviews-core/bindings";
import type { ReactElement } from "react";
import { memo, useId, useMemo, useRef } from "react";
import { useDataViewsRoot } from "../../../../../../../_work_in_progress/DataViews/hooks/index.js";
import { FilterButton } from "../../../../../../../_work_in_progress/FilterButton/index.js";
import { FilterOptions } from "../../../../../../../_work_in_progress/FilterOptions/index.js";
import {
  useDataViewsValue,
  useIsHydrated,
} from "../../../../../../../hooks/index.js";
import type { QueryStateStandIn } from "../../types.js";
import { readLabelsStandIn, spellCommandHref } from "../../utils/index.js";
import { BoundsPanel } from "./common/BoundsPanel/index.js";
import { ChoicesPanel } from "./common/ChoicesPanel/index.js";
import { PanelForm } from "./common/PanelForm/index.js";
import { PresencePanel } from "./common/PresencePanel/index.js";
import { TextPanel } from "./common/TextPanel/index.js";
import { useFocusRescue } from "./hooks/index.js";
import type { QuickFilterPanelProps, QuickFilterProps } from "./types.js";
import {
  isSameConjuncts,
  listFieldConjuncts,
  listPanelConjuncts,
  readAppliedCount,
  readQuickFilterOptions,
} from "./utils/index.js";

/** The edit that leaves the query as it stands. */
const NO_EDIT: PredicateEdit = Object.freeze({ remove: [], add: [] });

/** The panel each field kind edits through. */
const PANELS: {
  readonly [TKind in SchemaFieldDefinition["kind"]]: (
    props: QuickFilterPanelProps<TKind>,
  ) => ReactElement;
} = {
  choices: ChoicesPanel,
  number: BoundsPanel,
  date: BoundsPanel,
  text: TextPanel,
  presence: PresencePanel,
};

/**
 * One field's quick filter, beside the bar's field: its values as words,
 * or a filter button opening a panel of the controls its kind edits
 * through. It reads only its own field's conjuncts from the query state,
 * so a commit on another field renders nothing here; its words' marks,
 * its button's count and condition, and its controls' state are derived
 * from them on each read. While something applies, the words' name says
 * so with its Condition's mark, and an excluded value shows the Exclusion
 * mark. Each choice commits at once, and says what it did. Before scripts
 * run, where the location spells addresses, each word is a link to the
 * query with its condition set or removed, and the panel is a GET form.
 */
const QuickFilter = ({
  field,
  arrangement,
  group,
  hasHref,
  panelRef,
  onRefused,
  onCommitted,
  onInvalid,
}: QuickFilterProps): ReactElement => {
  const { provider, messages } = useDataViewsRoot("QueryBar");
  const hydrated = useIsHydrated();
  const wordsId = useId();
  const bodyRef = useRef<HTMLDivElement>(null);
  useFocusRescue({ containerRef: bodyRef });
  const select = useMemo(
    () => (state: QueryStateStandIn) => listFieldConjuncts(state, field),
    [field],
  );
  const conjuncts = useDataViewsValue(group.state, select, isSameConjuncts);
  const definition = provider.collection.schema.findField(field);
  /* v8 ignore next 3 -- unreachable: the bar refuses a field the schema lacks */
  if (definition === undefined) {
    throw new Error(`DataViews.QueryBar: the schema has no field "${field}"`);
  }
  const label = readLabelsStandIn().readFieldLabel(field);

  /** Where a word leads before scripts: the query its edit makes. */
  const spellWordHref = (edit: PredicateEdit): string | undefined => {
    const href = spellCommandHref(group, { kind: "editPredicates", ...edit });
    /* v8 ignore next -- unreachable: a location that spells the query spells every edit of it */
    return href ?? undefined;
  };

  /** Say how a commit went: why it was refused, or what it did. */
  const settle = (refusals: readonly SourceRefusal[]): void => {
    if (refusals.length > 0) {
      onRefused(refusals);
      return;
    }
    onCommitted(
      field,
      conjuncts.map(({ predicate }) => predicate),
    );
  };

  const commit = (edit: PredicateEdit): void => {
    settle(group.editPredicates(edit));
  };

  const { count, condition } = readAppliedCount(conjuncts);
  const appliedLabel =
    count > 0 ? messages.appliedCount({ count, condition }) : undefined;

  // Words take a choice's declared values, which the bar checked.
  if (
    arrangement === "words" &&
    definition.kind === "choices" &&
    definition.options !== undefined
  ) {
    const words = readQuickFilterOptions({
      field,
      options: definition.options,
      multiple: definition.multiple === true,
      conjuncts,
      allLabel: messages.allOptions,
    });
    // Links only before scripts: read once, as rendered, when nothing
    // moves the query under them.
    const isLinked = hasHref && !hydrated;
    return (
      <FilterOptions
        id={wordsId}
        label={label}
        multiple={definition.multiple === true}
        condition={condition}
        appliedLabel={appliedLabel}
        options={words.map(
          ({ value, label: word, current, excluded, edit }) => ({
            // Two values that print alike stay two words.
            value: value === null ? "" : `${typeof value}:${String(value)}`,
            label: word,
            current,
            ...(excluded
              ? { excludedLabel: messages.optionExcluded({ value: word }) }
              : {}),
            // A word that changes nothing leads to the query as it stands,
            // and chooses nothing once scripts run.
            href: isLinked ? spellWordHref(edit ?? NO_EDIT) : undefined,
            onSelect: edit === null ? undefined : () => commit(edit),
          }),
        )}
      />
    );
  }

  // Narrowed by the same discriminant the record is keyed by.
  const Panel = PANELS[definition.kind] as (
    props: QuickFilterPanelProps<SchemaFieldDefinition["kind"]>,
  ) => ReactElement;
  const appliedProps:
    | { readonly applied: number; readonly appliedLabel: string }
    | { readonly applied?: 0 } =
    appliedLabel === undefined ? {} : { applied: count, appliedLabel };
  return (
    <FilterButton
      label={label}
      condition={condition}
      {...appliedProps}
      panelRef={panelRef}
    >
      {/* Focus stays in the panel when the control holding it goes. */}
      <div ref={bodyRef} className="body">
        <PanelForm
          claimed={listPanelConjuncts(
            definition,
            conjuncts,
            listOfferedOperators(definition, provider.capabilities),
          )}
          hasHref={hasHref}
        >
          <Panel
            definition={definition}
            label={label}
            conjuncts={conjuncts}
            group={group}
            named={hasHref}
            onCommit={settle}
            onInvalid={onInvalid}
          />
        </PanelForm>
      </div>
    </FilterButton>
  );
};

export default memo(QuickFilter);
