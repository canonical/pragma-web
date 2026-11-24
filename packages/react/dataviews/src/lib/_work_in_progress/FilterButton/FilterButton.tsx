import { Badge, Button, Icon } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import { useId, useState } from "react";
import { AssistiveText, ConditionMark } from "../../common/index.js";
import { useIsHydrated } from "../../hooks/index.js";
import { Panel } from "./common/Panel/index.js";
import type { FilterButtonProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds filter-button";

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
 *
 * @experimental Its block is a draft; the component may change.
 */
export default function FilterButton({
  label,
  condition,
  applied = 0,
  appliedLabel,
  children,
  onToggle,
  panelRef,
  id,
  type,
  style,
  className,
  ...props
}: FilterButtonProps): ReactElement {
  // The face is neutral: an anticipation that reaches it is dropped.
  const { anticipation: _anticipation, ...triggerProps } =
    props as typeof props & {
      anticipation?: unknown;
    };
  const generatedId = useId();
  const panelId = useId();
  const triggerId = id ?? generatedId;
  const isHydrated = useIsHydrated();
  const [isOpen, setOpen] = useState(false);
  // A root's identifierPrefix can put characters into the id that a CSS
  // ident cannot hold.
  const anchorName = `--${panelId.replace(/[^\w-]/g, "_")}`;
  const isApplied = applied > 0;
  if (isApplied && !appliedLabel) {
    throw new Error(
      "FilterButton: `appliedLabel` is required while `applied` is above 0.",
    );
  }

  return (
    <>
      <Button
        {...triggerProps}
        // A `type` passed as undefined still renders a plain button.
        type={type ?? "button"}
        id={triggerId}
        importance="tertiary"
        className={[componentCssClassName, className].filter(Boolean).join(" ")}
        popoverTarget={panelId}
        // The anchor name is set last, so the panel is always placed by it.
        style={{ ...style, anchorName }}
        aria-haspopup={isHydrated ? "dialog" : undefined}
        aria-expanded={isHydrated ? isOpen : undefined}
        aria-controls={isHydrated ? panelId : undefined}
      >
        {/* While applied, one hidden span carries the whole name, so no
            browser spaces its comma apart. */}
        {isApplied ? <span aria-hidden="true">{label}</span> : label}
        {isApplied && condition && (
          <ConditionMark className="mark" condition={condition} />
        )}
        {isApplied && (
          <AssistiveText>
            {label}, {appliedLabel}
          </AssistiveText>
        )}
        {isApplied && <Badge value={applied} aria-hidden="true" />}
        <span className="chevron">
          <Icon icon="chevron-down" />
        </span>
      </Button>
      <Panel
        id={panelId}
        triggerId={triggerId}
        anchorName={anchorName}
        onOpenChange={setOpen}
        handleRef={panelRef}
        onToggle={onToggle}
      >
        {children}
      </Panel>
    </>
  );
}
