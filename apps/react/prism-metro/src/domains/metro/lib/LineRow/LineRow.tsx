// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { EntityRow, useProjectionLink } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import nodeFragment from "../../../../relay/__generated__/LineRow_node.graphql.js";
import type { LineRowProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields LineRow reads from the Line it renders: the stops it serves,
 * its name and its compact address.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment LineRow_node on Line {
    __typename
    servedBy {
      uri
    }
    _meta {
      title
      curie
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds line-row";

/**
 * A line as a 32px list entry: its name, linked to the line's page, and
 * the count of the stops it serves muted at the end.
 *
 * Native props reach the row's `<li>` root; a consumer `className` merges
 * after the projection's own, and the root carries the typename as
 * `data-type`.
 *
 * `import { LineRow } from "./lib/index.js";`
 *
 * @implements metro.component.line_row
 * @note Impure: reads its line from the Relay store, its home from the
 *   site's homes, its link from the projection provider and its words from
 *   the translator in scope.
 */
export default function LineRow({
  node,
  className,
  ...props
}: LineRowProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const href = useHome({ __typename: data.__typename, uri: data._meta.curie });
  const LinkComponent = useProjectionLink();
  const t = useMessages();
  return (
    <EntityRow
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      LinkComponent={LinkComponent}
      meta={t("line.stops.count", { count: data.servedBy.length })}
      title={data._meta.title}
    />
  );
}
