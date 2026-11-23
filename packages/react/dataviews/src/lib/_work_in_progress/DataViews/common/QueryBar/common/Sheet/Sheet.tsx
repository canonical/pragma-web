import type { QueryIssue } from "@canonical/dataviews-core";
import { readProviderHost } from "@canonical/dataviews-core/bindings";
import { Button } from "@canonical/react-ds-global";
import {
  type ReactElement,
  type SyntheticEvent,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Announcer } from "../../../../../../common/index.js";
import {
  useDataViewsValue,
  useIsHydrated,
} from "../../../../../../hooks/index.js";
import { QueryChips } from "../../../../../QueryChips/index.js";
import Context from "../../../../Context.js";
import { useDataViewsRoot } from "../../../../hooks/index.js";
import { Filters } from "../../../Filters/index.js";
import {
  useAnnounceOutcome,
  useAnswerCountStandIn,
} from "../../hooks/index.js";
import type { QueryClause } from "../../types.js";
import {
  findFirstControl,
  listChipClauses,
  readLabelsStandIn,
  runInvokerFallback,
  speakChip,
  spellInvoker,
} from "../../utils/index.js";
import { SheetChip } from "./common/SheetChip/index.js";
import type { SheetProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds data-views-query-bar-sheet";

/** Where focus goes once the chips show what a commit left. */
type FocusTarget =
  | { readonly kind: "removed"; readonly index: number }
  | { readonly kind: "filters" };

/**
 * Run a write with a flag raised, and lower it however the write ends: how
 * the sheet tells its own commits from those made inside it.
 */
const writeFlagged = <TResult,>(
  flag: { current: boolean },
  write: () => TResult,
): TResult => {
  flag.current = true;
  try {
    return write();
  } finally {
    flag.current = false;
  }
};

/** Two readings of the chips that say the same. */
const isSameChips = (
  a: readonly QueryClause[],
  b: readonly QueryClause[],
): boolean => JSON.stringify(a) === JSON.stringify(b);

/**
 * The query bar's narrow form: the full-screen sheet its summary button
 * opens, a native modal dialog labelled by its title. It lists the clauses
 * that apply, each removable, and holds the full filters form; its footer
 * clears every filter, keeping the search, and closes it on a button that
 * reads the live result count. It keeps no state of its own: every control
 * commits as it changes, the results behind it update, and closing it,
 * by its close button, that footer button, Escape or the back gesture,
 * commits nothing and adds no history entry. While it is open, the bar's
 * announcements, and those of every part inside it, go to its own atomic
 * status region, since the page behind it is inert. Its body renders while
 * it is open once scripts run, and always before they do.
 */
export default function Sheet({
  id,
  group,
  isOpen,
  onOpenChange,
  regionRef,
  announce,
  className,
  onClose,
  ...rest
}: SheetProps): ReactElement {
  const root = useDataViewsRoot("QueryBar");
  const { provider, messages } = root;
  const { schema } = provider.collection;
  const labels = readLabelsStandIn();
  const hydrated = useIsHydrated();
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const chips = useDataViewsValue(group.state, listChipClauses, isSameChips);
  const count = useAnswerCountStandIn({ provider });
  const announceOutcome = useAnnounceOutcome({ provider, announce });
  // Whether the sheet is writing a commit of its own, which says its own
  // outcome; any other commit made inside it, as the filters form's, says
  // the results it brings.
  const ownRef = useRef(false);
  const [focusTarget, setFocusTarget] = useState<FocusTarget | null>(null);
  // Every part inside speaks through the sheet's region while it is open.
  const context = useMemo(() => ({ ...root, announce }), [root, announce]);

  // A dialog opened before scripts ran is open as they take over.
  // @note Impure: reads the dialog's open state.
  useLayoutEffect(() => {
    if (dialogRef.current?.open) onOpenChange(true);
  }, [onOpenChange]);

  // While open, a commit the sheet did not write itself, as the filters
  // form's, says the count it brings, coalesced with the next.
  // @note Impure: subscribes to the query state.
  const { recordNoun } = labels;
  useEffect(() => {
    if (!isOpen || !hydrated) return;
    let { slice } = group.state.get();
    return group.state.subscribe(() => {
      const next = group.state.get().slice;
      if (next === slice) return;
      slice = next;
      if (ownRef.current) return;
      announceOutcome((counted) =>
        messages.resultsUpdated({ count: counted, noun: recordNoun }),
      );
    });
  }, [isOpen, hydrated, group, announceOutcome, messages, recordNoun]);

  /** Write a commit of the sheet's own, which says its own outcome. */
  const writeOwn = <TResult,>(write: () => TResult): TResult =>
    writeFlagged(ownRef, write);

  // Once the chips show what a commit left, focus moves on: after a
  // removal, to the next chip's remove control, else the previous one's,
  // else the first filters control; after Clear all, to that control.
  // @note Impure: moves focus.
  useEffect(() => {
    const body = bodyRef.current;
    if (focusTarget === null || body === null) return;
    setFocusTarget(null);
    const removes = [...body.querySelectorAll<HTMLElement>(".chips .remove")];
    const chip =
      focusTarget.kind === "removed"
        ? (removes.at(focusTarget.index) ?? removes.at(focusTarget.index - 1))
        : undefined;
    const filters = body.querySelector(".filters");
    (chip ?? (filters && findFirstControl(filters)))?.focus();
  }, [focusTarget]);

  /** Say why the source refused a command, and that what applied stands. */
  const announceRefusals = (reasons: readonly string[]): void => {
    announce(messages.filterRefused(reasons, true));
  };

  /** Remove a chip's clause, and move focus on from where it stood. */
  const remove = (clause: QueryClause): void => {
    const index = chips.findIndex(({ id: chip }) => chip === clause.id);
    const spoken = speakChip(clause, schema, labels, messages);
    const refusals = writeOwn(() => removeClause(clause));
    if (refusals.length > 0) {
      announceRefusals(refusals);
      return;
    }
    announceOutcome((counted) =>
      messages.clauseRemoved(spoken, counted, labels.recordNoun),
    );
    setFocusTarget({ kind: "removed", index });
  };

  /** The write that removes a clause, answering the reasons it was refused. */
  function removeClause(clause: QueryClause): readonly string[] {
    const reasons = (refusals: readonly { readonly reason: string }[]) =>
      refusals.map(({ reason }) => reason);
    switch (clause.kind) {
      case "predicate":
        return reasons(group.removePredicate(clause.refs[0]));
      case "range":
        return reasons(
          group.editPredicates({ remove: [...clause.refs], add: [] }),
        );
      case "search":
        return reasons(group.setSearch(""));
      case "refused":
        clearRefused(clause.issue);
        return [];
    }
  }

  /** Clear a refused parameter the link carried. */
  function clearRefused(issue: QueryIssue): void {
    readProviderHost(provider).clearRefused(issue.parameter);
  }

  /** Clear every filter, the search kept, and move focus to the filters. */
  const clearAll = (): void => {
    const refusals = writeOwn(() => group.clear(["filter"]));
    if (refusals.length > 0) {
      announceRefusals(refusals.map(({ reason }) => reason));
      return;
    }
    announceOutcome((counted) =>
      messages.filtersCleared({ count: counted, noun: labels.recordNoun }),
    );
    setFocusTarget({ kind: "filters" });
  };

  const handleClose = (event: SyntheticEvent<HTMLDialogElement>): void => {
    onClose?.(event);
    onOpenChange(false);
  };

  const isBodyShown = isOpen || !hydrated;
  return (
    <dialog
      {...rest}
      ref={dialogRef}
      id={id}
      aria-labelledby={titleId}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      onClose={handleClose}
    >
      <Context value={context}>
        {/* The modal surface, on the frame, so no rule for a Modal's own
            box reaches the full-screen dialog. */}
        <div className="frame modal">
          <header className="header">
            <h2 id={titleId} className="title">
              {messages.filterSheet({ noun: labels.recordNoun })}
            </h2>
            <Button
              {...spellInvoker("close", id)}
              type="button"
              importance="tertiary"
              icon="close"
              aria-label={messages.closeFilters}
              onClick={runInvokerFallback}
            />
          </header>
          {isBodyShown && (
            <div ref={bodyRef} className="body">
              {chips.length > 0 && (
                <QueryChips className="chips" label={messages.appliedFilters}>
                  {chips.map((clause) => (
                    <SheetChip
                      key={clause.id}
                      clause={clause}
                      onRemove={remove}
                    />
                  ))}
                </QueryChips>
              )}
              {hydrated && <Filters className="filters" />}
            </div>
          )}
          {isBodyShown && (
            <footer className="footer">
              {hydrated && (
                <Button type="button" importance="tertiary" onClick={clearAll}>
                  {messages.clearAllFilters}
                </Button>
              )}
              <Button
                {...spellInvoker("close", id)}
                type="button"
                importance="primary"
                className="results"
                onClick={runInvokerFallback}
              >
                {messages.showResults({ count })}
              </Button>
            </footer>
          )}
          {hydrated && isOpen && <Announcer ref={regionRef} atomic />}
        </div>
      </Context>
    </dialog>
  );
}
