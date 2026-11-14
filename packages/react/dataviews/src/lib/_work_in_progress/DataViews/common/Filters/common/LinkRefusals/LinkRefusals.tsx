import type { DataViewsMessages, QueryIssue } from "@canonical/dataviews-core";
import {
  isNarrowingIssue,
  QUERY_KEYS,
} from "@canonical/dataviews-core/bindings";
import { Button } from "@canonical/react-ds-global";
import { type ReactElement, useId, useLayoutEffect, useRef } from "react";
import { useIsHydrated } from "../../../../../../hooks/index.js";
import { useDataViewsRoot } from "../../../../hooks/index.js";
import type { LinkRefusalsProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds data-views-filters-link-refusals";

/**
 * The name a refused parameter that is not a filter is read by: the words
 * its control reads, and a grouping by the fields the link grouped by.
 */
const nameParameter = (
  parameter: string,
  messages: DataViewsMessages,
  nameGrouping: () => string,
): string => {
  switch (parameter) {
    case QUERY_KEYS.search:
      return messages.search;
    case QUERY_KEYS.sort:
      return messages.sortPanel;
    case QUERY_KEYS.page:
    case QUERY_KEYS.cursor:
      return messages.page;
    case QUERY_KEYS.size:
      return messages.rowsPerPage;
    default:
      return nameGrouping();
  }
};

/**
 * One refused clause's key, among the others the link carried: spelled so
 * it survives as an attribute value, which the server's markup carries to
 * the button replacing the link.
 */
const spellClauseKey = (issue: QueryIssue): string =>
  JSON.stringify([issue.parameter, issue.code, issue.reason]);

/** Where clearing one parameter leads without scripts: the URL less it. */
const spellClearDestination = (
  params: URLSearchParams,
  parameter: string,
): string => {
  const next = new URLSearchParams(params);
  next.delete(parameter);
  const query = next.toString();
  return query === "" ? "?" : `?${query}`;
};

/**
 * The clauses a followed link carried and the provider refused, each with
 * its reason: what the link asked for and did not get. A refused filter or
 * search withheld the query, so where the location still carries it, it has
 * a Clear control, which removes that one parameter; any other refused
 * parameter fell back to its default and is listed only.
 *
 * Before scripts run, each Clear is a real link to the URL without that
 * parameter; once they do, it is a button doing the same, and a link that
 * held the focus hands it to its button. After a clear, focus moves to the
 * next Clear, or the one before, or to the filters' group once none is
 * left. The list is named by its label, a place: "Not applied from the
 * link".
 *
 * `import { DataViews } from "@canonical/dataviews-react";`
 *
 * @implements ds:apps.subcomponent.data_views_filters-link_refusals
 */
export default function LinkRefusals({
  issues,
  nameField,
  params,
  onClear,
  focusGroup,
  className,
  ...rest
}: LinkRefusalsProps): ReactElement | null {
  const { messages } = useDataViewsRoot("Filters");
  const hydrated = useIsHydrated();
  const labelId = useId();
  const root = useRef<HTMLDivElement>(null);
  // Each Clear on screen, by the clause it clears, so focus can be handed
  // to the one beside a clause that was cleared.
  const controls = useRef(new Map<string, HTMLElement>());
  // The clause whose Clear takes focus once the list redraws, or null for
  // the group; undefined while no clear is waiting to hand focus on.
  const handoff = useRef<string | null | undefined>(undefined);
  // The clause whose link held the focus as scripts took over: its button
  // takes that focus, or the reader who tabbed to it is left on nothing.
  const handedFocus = useRef<string | null>(null);

  useLayoutEffect(() => {
    if (!hydrated) {
      handedFocus.current =
        root.current
          ?.querySelector("a[data-control]:focus")
          ?.getAttribute("data-control") ?? null;
      return;
    }
    const key = handedFocus.current;
    handedFocus.current = null;
    // Matched by value, not a selector built from a parameter's name.
    for (const [clause, control] of controls.current) {
      if (clause === key) {
        control.focus();
      }
    }
  }, [hydrated]);

  useLayoutEffect(() => {
    const key = handoff.current;
    if (key === undefined) {
      return;
    }
    handoff.current = undefined;
    const target = key === null ? undefined : controls.current.get(key);
    if (target === undefined) {
      focusGroup();
    } else {
      target.focus();
    }
  });

  if (issues.length === 0) {
    return null;
  }

  // Where each clause's Clear leads: the URL less its parameter, for a
  // clause that withheld the query and that the location still carries.
  const destinations = new Map<QueryIssue, string>();
  for (const issue of issues) {
    if (
      params !== null &&
      isNarrowingIssue(issue) &&
      params.has(issue.parameter)
    ) {
      destinations.set(issue, spellClearDestination(params, issue.parameter));
    }
  }
  const offered = [...destinations.keys()];
  const clear = (issue: QueryIssue): void => {
    const at = offered.indexOf(issue);
    const neighbour =
      offered.at(at + 1) ?? (at > 0 ? offered.at(at - 1) : undefined);
    handoff.current =
      neighbour === undefined ? null : spellClauseKey(neighbour);
    onClear(issue);
  };
  const nameGrouping = (): string => {
    const grouped = params?.getAll(QUERY_KEYS.group) ?? [];
    return grouped.length === 0
      ? messages.grouping
      : grouped.map((field) => nameField(field)).join(", ");
  };

  return (
    <div
      {...rest}
      ref={root}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <p id={labelId} className="label">
        {messages.linkRefusals}
      </p>
      <ul className="list" aria-labelledby={labelId}>
        {issues.map((issue) => {
          const name =
            issue.field === null
              ? nameParameter(issue.parameter, messages, nameGrouping)
              : nameField(issue.field);
          const key = spellClauseKey(issue);
          const destination = destinations.get(issue);
          return (
            <li key={key}>
              <span className="reason">
                {messages.clauseRefused(name, issue.reason)}
              </span>
              {destination !== undefined && hydrated ? (
                <Button
                  ref={(element: HTMLButtonElement | null) => {
                    if (element === null) {
                      controls.current.delete(key);
                    } else {
                      controls.current.set(key, element);
                    }
                  }}
                  type="button"
                  importance="tertiary"
                  className="clear"
                  data-control={key}
                  onClick={() => {
                    clear(issue);
                  }}
                >
                  {messages.clearFilter(name)}
                </Button>
              ) : null}
              {destination !== undefined && !hydrated ? (
                <a className="clear" data-control={key} href={destination}>
                  {messages.clearFilter(name)}
                </a>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
