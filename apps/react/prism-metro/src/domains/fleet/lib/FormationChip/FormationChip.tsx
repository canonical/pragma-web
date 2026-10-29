// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { EntityChip, useProjectionLink } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "#relay/__generated__/FormationChip_node.graphql.js";
import type { FormationChipProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/** The fields FormationChip reads from the Formation it renders. */
const declareNodeFragment = (): unknown => graphql`
  fragment FormationChip_node on Formation {
    __typename
    _meta {
      title
      curie
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds formation-chip";

/**
 * A formation as an inline mention: its name in the pill, linked to the
 * formation's page; a consumer's children replace the name.
 *
 * Native props reach the root the EntityChip renders; a consumer
 * `className` merges after the projection's own, and the root carries the
 * typename as `data-type`.
 *
 * `import { FormationChip } from "./FormationChip/index.js";`
 *
 * @implements metro.component.formation_chip
 * @note Impure: reads its formation from the Relay store, its home from the
 *   site's homes and its link from the projection provider.
 */
export default function FormationChip({
  node,
  children,
  className,
  ...props
}: FormationChipProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  return (
    <EntityChip
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      LinkComponent={LinkComponent}
      value={children ?? title}
    />
  );
}
