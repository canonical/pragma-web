import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "#relay/__generated__/ComponentChanges_node.graphql.js";
import { META_SEPARATOR } from "./constants.js";
import readDay from "./readDay.js";
import sortNewestFirst from "./sortNewestFirst.js";
import type { ComponentChangesProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields the list reads: each entry's version, summary, change text,
 * type and date.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment ComponentChanges_node on Component {
    changeLogs {
      version
      summary
      change
      changeType
      timestamp
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds component-changes";

/**
 * The content of a section of the component page, which carries the
 * heading: the component's change log, newest first. An entry shows its
 * version in monospace, its summary (its change text when it has no
 * summary), and a line with its type and its date; each only when the
 * graph records it.
 *
 * `import { ComponentChanges } from "../ComponentChanges/index.js";`
 *
 * @implements docs.subcomponent.component_changes
 * @note Impure: reads the component from the Relay store.
 */
export default function ComponentChanges({
  component,
  className,
  ...props
}: ComponentChangesProps): ReactElement {
  const { changeLogs } = useFragment(nodeFragment, component);
  return (
    <ol
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      {sortNewestFirst(changeLogs).map((entry) => {
        const text = entry.summary || entry.change;
        const type = entry.changeType;
        const date = entry.timestamp;
        return (
          // An entry carries no id; the key derives from its content, since
          // the list re-renders whole from the store.
          <li
            className="entry"
            key={`${entry.version ?? ""}:${date ?? ""}:${text ?? ""}`}
          >
            {entry.version ? (
              <span className="version">{entry.version}</span>
            ) : null}
            {text ? <p className="summary">{text}</p> : null}
            {type || date ? (
              <p className="meta">
                {type}
                {type && date ? META_SEPARATOR : null}
                {date ? <time dateTime={date}>{readDay(date)}</time> : null}
              </p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
