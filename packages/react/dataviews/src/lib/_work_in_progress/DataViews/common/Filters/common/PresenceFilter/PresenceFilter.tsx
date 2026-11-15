import type { DataViewsMessages } from "@canonical/dataviews-core";
import {
  spellWireKey,
  spellWireValues,
} from "@canonical/dataviews-core/bindings";
import { type ReactElement, useId, useState } from "react";
import { spellCount } from "../../../../../../utils/index.js";
import { useDataViewsRoot, useFilterHandle } from "../../../../hooks/index.js";
import type { PresenceFilterProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds data-views-filters-presence";

/**
 * The three choices, in order: no restriction, records that hold a value,
 * records that hold none. Each with the operand it applies, null for none.
 */
const CHOICES = [
  { applied: null, message: "presenceAny" },
  { applied: true, message: "presenceSet" },
  { applied: false, message: "presenceUnset" },
] as const satisfies readonly {
  readonly applied: boolean | null;
  readonly message: keyof DataViewsMessages;
}[];

/**
 * One presence filter: a group of three radios, any record, records that
 * hold a value, and records that hold none. Choosing either restriction
 * applies it; choosing Any removes it. The radios are named as the wire
 * spells presence, and each value is what the encoder writes, so a GET
 * submission is the same clause and Any submits none. Arrow keys move
 * within the group natively, choosing each radio they reach. An undeclared
 * presence restriction is offered only while it stands, and only for
 * removal; once Any removes it, the group stays while focus is inside it,
 * so arrow keys never lose their place, and leaves when focus does. The
 * group says whether it holds focus, so its parent keeps it in place
 * meanwhile. Beside "Has a value" is how many matching records hold one,
 * from the facet, describing that radio while a facet answers the applied
 * query.
 *
 * `import { DataViews } from "@canonical/dataviews-react";`
 *
 * @implements ds:apps.subcomponent.data_views_filters-presence_filter
 */
export default function PresenceFilter({
  handle,
  count,
  label,
  field: fieldName,
  declared,
  onHold,
  className,
  ...rest
}: PresenceFilterProps): ReactElement | null {
  const { messages } = useDataViewsRoot("Filters");
  const field = useFilterHandle(handle);
  const countId = useId();
  // Whether focus is inside the group, which keeps it while it is.
  const [holding, setHolding] = useState(false);
  const applied = field.applied.kind === "value" ? field.applied.value : null;
  if (!declared && applied === null && !holding) {
    return null;
  }
  const spelled = count === null ? null : spellCount(count, messages);
  return (
    <fieldset
      {...rest}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      onFocus={() => {
        setHolding(true);
        onHold(true);
      }}
      onBlur={(event) => {
        // Focus moving between the radios stays inside the group.
        if (event.currentTarget.contains(event.relatedTarget)) {
          return;
        }
        setHolding(false);
        onHold(false);
      }}
    >
      <legend className="legend">{label}</legend>
      {CHOICES.map((choice) => (
        <div key={String(choice.applied)} className="option">
          <label>
            <input
              type="radio"
              name={spellWireKey(fieldName, "isSet")}
              value={
                choice.applied === null
                  ? ""
                  : spellWireValues({
                      field: fieldName,
                      operator: "isSet",
                      operands: [choice.applied],
                    }).join("")
              }
              checked={applied === choice.applied}
              // Undeclared, the restriction may only be removed: the other
              // would be one the source never offered.
              disabled={
                !declared &&
                choice.applied !== null &&
                choice.applied !== applied
              }
              aria-describedby={
                choice.applied === true && spelled !== null
                  ? countId
                  : undefined
              }
              onChange={() => {
                if (choice.applied === null) {
                  // The group stays while focus is inside it, so a radio
                  // arrow keys reach keeps focus.
                  field.clear();
                  return;
                }
                field.set([choice.applied]);
              }}
            />
            {messages[choice.message]}
          </label>
          {choice.applied === true && spelled !== null ? (
            <span id={countId} className="count">
              {spelled}
            </span>
          ) : null}
        </div>
      ))}
    </fieldset>
  );
}
