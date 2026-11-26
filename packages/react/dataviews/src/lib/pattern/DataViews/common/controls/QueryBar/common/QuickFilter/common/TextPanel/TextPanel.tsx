import { listOfferedOperators } from "@canonical/dataviews-core/bindings";
import type { ReactElement } from "react";
import { useDataViewsRoot } from "../../../../../../../../../_work_in_progress/DataViews/hooks/index.js";
import { TypedInput } from "../TypedInput/index.js";
import type { TextPanelProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds data-views-quick-filter-text";

/**
 * A text's panel: one input per operator its source offers on the field,
 * each named by the field and the operator, as "name contains", and each
 * committing on Enter or on leaving it.
 */
export default function TextPanel({
  definition,
  label,
  conjuncts,
  group,
  named,
  onCommit,
  onInvalid,
}: TextPanelProps): ReactElement {
  const { provider, messages } = useDataViewsRoot("QueryBar");
  const offered = listOfferedOperators(definition, provider.capabilities);
  return (
    <div className={componentCssClassName}>
      {offered.map((operator) => (
        <TypedInput
          key={operator}
          definition={definition}
          operator={operator}
          label={messages.operatorPhrase({ operator, operands: [], label })}
          standing={conjuncts.find(
            ({ ref }) => ref.operator === operator && ref.nth === 0,
          )}
          group={group}
          named={named}
          onCommit={onCommit}
          onInvalid={onInvalid}
        />
      ))}
    </div>
  );
}
