// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  CardProjection,
  ProjectionsProvider,
  useProjectionMaps,
} from "@canonical/prism-projections";
import {
  type ChangeEvent,
  type KeyboardEvent,
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
 * dialog's.
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
 * renders under the site's own link, so its title links to the home.
 *
 * Native props reach the root `<div>`; a consumer `className` merges after
 * the search's own.
 *
 * `import { CommandPaletteSearch } from "../CommandPaletteSearch/index.js";`
 *
 * @implements prism.component.command_palette_search
 * @note Impure: fetches the search through Relay, reads the projection maps
 *   and the translator in scope, and clicks and scrolls the highlighted
 *   option's element.
 */
export default function CommandPaletteSearch({
  onChoose,
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
   * Hold the highlighted option's element, for Enter to choose, and scroll
   * it into the results' view as the highlight reaches it.
   *
   * @note Impure: writes the ref and scrolls the results.
   */
  const attachActiveOption = useCallback((option: HTMLLIElement | null) => {
    activeOption.current = option;
    option?.scrollIntoView({ block: "nearest" });
  }, []);

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
   * Move the highlight with the arrow keys, wrapping at both ends, and
   * choose the highlighted result with Enter, unless an input method is
   * composing text.
   *
   * @note Impure: sets the component's state, prevents the keys' default
   *   actions in the field, and clicks the highlighted option.
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    const step = ARROW_STEPS[event.key];
    if (step !== undefined && active !== undefined) {
      event.preventDefault();
      setHighlighted((active.index + step + results.length) % results.length);
      return;
    }
    if (event.key === "Enter" && !event.nativeEvent.isComposing) {
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
        role="combobox"
        spellCheck={false}
        type="text"
        value={text}
      />
      <div className="body">
        {listed ? (
          <ProjectionsProvider LinkComponent={CommandPaletteTitle} maps={maps}>
            <div
              aria-busy={searched !== text.trim()}
              aria-label={t("search.results")}
              className="results"
              id={listboxId}
              role="listbox"
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
          <section aria-label={t("search.preview")} className="preview">
            <CardProjection node={active.node} />
          </section>
        )}
      </div>
    </div>
  );
}
