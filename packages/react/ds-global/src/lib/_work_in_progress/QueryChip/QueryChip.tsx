import type React from "react";
import { useMemo } from "react";
import useRovingItem from "../../common/Roving/hooks/useRovingItem.js";
import { Icon } from "../../component/Icon/index.js";
import { useIsMounted } from "../../hooks/index.js";
import Context from "./common/Context.js";
import Entry from "./common/Entry/index.js";
import Segment from "./common/Segment/index.js";
import { DEFAULT_UNITY } from "./constants.js";
import type { QueryChipProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds query-chip";

/**
 * A query chip shows one clause of a query, such as a field, an operator and
 * a value, as parts that are read together and changed one at a time. Its
 * segments are solid parts the host can activate; its entry, when it has
 * one, is the part being typed. Unlike **Chip**, whose value is one piece of
 * text, each part of a query chip is its own target. It serves the clauses
 * of a query bar, the conditions of a saved view and the matchers of a rule.
 * It knows nothing about queries: its host composes its parts and hears
 * which one was activated.
 *
 * `import { QueryChip } from "@canonical/react-ds-global";`
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
  ...props
}: QueryChipProps): React.ReactElement => {
  const isMounted = useIsMounted();
  // The remove control's roving item; its presence says the chip is roving.
  const removeItem = useRovingItem({ id: `${id}:remove` });

  if (removeItem && id === undefined) {
    throw new Error("QueryChip: `id` is required inside a roving toolbar.");
  }

  const context = useMemo(
    () => ({ id, isMounted, disabled }),
    [id, isMounted, disabled],
  );
  const removeRoving = isMounted && removeItem;
  // A group, named by the whole clause, once its parts are roving items.
  const groupProps = removeRoving
    ? { role: "group", "aria-label": label }
    : undefined;
  const removeProps = {
    ...removeRoving,
    className: "remove",
    "aria-label": removeLabel,
    onClick: () => {
      if (removeRoving) removeRoving.onClick();
      onRemove?.();
    },
  };
  const removeIcon = <Icon icon="close" />;
  const renderRemove = () => {
    if (removeLabel === undefined) return null;
    if (removeHref !== undefined && !disabled) {
      return (
        <a {...removeProps} href={removeHref}>
          {removeIcon}
        </a>
      );
    }
    // Inert until scripts run: without an address, only a script removes.
    return (
      <button type="button" {...removeProps} disabled={disabled || !isMounted}>
        {removeIcon}
      </button>
    );
  };

  return (
    <span
      {...props}
      id={id}
      className={[componentCssClassName, criticality, unity, className]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="body" {...groupProps}>
        <Context.Provider value={context}>{children}</Context.Provider>
      </span>
      {renderRemove()}
    </span>
  );
};

QueryChip.Segment = Segment;
QueryChip.Entry = Entry;

export default QueryChip;
