import { listOfferedOperators } from "@canonical/dataviews-core/bindings";
import type { ReactElement } from "react";
import { useId } from "react";
import { useDataViewsRoot } from "../../../../../../hooks/index.js";
import { TypedInput } from "../TypedInput/index.js";
import type { BoundsPanelProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds data-views-quick-filter-bounds";

/** The two bounds, lower first. */
const BOUNDS = ["gte", "lte"] as const;

/**
 * A number's or a date's panel: an input for the lower bound and one for
 * the upper, where the source offers each, committing on Enter or on
 * leaving it. A number is typed
 * in any of its display units, which a hint names for both inputs.
 */
export default function BoundsPanel({
  definition,
  label,
  conjuncts,
  group,
  named,
  onCommit,
  onInvalid,
}: BoundsPanelProps): ReactElement {
  const { provider, messages } = useDataViewsRoot("QueryBar");
  // Only the bounds the source offers on the field have an input.
  const offered = listOfferedOperators(definition, provider.capabilities);
  const hintId = useId();
  // How a number is typed, where it takes units: said once, for both.
  const units = definition.kind === "number" ? definition.units : undefined;
  const hint =
    units === undefined
      ? null
      : messages.numberFormat(units.display.map(({ symbol }) => symbol));
  return (
    <div className={componentCssClassName}>
      {hint !== null && (
        <p id={hintId} className="hint">
          {hint}
        </p>
      )}
      {BOUNDS.filter((bound) => offered.includes(bound)).map((bound) => (
        <TypedInput
          key={bound}
          definition={definition}
          operator={bound}
          label={
            bound === "gte"
              ? messages.filterFrom(label)
              : messages.filterTo(label)
          }
          standing={conjuncts.find(
            ({ ref }) => ref.operator === bound && ref.nth === 0,
          )}
          hintId={hint === null ? undefined : hintId}
          group={group}
          named={named}
          onCommit={onCommit}
          onInvalid={onInvalid}
        />
      ))}
    </div>
  );
}
