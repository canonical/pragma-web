import type { QueryIssue } from "@canonical/dataviews-core";
import { readProviderHost } from "@canonical/dataviews-core/bindings";
import { memo, type ReactElement, useMemo } from "react";
import { QueryChip } from "../../../../../../../_work_in_progress/QueryChip/index.js";
import {
  useDataViewsValue,
  useIsHydrated,
} from "../../../../../../../hooks/index.js";
import { useDataViewsRoot } from "../../../../../hooks/index.js";
import type { QueryStateStandIn } from "../../types.js";
import {
  listChipClauses,
  nameRefused,
  readLabelsStandIn,
} from "../../utils/index.js";
import type { RefusedChipProps } from "./types.js";

/** Two readings of a refusal that say the same. */
const isSameIssue = (a: QueryIssue | null, b: QueryIssue | null): boolean =>
  a === b || JSON.stringify(a) === JSON.stringify(b);

/**
 * A filter or search a followed link carried and the source refused, as
 * a read-only chip in the error tone: named by its field, or as the
 * search, with the reason as its description, and a clear control that
 * removes that one parameter. It holds no part to edit, so its clear
 * control is its one toolbar item. Without a location there is no
 * parameter to remove, and no clear control. It reads its own refusal
 * from the query state, so a link that refuses the same parameter for
 * another reason shows that reason.
 */
const RefusedChip = ({
  clause,
  group,
  onClear,
}: RefusedChipProps): ReactElement | null => {
  const { provider, messages } = useDataViewsRoot("QueryBar");
  const read = useMemo(
    () =>
      (state: QueryStateStandIn): QueryIssue | null => {
        const found = listChipClauses(state).find(({ id }) => id === clause.id);
        return found?.kind === "refused" ? found.issue : null;
      },
    [clause.id],
  );
  const issue = useDataViewsValue(group.state, read, isSameIssue);
  const hydrated = useIsHydrated();
  // A refusal cleared reads nothing until the bar drops its chip.
  if (issue === null) return null;
  const name = nameRefused(issue, readLabelsStandIn(), messages);
  const { location } = readProviderHost(provider);
  // Before scripts, clearing is a link to the address less the parameter.
  const cleared = hydrated || location === null ? null : location.read();
  const href = cleared === null ? null : new URLSearchParams(cleared);
  href?.delete(issue.parameter);
  const clearProps =
    location === null
      ? {}
      : {
          onRemove: () => onClear(clause),
          removeLabel: messages.clearFilter(name),
          ...(href === null ? {} : { removeHref: `?${href.toString()}` }),
        };
  return (
    <QueryChip id={clause.id} label={name} criticality="error" {...clearProps}>
      <QueryChip.Segment
        data-part="field"
        description={messages.clauseRefused(name, issue.reason)}
      >
        {name}
      </QueryChip.Segment>
    </QueryChip>
  );
};

export default memo(RefusedChip);
