import {
  listOfferedOperators,
  spellWireKey,
  spellWireValues,
} from "@canonical/dataviews-core/bindings";
import { RadioInput } from "@canonical/react-ds-global-form";
import type { ReactElement } from "react";
import { useId } from "react";
import { useIsHydrated } from "../../../../../../../../hooks/index.js";
import { useDataViewsRoot } from "../../../../../../hooks/index.js";
import type { PresencePanelProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds data-views-quick-filter-presence";

/**
 * The three choices, in order: no restriction, records that hold a value,
 * records that hold none, each with the operand it applies.
 */
const CHOICES = [
  { applied: null, message: "presenceAny" },
  { applied: true, message: "presenceSet" },
  { applied: false, message: "presenceUnset" },
] as const;

/**
 * A presence's panel: a group of three radios, any record, records that
 * hold a value, and records that hold none. Choosing one commits it at
 * once, one transition; Any removes the field's presence clause. Arrow keys
 * move within the group natively, choosing each radio they reach.
 */
export default function PresencePanel({
  definition,
  label,
  conjuncts,
  group,
  named,
  onCommit,
}: PresencePanelProps): ReactElement {
  const { provider, messages } = useDataViewsRoot("QueryBar");
  const { field } = definition;
  const hydrated = useIsHydrated();
  // Radios group by their name: without the wire's, a name of the panel's
  // own, once scripts run, so the arrow keys move within the group.
  const groupName = useId();
  const standing = conjuncts.find(
    ({ ref }) => ref.operator === "isSet" && ref.nth === 0,
  );
  const applied =
    standing === undefined ? null : standing.predicate.operands.at(0) !== false;

  /** Replace the presence clause with the choice's, or none, in one edit. */
  const choose = (choice: boolean | null): void => {
    onCommit(
      group.editPredicates({
        remove: standing === undefined ? [] : [standing.ref],
        add:
          choice === null
            ? []
            : [{ field, operator: "isSet", operands: [choice] }],
      }),
    );
  };

  // A source that offers no presence clause leaves nothing to choose.
  if (
    !listOfferedOperators(definition, provider.capabilities).includes("isSet")
  ) {
    return <p className={componentCssClassName}>{messages.optionsNone}</p>;
  }

  return (
    <fieldset className={componentCssClassName}>
      <legend className="legend">{label}</legend>
      {CHOICES.map((choice) => (
        // biome-ignore lint/a11y/noLabelWithoutControl: the label wraps RadioInput, a native radio the rule cannot see through
        <label key={String(choice.applied)} className="option">
          <RadioInput
            {...(named
              ? {
                  name: spellWireKey(field, "isSet"),
                  value:
                    choice.applied === null
                      ? ""
                      : spellWireValues({
                          field,
                          operator: "isSet",
                          operands: [choice.applied],
                        }).join(""),
                }
              : hydrated
                ? { name: groupName }
                : {})}
            checked={applied === choice.applied}
            // Once scripts run, only the checked radio takes Tab, so opening
            // the panel lands on it; the arrow keys still reach the others.
            // Before, the browser roves the named group itself, and a radio
            // an arrow key checks must keep its place in the Tab order.
            tabIndex={hydrated && applied !== choice.applied ? -1 : undefined}
            onChange={() => choose(choice.applied)}
          />
          {messages[choice.message]}
        </label>
      ))}
    </fieldset>
  );
}
