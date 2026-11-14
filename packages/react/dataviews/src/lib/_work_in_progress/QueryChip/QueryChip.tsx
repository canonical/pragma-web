import { Icon } from "@canonical/react-ds-global";
import type React from "react";
import Context from "./common/Context.js";
import { Entry, Segment } from "./common/index.js";
import { DEFAULT_UNITY } from "./constants.js";
import { useQueryChip } from "./hooks/index.js";
import type { QueryChipProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds query-chip";

/**
 * A query chip shows one clause as a row of parts that are read together and
 * changed one at a time, such as a field, an operator and a value. Its parts
 * are its children: a **QueryChip.Segment** for each settled part, and at
 * most one **QueryChip.Entry** for the part being typed. Unlike **Chip**,
 * whose value is one piece of text and whose action is filtering or
 * dismissal, each part of a query chip can be chosen and changed on its own.
 * It serves the clauses of a query bar, the conditions of a saved view and
 * the matchers of a rule. It knows nothing about queries: its host composes
 * the parts and hears which one was activated.
 *
 * `import { QueryChip } from "@canonical/dataviews-react";`
 *
 * @implements ds:global_dataviews.component.query_chip
 */
const QueryChip = ({
  children,
  id,
  label,
  criticality,
  unity = DEFAULT_UNITY,
  disabled = false,
  onRemove,
  removeHref,
  removeLabel,
  className,
  ref,
  ...props
}: QueryChipProps): React.ReactElement => {
  const {
    parts,
    descriptions,
    groupProps,
    removeProps,
    isRemoveLink,
    isRemoveInert,
    rootRef,
  } = useQueryChip({
    ref,
    children,
    id,
    label,
    criticality,
    disabled,
    onRemove,
    removeHref,
    removeLabel,
  });
  const removeIcon = <Icon icon="close" />;

  return (
    <span
      {...props}
      ref={rootRef}
      id={id}
      data-disabled={disabled || undefined}
      className={[componentCssClassName, criticality, unity, className]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="body" {...groupProps}>
        {parts.map((part) => (
          <Context.Provider key={part.key} value={part.context}>
            {part.node}
          </Context.Provider>
        ))}
        {/* A plain-text Segment's description, after the last part, so the
            clause reads whole first: hidden while a reference speaks it,
            read inline while nothing does. */}
        {descriptions.map((description) => (
          <span
            key={description.key}
            id={description.id}
            {...(description.isReferenced
              ? { hidden: true }
              : { className: "assistive" })}
          >
            {description.text}
          </span>
        ))}
      </span>
      {removeLabel !== undefined &&
        (isRemoveLink ? (
          <a {...removeProps} href={removeHref}>
            {removeIcon}
          </a>
        ) : (
          // Inert until scripts run: without an address, only a script
          // removes.
          <button type="button" {...removeProps} disabled={isRemoveInert}>
            {removeIcon}
          </button>
        ))}
    </span>
  );
};

QueryChip.Segment = Segment;
QueryChip.Entry = Entry;

export default QueryChip;
