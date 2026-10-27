// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  CardProjection,
  ProjectionsProvider,
  useProjectionMaps,
} from "@canonical/prism-projections";
import {
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  useCallback,
  useDeferredValue,
  useId,
  useRef,
  useState,
} from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import searchQuery, {
  type CommandPaletteSearchQuery,
} from "../../../__generated__/CommandPaletteSearchQuery.graphql.js";
import { useMessages } from "../../i18n/index.js";
import { CommandPaletteResult } from "../CommandPaletteResult/index.js";
import { CommandPaletteTitle } from "../CommandPaletteTitle/index.js";
import { ARROW_STEPS, SEARCH_PAGE_SIZE } from "./constants.js";
import groupResultsByType from "./groupResultsByType.js";
import type { CommandPaletteSearchProps } from "./types.js";
import "./styles.css";

/**
 * Whether `target`, where a pointer pressed or clicked, is a link or lies
 * inside one.
 */
const isWithinLink = (target: EventTarget): boolean =>
  target instanceof Element && target.closest("a") !== null;

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The search the palette runs: the graph's nodes whose text matches, best
 * first, each with what groups it (its type's title), what keys its option
 * (its IRI), and what its row and its card read. The root field is included
 * only while there is text to search for, so an empty field sends nothing.
 */
const declareSearchQuery = (): unknown => graphql`
  query CommandPaletteSearchQuery(
    $text: String!
    $first: Int!
    $searching: Boolean!
  ) {
    search(text: $text, first: $first) @include(if: $searching) {
      edges {
        node {
          __typename
          uri
          _meta {
            type {
              _meta {
                title
              }
            }
          }
          ...CommandPaletteResult_node
          ...CardProjection_node
        }
      }
    }
  }
`;
void declareSearchQuery;
/* v8 ignore stop */

const componentCssClassName = "ds command-palette-search";

/**
 * The palette's search: the field across the top, the results on the left
 * as the site's command rows grouped by type, and the highlighted result's
 * card on the right. It is the ARIA combobox pattern with a listbox popup:
 * the field is the combobox and keeps the focus; the arrow keys move the
 * highlighted option of the listbox it controls (`aria-activedescendant`),
 * wrapping at both ends; Enter chooses the highlighted result, opening its
 * home; a pointer moving over a result highlights it. Escape is the
 * dialog's. A pointer pressing a heading, a result or the status line
 * leaves the focus in the field, so the keys keep reaching it; a press in
 * the preview selects its text, as anywhere on the site, and a click there
 * that selects nothing gives the field the focus back.
 *
 * The field's text, trimmed, reaches the graph's search deferred: while the
 * next results load, the last ones stay on screen and the listbox is busy.
 * Each session of the palette searches afresh, so a failed search is
 * retried once the palette reopens.
 * An empty field sends no query and shows a one-line hint; a text nothing
 * matches shows one line naming it. Groups follow the ranking: a type's
 * group sits where its best result ranks, under the type's title.
 *
 * The rows render under the site's projection maps with the palette's inert
 * title as their link, since an option is chosen as a whole; the preview
 * renders under the site's own link, so its title links to the home, and
 * following a link in the preview chooses the result as its row does,
 * closing the palette.
 *
 * Native props reach the root `<div>`; a consumer `className` merges after
 * the search's own.
 *
 * `import { CommandPaletteSearch } from "../CommandPaletteSearch/index.js";`
 *
 * @implements prism.component.command_palette_search
 * @note Impure: fetches the search through Relay, reads the projection maps
 *   and the translator in scope, clicks and scrolls the highlighted
 *   option's element, prevents a pointer's press from moving the focus,
 *   focuses the field after a click in the preview, and tells the palette
 *   whether the highlighted result is disabled.
 */
export default function CommandPaletteSearch({
  onChoose,
  onHighlight,
  session,
  className,
  ...props
}: CommandPaletteSearchProps): ReactElement {
  const t = useMessages();
  const maps = useProjectionMaps();
  const listboxId = useId();
  const [text, setText] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const activeOption = useRef<HTMLLIElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const preview = useRef<HTMLElement>(null);
  const searched = useDeferredValue(text.trim());
  const data = useLazyLoadQuery<CommandPaletteSearchQuery>(
    searchQuery,
    { text: searched, first: SEARCH_PAGE_SIZE, searching: searched !== "" },
    { fetchKey: session },
  );
  const nodes = data.search?.edges.map(({ node }) => node) ?? [];
  const groups = groupResultsByType(nodes);
  const results = groups.flatMap((group) => group.results);
  const active = results.at(Math.min(highlighted, results.length - 1));
  const activeId =
    active === undefined ? undefined : `${listboxId}-${active.index}`;
  const listed = results.length > 0;

  /**
   * Hold the highlighted option's element, for Enter to choose, scroll it
   * into the results' view as the highlight reaches it, and tell the
   * palette whether it is disabled, as its result's row marks it.
   *
   * @note Impure: writes the ref, scrolls the results and calls the
   *   palette's handler.
   */
  const attachActiveOption = useCallback(
    (option: HTMLLIElement | null) => {
      activeOption.current = option;
      option?.scrollIntoView({ block: "nearest" });
      onHighlight(option?.getAttribute("aria-disabled") === "true");
    },
    [onHighlight],
  );

  /**
   * Take the field's new text, and highlight the first result again.
   *
   * @note Impure: sets the component's state.
   */
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setText(event.target.value);
    setHighlighted(0);
  };

  /**
   * Keep the focus in the field when a pointer presses a heading, an
   * option, the status line or the space between them: none of them takes
   * the focus, which would otherwise fall to the scrolling results or the
   * dialog and leave the arrow keys and the typing nowhere. A link keeps
   * its press, to be followed, and the preview keeps its own, which starts
   * a selection of its text.
   *
   * @note Impure: prevents the press's default action.
   */
  const handleBodyMouseDown = (event: MouseEvent<HTMLDivElement>): void => {
    const target = event.target;
    const inPreview =
      target instanceof Node && preview.current?.contains(target) === true;
    if (!inPreview && !isWithinLink(target)) event.preventDefault();
  };

  /**
   * Close the palette when the reader follows a link in the preview, by a
   * click or by Enter on it: the link opens the result's home, as choosing
   * its row does, and the palette must not stay open over the page it
   * opens. Any other click in the preview that leaves no text selected
   * gives the field back the focus its press took, so the keys reach the
   * field again; one that selected text leaves it, to be copied. The
   * browser collapses a selection a click lands in only once the click has
   * been dispatched, so the selection is read in the next task.
   *
   * @note Impure: calls the palette's handler, which closes it, schedules
   *   a task, reads the document's selection and moves the focus.
   */
  const handlePreviewClick = (event: MouseEvent<HTMLElement>): void => {
    if (isWithinLink(event.target)) {
      onChoose();
      return;
    }
    const { ownerDocument } = event.currentTarget;
    setTimeout(() => {
      if (ownerDocument.getSelection()?.isCollapsed !== false) {
        field.current?.focus();
      }
    });
  };

  /**
   * Move the highlight with the arrow keys, wrapping at both ends, and
   * choose the highlighted result with Enter. While an input method is
   * composing text, every key is the input method's: it may move through
   * its candidates with the arrows and commit one with Enter.
   *
   * @note Impure: sets the component's state, prevents the keys' default
   *   actions in the field, and clicks the highlighted option.
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.nativeEvent.isComposing) return;
    const step = ARROW_STEPS.get(event.key);
    if (step !== undefined && active !== undefined) {
      event.preventDefault();
      setHighlighted((active.index + step + results.length) % results.length);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      activeOption.current?.click();
    }
  };

  return (
    <div
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <input
        aria-activedescendant={activeId}
        aria-autocomplete="list"
        aria-controls={listed ? listboxId : undefined}
        aria-expanded={listed}
        aria-label={t("search.label")}
        autoComplete="off"
        className="query"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={t("search.placeholder")}
        ref={field}
        role="combobox"
        spellCheck={false}
        type="text"
        value={text}
      />
      {/* biome-ignore lint/a11y/noStaticElementInteractions: the body only keeps a pointer's press from taking the focus out of the field; the field is the control and takes the keys. */}
      <div className="body" onMouseDown={handleBodyMouseDown}>
        {listed ? (
          <ProjectionsProvider LinkComponent={CommandPaletteTitle} maps={maps}>
            <div
              aria-busy={searched !== text.trim()}
              aria-label={t("search.results")}
              className="results"
              id={listboxId}
              role="listbox"
              tabIndex={-1}
            >
              {groups.map((group, position) => {
                const headingId = `${listboxId}-group-${position}`;
                return (
                  // biome-ignore lint/a11y/useSemanticElements: a listbox groups its options with role="group", which a fieldset, a form control group, does not carry.
                  <ul
                    aria-labelledby={headingId}
                    className="group"
                    key={group.typename}
                    role="group"
                  >
                    <li className="heading" id={headingId} role="presentation">
                      {group.title}
                    </li>
                    {group.results.map(({ node, index }) => (
                      <CommandPaletteResult
                        aria-selected={index === active?.index}
                        id={`${listboxId}-${index}`}
                        key={node.uri}
                        node={node}
                        onChoose={onChoose}
                        onPointerMove={() => setHighlighted(index)}
                        ref={
                          index === active?.index
                            ? attachActiveOption
                            : undefined
                        }
                        role="option"
                      />
                    ))}
                  </ul>
                );
              })}
            </div>
          </ProjectionsProvider>
        ) : (
          <output className="status">
            {searched === ""
              ? t("search.hint")
              : t("search.empty", { text: searched })}
          </output>
        )}
        {active === undefined ? null : (
          // biome-ignore lint/a11y/useKeyWithClickEvents: the preview only hears the clicks its links bubble up, and Enter on a focused link fires one; the links take the keys.
          <section
            aria-label={t("search.preview")}
            className="preview"
            onClick={handlePreviewClick}
            ref={preview}
            tabIndex={-1}
          >
            <CardProjection node={active.node} />
          </section>
        )}
      </div>
    </div>
  );
}
