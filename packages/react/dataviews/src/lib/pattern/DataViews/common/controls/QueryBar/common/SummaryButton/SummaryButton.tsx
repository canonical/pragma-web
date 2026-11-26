import { Badge, Button } from "@canonical/react-ds-global";
import type { MouseEvent, ReactElement } from "react";
import { useDataViewsValue } from "../../../../../../../hooks/index.js";
import { useDataViewsRoot } from "../../../../../hooks/index.js";
import type { QueryStateStandIn } from "../../types.js";
import {
  countAppliedFilters,
  listChipClauses,
  runInvokerFallback,
  spellInvoker,
} from "../../utils/index.js";
import type { SummaryButtonProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds data-views-query-bar-summary-button";

/** How many filter chips apply, as the query state stands. */
const countApplied = (state: QueryStateStandIn): number =>
  countAppliedFilters(listChipClauses(state));

/**
 * The narrow bar's summary of its filters, "Filters" with a Badge
 * counting those that apply, which opens the sheet. A native button whose
 * invoker command shows the sheet's dialog modally, so it works from the
 * first paint, before scripts run. Its name carries the count the Badge
 * shows, "Filters, 2 applied", in one visually hidden span, and the
 * Badge is hidden from assistive technology, so the visible label stays a
 * prefix of the name. The count is read narrowly, so a commit
 * renders only this.
 */
export default function SummaryButton({
  sheetId,
  group,
  onShow,
  onClick,
  className,
  ...rest
}: SummaryButtonProps): ReactElement {
  const { messages } = useDataViewsRoot("QueryBar");
  const applied = useDataViewsValue(group.state, countApplied);
  const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
    onClick?.(event);
    // WebKit focuses no button it presses: focused, the summary is what
    // the dialog gives focus back to as it closes.
    event.currentTarget.focus({ preventScroll: true });
    onShow();
    runInvokerFallback(event);
  };
  return (
    <Button
      {...rest}
      {...spellInvoker("show-modal", sheetId)}
      type="button"
      importance="secondary"
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      onClick={handleClick}
    >
      {/* While filters apply, one hidden span carries the whole name, so no
          browser spaces its comma apart. */}
      {applied > 0 ? (
        <span aria-hidden="true">{messages.filters}</span>
      ) : (
        messages.filters
      )}
      {applied > 0 && (
        <span className="assistive">
          {messages.filters}, {messages.filtersApplied({ applied })}
        </span>
      )}
      {applied > 0 && <Badge value={applied} aria-hidden="true" />}
    </Button>
  );
}
