// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import {
  EntityCommand,
  SwatchMark,
  useProjectionLink,
} from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import nodeFragment from "#relay/__generated__/LineCommand_node.graphql.js";
import type { LineCommandProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields LineCommand reads from the Line it renders: what its slots
 * show, and its compact address, which its home is resolved from.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment LineCommand_node on Line {
    __typename
    colour
    servedBy {
      uri
    }
    _meta {
      title
      curie
      type {
        _meta {
          title
        }
      }
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds line-command";

/**
 * A line as a command-palette entry: its mark and its name, linked
 * to its home, then its compact address, its kind and its stop count, its
 * one figure, in the status. The address states its namespace, so it
 * shows no prefix.
 * Its mark is a disc of the line's colour (`SwatchMark`), which the
 * package paints only with a plain colour value.
 *
 * Native props reach the entry's `<li>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { LineCommand } from "#domains/metro";`
 *
 * @implements metro.component.line_command
 * @note Impure: reads its line from the Relay store, its home from the
 *   site's homes, and its link from the
 *   projection providers, and its words from the translator in scope.
 */
export default function LineCommand({
  node,
  className,
  ...props
}: LineCommandProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const t = useMessages();
  return (
    <EntityCommand
      {...props}
      address={curie}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      kind={data._meta.type._meta.title}
      LinkComponent={LinkComponent}
      mark={<SwatchMark colour={data.colour} />}
      status={t("line.stops.count", { count: data.servedBy.length })}
      title={title}
    />
  );
}
