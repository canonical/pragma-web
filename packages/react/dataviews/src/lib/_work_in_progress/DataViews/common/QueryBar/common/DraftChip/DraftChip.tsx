import { readCondition } from "@canonical/dataviews-core";
import type { ReactElement } from "react";
import { QueryChip } from "../../../../../QueryChip/index.js";
import { useDataViewsRoot } from "../../../../hooks/index.js";
import entryFormat from "../../entryFormat.js";
import listParts from "../../listParts.js";
import speakClause from "../../speakClause.js";
import spellOperand from "../../spellOperand.js";
import spellOperator from "../../spellOperator.js";
import type { QueryBarPart } from "../../types.js";
import { readLabelsStandIn } from "../../utils/index.js";
import type { DraftChipProps } from "./types.js";

/**
 * One clause as a query chip, applied, being built or being edited: a
 * Segment for each part it holds, in order, each activating its part, and
 * an Entry where the part being typed stands. A choice's values stay a
 * Segment while another is chosen after them; a typed value's Entry takes
 * its Segment's place. Every word is the messages' or the data's.
 */
export default function DraftChip({
  id,
  draft,
  part,
  typed,
  invalid,
  onActivate,
  onRemove,
  onTypedChange,
  onEntryKeyDown,
}: DraftChipProps): ReactElement {
  const { provider, messages } = useDataViewsRoot("QueryBar");
  const { schema } = provider.collection;
  const labels = readLabelsStandIn();
  const spoken = speakClause(draft, schema, labels, messages);
  const definition =
    draft.kind === "predicate" ? schema.findField(draft.field) : undefined;
  const label =
    draft.kind === "predicate" ? labels.readFieldLabel(draft.field) : "";
  // A choice's values are listed beside the Entry that adds to them.
  const isListed = definition?.kind === "choices";

  const renderEntry = (at: QueryBarPart): ReactElement => {
    const names: Readonly<Record<QueryBarPart, string>> = {
      field: messages.clauseField,
      operator: messages.clauseOperator(label),
      value: messages.clauseValue(label),
      search: messages.search,
    };
    const fault =
      invalid === null
        ? {}
        : ({
            invalid: true,
            description: messages.clauseInvalid(invalid),
          } as const);
    return (
      // Keyed by part, so each part's Entry is a new focus, which screen
      // readers announce.
      <QueryChip.Entry
        key={`entry-${at}`}
        value={typed}
        onValueChange={onTypedChange}
        label={names[at]}
        onKeyDown={onEntryKeyDown}
        {...entryFormat(definition, at, typed, messages)}
        {...fault}
      />
    );
  };

  const renderSegment = (at: QueryBarPart): ReactElement | null => {
    const activate = () => onActivate(at);
    if (draft.kind === "search") {
      return (
        <QueryChip.Segment key={at} data-part={at} onActivate={activate}>
          {draft.text}
        </QueryChip.Segment>
      );
    }
    if (at === "field") {
      return (
        <QueryChip.Segment key={at} data-part={at} onActivate={activate}>
          {label}
        </QueryChip.Segment>
      );
    }
    const { operator, operands } = draft;
    if (operator === null) return null;
    if (at === "operator") {
      const { shown, spoken: words } = spellOperator(
        operator,
        operands,
        messages,
      );
      return (
        <QueryChip.Segment
          key={at}
          data-part={at}
          onActivate={activate}
          condition={readCondition({ field: draft.field, operator, operands })}
          {...(shown === words ? {} : { label: words })}
        >
          {shown}
        </QueryChip.Segment>
      );
    }
    if (operands.length === 0) return null;
    return (
      <QueryChip.Segment key={at} data-part={at} onActivate={activate}>
        {operands
          .map((operand) =>
            spellOperand(definition, operand, messages.decimalSeparator),
          )
          .join(", ")}
      </QueryChip.Segment>
    );
  };

  return (
    <QueryChip
      id={id}
      label={spoken}
      onRemove={onRemove}
      removeLabel={messages.removeClause(spoken)}
    >
      {listParts(draft).flatMap((at) => {
        if (at !== part) return [renderSegment(at)];
        return at === "value" && isListed
          ? [renderSegment(at), renderEntry(at)]
          : [renderEntry(at)];
      })}
    </QueryChip>
  );
}
