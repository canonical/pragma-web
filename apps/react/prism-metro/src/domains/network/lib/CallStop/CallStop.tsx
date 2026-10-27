// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { useProjectionLink } from "@canonical/prism-projections";
import type { CSSProperties, ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import nodeFragment from "#relay/__generated__/CallStop_node.graphql.js";
import type { CallStopProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields CallStop reads from the Call it renders: the stop it calls at,
 * whether that stop is an interchange and how long a transfer takes there,
 * and the lines serving it, for the others it meets.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment CallStop_node on Call {
    stop {
      __typename
      _meta {
        title
        curie
      }
      servesLine {
        uri
        code
        colour
        _meta {
          title
        }
      }
      ... on Interchange {
        transferMinutes
      }
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds call-stop";

/**
 * One call of a route as a door card reads it: a tick on the strip's rule
 * in the line's colour (a hollow ring at an interchange), the stop's name
 * linking to its home, the other lines it meets, each by its code beside a
 * swatch of its colour, and at an interchange the time a transfer takes.
 * Below two groups of columns it lays its tick beside its name.
 *
 * Native props reach the `<li>` root; a consumer `className` merges after
 * the projection's own.
 *
 * `import { CallStop } from "./CallStop/index.js";`
 *
 * @implements metro.component.call_stop
 * @note Impure: reads its call from the Relay store, the stop's home from
 *   the site's homes, its link from the projection provider and its words
 *   from the translator in scope.
 */
export default function CallStop({
  node,
  lineUri,
  colour,
  className,
  style,
  ...props
}: CallStopProps): ReactElement {
  const t = useMessages();
  const { stop } = useFragment(nodeFragment, node);
  const href = useHome({ __typename: stop.__typename, uri: stop._meta.curie });
  const LinkComponent = useProjectionLink();
  const connections = stop.servesLine.filter((line) => line.uri !== lineUri);
  return (
    <li
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={stop.__typename}
      style={{ ...style, "--call-stop-colour": colour } as CSSProperties}
    >
      <span
        aria-hidden="true"
        className={stop.__typename === "Interchange" ? "ring" : "tick"}
      />
      {href === undefined ? (
        <span className="name">{stop._meta.title}</span>
      ) : (
        <LinkComponent className="name" href={href}>
          {stop._meta.title}
        </LinkComponent>
      )}
      {connections.length > 0 ? (
        <ul className="connections">
          {connections.map((line) => (
            <li className="connection" key={line.uri}>
              <span
                aria-hidden="true"
                className="swatch"
                style={
                  {
                    "--call-stop-connection-colour": line.colour,
                  } as CSSProperties
                }
              />
              <abbr title={line._meta.title}>{line.code}</abbr>
            </li>
          ))}
        </ul>
      ) : null}
      {stop.transferMinutes === undefined ||
      stop.transferMinutes === null ? null : (
        <span className="transfer">
          {t("network.station.minutes", { minutes: stop.transferMinutes })}
        </span>
      )}
    </li>
  );
}
