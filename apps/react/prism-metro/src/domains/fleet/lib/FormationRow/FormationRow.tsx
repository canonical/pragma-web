// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { EntityRow, useProjectionLink } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "#relay/__generated__/FormationRow_node.graphql.js";
import formatLength from "../formatLength.js";
import type { FormationRowProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/** The fields FormationRow reads from the Formation it renders. */
const declareNodeFragment = (): unknown => graphql`
  fragment FormationRow_node on Formation {
    __typename
    length
    _meta {
      title
      curie
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds formation-row";

/**
 * A formation as a 32px list entry: its name, linked to the formation's
 * page, and its length.
 *
 * Native props reach the root the EntityRow renders; a consumer
 * `className` merges after the projection's own, and the root carries the
 * typename as `data-type`.
 *
 * `import { FormationRow } from "./FormationRow/index.js";`
 *
 * @implements metro.component.formation_row
 * @note Impure: reads its formation from the Relay store, its home from the
 *   site's homes and its link from the projection provider.
 */
export default function FormationRow({
  node,
  className,
  ...props
}: FormationRowProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  return (
    <EntityRow
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      LinkComponent={LinkComponent}
      meta={formatLength(data.length)}
      title={title}
    />
  );
}
