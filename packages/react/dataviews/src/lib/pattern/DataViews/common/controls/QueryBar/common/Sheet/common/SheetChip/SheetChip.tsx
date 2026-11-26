import { readCondition } from "@canonical/dataviews-core";
import { readProviderHost } from "@canonical/dataviews-core/bindings";
import type { ReactElement } from "react";
import { QueryChip } from "../../../../../../../../../_work_in_progress/QueryChip/index.js";
import { useDataViewsRoot } from "../../../../../../../hooks/index.js";
import type { QueryClause } from "../../../../types.js";
import {
  nameRefused,
  readLabelsStandIn,
  speakChip,
  spellOperand,
  spellOperator,
} from "../../../../utils/index.js";
import type { SheetChipProps } from "./types.js";

/**
 * One applied clause in the sheet, read-only: its parts are plain text,
 * so the chip's one tab stop is its remove control, which is named by the
 * clause and called with it, or, before scripts run, a link to where
 * removing it leads. It stands in no toolbar, so it takes no id;
 * it carries its clause's id as `data-clause`, for focus to find it. A
 * refused filter or search is the error tone, its reason describing the
 * remove control, which it has only where the parameter can be cleared.
 * Every word is the messages' or the data's.
 */
export default function SheetChip({
  clause,
  onRemove,
  removeHref,
}: SheetChipProps): ReactElement {
  const { provider, messages } = useDataViewsRoot("QueryBar");
  const { schema } = provider.collection;
  const labels = readLabelsStandIn();
  const spoken = speakChip(clause, schema, labels, messages);
  // A refused parameter can be cleared only where there is an address.
  const isRemovable =
    clause.kind !== "refused" || readProviderHost(provider).location !== null;
  const removeProps = isRemovable
    ? {
        onRemove: () => onRemove(clause),
        ...(removeHref == null ? {} : { removeHref }),
        // A refusal is cleared, as the bar's own chip says.
        removeLabel:
          clause.kind === "refused"
            ? messages.clearFilter(spoken)
            : messages.removeClause(spoken),
      }
    : {};

  const renderParts = (shown: QueryClause): ReactElement | ReactElement[] => {
    switch (shown.kind) {
      case "search":
        return (
          <QueryChip.Segment data-part="search">
            {shown.search}
          </QueryChip.Segment>
        );
      case "refused": {
        const name = nameRefused(shown.issue, labels, messages);
        return (
          <QueryChip.Segment
            data-part="field"
            description={messages.clauseRefused(name, shown.issue.reason)}
          >
            {name}
          </QueryChip.Segment>
        );
      }
      case "range": {
        const definition = schema.findField(shown.field);
        return [
          <QueryChip.Segment key="field" data-part="field">
            {labels.readFieldLabel(shown.field)}
          </QueryChip.Segment>,
          ...[shown.lower, shown.upper].map((bound) => {
            const { shown: symbol, spoken: words } = spellOperator(
              bound.operator,
              bound.operands,
              messages,
            );
            const values = bound.operands.map((operand) =>
              spellOperand(definition, operand, messages.decimalSeparator),
            );
            return (
              <QueryChip.Segment
                key={bound.operator}
                data-part="value"
                condition="range"
                label={messages.queryClause({ phrase: words, values })}
              >
                {`${symbol} ${values.join(", ")}`}
              </QueryChip.Segment>
            );
          }),
        ];
      }
      case "predicate": {
        const { predicate } = shown;
        const definition = schema.findField(predicate.field);
        const { shown: symbol, spoken: words } = spellOperator(
          predicate.operator,
          predicate.operands,
          messages,
        );
        return [
          <QueryChip.Segment key="field" data-part="field">
            {labels.readFieldLabel(predicate.field)}
          </QueryChip.Segment>,
          <QueryChip.Segment
            key="operator"
            data-part="operator"
            condition={readCondition(predicate)}
            {...(symbol === words ? {} : { label: words })}
          >
            {symbol}
          </QueryChip.Segment>,
          // Presence speaks its value in its operator.
          ...(predicate.operator === "isSet"
            ? []
            : [
                <QueryChip.Segment key="value" data-part="value">
                  {predicate.operands
                    .map((operand) =>
                      spellOperand(
                        definition,
                        operand,
                        messages.decimalSeparator,
                      ),
                    )
                    .join(", ")}
                </QueryChip.Segment>,
              ]),
        ];
      }
    }
  };

  return (
    <QueryChip
      data-clause={clause.id}
      label={spoken}
      {...(clause.kind === "refused" ? { criticality: "error" } : {})}
      {...removeProps}
    >
      {renderParts(clause)}
    </QueryChip>
  );
}
