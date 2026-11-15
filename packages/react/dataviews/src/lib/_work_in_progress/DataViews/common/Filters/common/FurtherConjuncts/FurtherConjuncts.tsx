import type { ReactElement } from "react";
import { useDataViewsValue } from "../../../../../../hooks/index.js";
import { useDataViewsRoot } from "../../../../hooks/index.js";
import { PHRASE_MESSAGES } from "../constants.js";
import { FurtherConjunct } from "./common/index.js";
import type { FurtherConjunctsProps } from "./types.js";

const componentCssClassName = "ds data-views-filters-further-conjuncts";

/**
 * The conjuncts at a filter's address beyond the one its control edits, a
 * read-only row each; nothing while the address holds one or none.
 *
 * @implements ds:apps.subcomponent.data_views_filters-further_conjuncts
 */
export default function FurtherConjuncts({
  handle,
  field,
  operator,
  label,
  unit,
  host,
  onLeave,
  className,
  ...rest
}: FurtherConjunctsProps): ReactElement | null {
  const { messages } = useDataViewsRoot("Filters");
  const others = useDataViewsValue(handle.others);
  if (others.length === 0) {
    return null;
  }
  const key = PHRASE_MESSAGES[operator];
  const named = key === null ? label : messages[key](label);
  const phrase =
    unit === undefined ? named : messages.filterInUnit(named, unit);
  return (
    <ul
      {...rest}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      {others.map(({ nth, operands }, place) => (
        <FurtherConjunct
          key={nth}
          field={field}
          operator={operator}
          nth={nth}
          ordinal={place + 1}
          operands={operands}
          phrase={phrase}
          host={host}
          onLeave={onLeave}
        />
      ))}
    </ul>
  );
}
