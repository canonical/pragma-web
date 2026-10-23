// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { EntityRow, useProjectionLink } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import nodeFragment from "../../../../relay/__generated__/InterchangeRow_node.graphql.js";
import type { InterchangeRowProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields InterchangeRow reads from the Interchange it renders: its name
 * and its compact address.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment InterchangeRow_node on Interchange {
    __typename
    _meta {
      title
      curie
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds interchange-row";

/**
 * An interchange as a 32px list entry: its name, linked to the
 * interchange's page, and the word "interchange" muted at the end, which
 * sets it apart from the stations it is listed with.
 *
 * Native props reach the row's `<li>` root; a consumer `className` merges
 * after the projection's own, and the root carries the typename as
 * `data-type`.
 *
 * `import { InterchangeRow } from "./lib/index.js";`
 *
 * @implements metro.component.interchange_row
 * @note Impure: reads its interchange from the Relay store, its home from
 *   the site's homes, its link from the projection provider and its words
 *   from the translator in scope.
 */
export default function InterchangeRow({
  node,
  className,
  ...props
}: InterchangeRowProps): ReactElement {
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
      meta={t("interchange.word")}
      title={data._meta.title}
    />
  );
}
