import { Badge, Button } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import { withDropdownButtonStandIn as withDropdownButton } from "../../common/withDropdownButtonStandIn/index.js";
import Context from "./common/Context.js";
import { Panel } from "./common/Panel/index.js";
import type { FilterButtonProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds filter-button";

/** The trigger: Button, with the dropdown's chevron and panel, made once. */
const FilterTrigger = withDropdownButton(Button, (props) => (
  <Panel {...props} />
));

/**
 * A filter button opens the controls of one filter and shows whether that
 * filter applies, and how many values it holds. Unlike **DropdownButton**,
 * its purpose is filtering, and it carries an applied state. Unlike
 * **Chip**, it opens a filter's controls rather than standing for an applied
 * value. It serves the few filters people use most beside a search or a
 * query bar, such as status, tags or pool.
 *
 * `import { FilterButton } from "@canonical/dataviews-react";`
 *
 * @implements ds:global_dataviews.component.filter_button
 */
export default function FilterButton({
  label,
  condition,
  applied = 0,
  appliedLabel,
  children,
  onToggle,
  panelRef,
  className,
  ...props
}: FilterButtonProps): ReactElement {
  // The face is neutral: an anticipation that reaches it is dropped.
  const { anticipation: _anticipation, ...triggerProps } =
    props as typeof props & {
      anticipation?: unknown;
    };
  const isApplied = applied > 0;
  if (isApplied && !appliedLabel) {
    throw new Error(
      "FilterButton: `appliedLabel` is required while `applied` is above 0.",
    );
  }

  return (
    <Context.Provider value={{ children, onToggle, panelRef }}>
      <FilterTrigger
        {...triggerProps}
        importance="tertiary"
        className={[componentCssClassName, className].filter(Boolean).join(" ")}
      >
        {/* While applied, one hidden span carries the whole name, so no
            browser spaces its comma apart. */}
        {isApplied ? <span aria-hidden="true">{label}</span> : label}
        {isApplied && condition && (
          <span
            className="mark"
            data-condition={condition}
            aria-hidden="true"
          />
        )}
        {isApplied && (
          <span className="assistive">
            {label}, {appliedLabel}
          </span>
        )}
        {isApplied && <Badge value={applied} aria-hidden="true" />}
      </FilterTrigger>
    </Context.Provider>
  );
}
