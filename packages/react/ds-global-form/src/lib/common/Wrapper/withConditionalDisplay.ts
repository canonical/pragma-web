import React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { ConditionalDisplayProps } from "../types.js";

/**
 * Adds the `condition` prop to a field component. The field renders only while
 * `condition(values)` returns `true`, re-evaluated whenever a form value
 * changes. A hidden field is not rendered, so it is not submitted. Without a
 * `condition` the field always renders.
 */
const withConditionalDisplay = <Props extends object>(
  WrappedComponent: React.ComponentType<Props>,
): React.ComponentType<Props & ConditionalDisplayProps> => {
  const ConditionalComponent = ({
    condition,
    ...props
  }: Props & ConditionalDisplayProps): React.ReactElement | null => {
    const { control, getValues } = useFormContext();
    // Re-render on every value change, but only when there is a predicate to
    // run, so unconditional fields are not re-rendered by unrelated edits.
    useWatch({ control, disabled: !condition });
    // Read the live values rather than the subscription's snapshot, which goes
    // stale while the subscription is disabled (a condition added after mount).
    if (condition && !condition(getValues())) return null;
    return React.createElement(WrappedComponent, props as Props);
  };
  return ConditionalComponent;
};

export default withConditionalDisplay;
