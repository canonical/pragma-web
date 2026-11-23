import type { Predicate } from "@canonical/dataviews-core";
import { listConjuncts } from "@canonical/dataviews-core/bindings";
import { memo, type ReactElement, useMemo } from "react";
import {
  useDataViewsValue,
  useIsHydrated,
} from "../../../../../../hooks/index.js";
import { QueryChip } from "../../../../../QueryChip/index.js";
import { useDataViewsRoot } from "../../../../hooks/index.js";
import entryFormat from "../../entryFormat.js";
import readRangeBound from "../../readRangeBound.js";
import speakRange from "../../speakRange.js";
import spellCommandHref from "../../spellCommandHref.js";
import spellOperand from "../../spellOperand.js";
import spellOperator from "../../spellOperator.js";
import type { QueryStateStandIn } from "../../types.js";
import { readLabelsStandIn } from "../../utils/index.js";
import type { RangeChipProps } from "./types.js";

/** Which of the two bounds: the `gte`, or the `lte`. */
type Bound = "lower" | "upper";

/** The two bounds as they apply, or null once either is gone. */
type Bounds = readonly [Predicate, Predicate] | null;

/** Two readings of the bounds that say the same. */
const isSameBounds = (a: Bounds, b: Bounds): boolean =>
  a === b || JSON.stringify(a) === JSON.stringify(b);

/**
 * A field's lower and upper bound as one chip: the field, then each bound
 * as its symbol and its value, each activating an edit of that bound's
 * value. It reads its own two conjuncts, so a commit elsewhere renders
 * nothing here, and removing it removes both at once. While one bound is
 * edited, its Entry takes that bound's place.
 */
const RangeChip = ({
  clause,
  group,
  edit,
  onActivate,
  onRemove,
  onTypedChange,
  onEntryKeyDown,
}: RangeChipProps): ReactElement | null => {
  const { provider, messages } = useDataViewsRoot("QueryBar");
  const { schema } = provider.collection;
  const labels = readLabelsStandIn();
  const read = useMemo(() => {
    const [lowerRef, upperRef] = clause.refs;
    return (state: QueryStateStandIn): Bounds => {
      const lower = listConjuncts(
        state.slice,
        lowerRef.field,
        lowerRef.operator,
      ).at(lowerRef.nth);
      const upper = listConjuncts(
        state.slice,
        upperRef.field,
        upperRef.operator,
      ).at(upperRef.nth);
      return lower === undefined || upper === undefined ? null : [lower, upper];
    };
  }, [clause]);
  const bounds = useDataViewsValue(group.state, read, isSameBounds);
  const hydrated = useIsHydrated();
  const editedOperator = edit?.draft.origin?.ref?.operator;
  if (bounds === null) return null;
  const [lower, upper] = bounds;
  const definition = schema.findField(clause.field);
  const label = labels.readFieldLabel(clause.field);
  const spoken = speakRange(lower, upper, schema, labels, messages);
  // Before scripts, removal is a link to the query without either bound.
  const removeHref = hydrated
    ? null
    : spellCommandHref(group, {
        kind: "editPredicates",
        remove: [...clause.refs],
        add: [],
      });

  const renderBound = (bound: Bound): ReactElement => {
    const predicate = bound === "lower" ? lower : upper;
    if (edit !== null && editedOperator === predicate.operator) {
      return (
        <QueryChip.Entry
          key={`entry-${bound}`}
          value={edit.typed}
          onValueChange={onTypedChange}
          label={messages.clauseBound({ label, bound })}
          onKeyDown={onEntryKeyDown}
          {...entryFormat(definition, "value", edit.typed, messages)}
          {...(edit.invalid === null
            ? {}
            : {
                invalid: true,
                description: messages.clauseInvalid(edit.invalid),
              })}
        />
      );
    }
    const { shown, spoken: words } = spellOperator(
      predicate.operator,
      predicate.operands,
      messages,
    );
    const values = predicate.operands.map((operand) =>
      spellOperand(definition, operand, messages.decimalSeparator),
    );
    return (
      <QueryChip.Segment
        key={bound}
        // Each bound is a value part; its operator tells the two apart
        // when focus returns to one.
        data-part="value"
        data-operator={predicate.operator}
        condition="range"
        label={messages.queryClause({ phrase: words, values })}
        onActivate={() =>
          onActivate(
            readRangeBound(clause, bound === "lower" ? 0 : 1, predicate),
            "value",
          )
        }
      >
        {`${shown} ${values.join(", ")}`}
      </QueryChip.Segment>
    );
  };

  return (
    <QueryChip
      id={clause.id}
      label={spoken}
      onRemove={() => onRemove(clause)}
      {...(removeHref === null ? {} : { removeHref })}
      removeLabel={messages.removeClause(spoken)}
    >
      {/* The field lands the stop, and edits the range from its lower bound. */}
      <QueryChip.Segment
        data-part="field"
        onActivate={() => onActivate(readRangeBound(clause, 0, lower), "value")}
      >
        {label}
      </QueryChip.Segment>
      {renderBound("lower")}
      {renderBound("upper")}
    </QueryChip>
  );
};

export default memo(RangeChip);
